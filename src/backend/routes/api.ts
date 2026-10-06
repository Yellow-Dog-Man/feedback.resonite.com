import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { z } from "zod";
import { MODERATION_URL } from "../../config/index";
import {
	BUG,
	FEATURE,
	LANDING,
	MODERATION,
	SECURITY,
	TEXT,
	VALID_FORMS,
} from "../../shared/FormHelpers";
import { shouldSubmitToGitHub } from "../helpers/EnvHelpers";
import { BadRequest } from "../helpers/HttpHelpers";
import { formLimiter, landingLimiter } from "../helpers/RateLimits";
import { getFormSchema, landingSchema } from "../helpers/ValidationSchemas";
import { turnstileMiddleware } from "../middleware/TurnstileMiddleware";
import { saveFeedbackText } from "../services/feedbackService";
import { containsEmail, containsProfanity } from "../services/filterService";
import { SubmitToGitHub } from "../services/githubService";
import { sha256Hex } from "../services/hashService";
import {
	anonymizeLogs,
	shouldAnonymizeLog,
} from "../services/logFilterService";
import { uploadFileToR2 } from "../services/r2Service";
import { saveScore } from "../services/scoreService";
import type { AppContext, AppEnv } from "../types";
import { checkLimitsApp } from "./checkLimits";
import { statsApp } from "./stats";

export const apiApp = new Hono<AppEnv>();

// Apply turnstile middleware to all API POST routes
apiApp.use("*", turnstileMiddleware());

// Endpoint to check if the current user/IP is rate limited for forms or landing
apiApp.route("/checklimits", checkLimitsApp);
// Stats endpoints
apiApp.route("/stats", statsApp);

// A validated form after transformFormBody: "yes"/"no" are booleans and file
// fields hold their R2 URL.
type FormBody = Record<string, unknown>;

type LandingBody = {
	happiness: boolean;
	more: boolean;
	type?: string;
	feedback?: string | null;
};

// FormData values are only ever strings or Files (Blobs are wrapped as Files).
function isFile(value: unknown): value is File {
	return value instanceof File;
}

// Takes any Context, as the zValidator hook's context isn't typed with AppEnv.
function validationError(c: Context, error: z.core.$ZodError) {
	return c.json(
		{
			success: false,
			error: "Validation failed",
			// Same shape as error.format(), which the frontend unwraps.
			details: z.formatError(error),
		},
		400,
	);
}

const RECORD_ID_KEY = "_rid";
const HASHED_RECORD_ID_KEY = "hashedRid";

async function processFile(
	c: AppContext,
	formBody: FormBody,
	key: string,
	file: File,
	filePrefix: string,
) {
	if (c.env.BUCKET && file.size > 0) {
		try {
			if (shouldAnonymizeLog(file.name, formBody)) {
				file = await anonymizeLogs(file);
			}
			const r2Key = await uploadFileToR2(c.env.BUCKET, filePrefix, file);
			formBody[key] = r2Key;
			formBody[`${key}_name`] = file.name;
		} catch (uploadErr) {
			console.error(`Failed to upload file for ${key}:`, uploadErr);
			formBody[key] = null;
		}
	} else {
		formBody[key] = null;
	}
}

// Helper to pre-process parsed form body values (booleans, files)
async function transformFormBody(
	rawBody: Record<string, unknown>,
	c: AppContext,
): Promise<FormBody> {
	const body: FormBody = {};
	const files: [string, File][] = [];
	// Groups this submission's uploads in R2. Empty means each file gets a random ID.
	let filePrefix = "";
	for (const [key, value] of Object.entries(rawBody)) {
		if (value === "yes") body[key] = true;
		else if (value === "no") body[key] = false;
		else if (isFile(value)) {
			files.push([key, value]);
		} else if (key === RECORD_ID_KEY) {
			// Hash the incoming _rid from Forms.md, this prevents it from being edited by the client.
			filePrefix = await sha256Hex(String(value));
			body[HASHED_RECORD_ID_KEY] = filePrefix;
		} else {
			body[key] = value;
		}
	}

	for (const [key, file] of files) {
		await processFile(c, body, key, file, filePrefix);
	}
	return body;
}

apiApp.use(`/${LANDING}`, async (c, next) => {
	const limit = landingLimiter(c);
	return limit(c, next);
});

apiApp.post(
	`/${LANDING}`,
	zValidator("form", landingSchema, (result, c) => {
		if (!result.success) return validationError(c, result.error);
	}),
	async (c) => {
		const rawValidated = c.req.valid("form");
		const body = await transformFormBody(rawValidated, c);

		const res = await processLanding(c, body as LandingBody);
		if (res) return res;

		return c.json({
			success: true,
			message: `Successfully received submission for ${LANDING}`,
			receivedAt: new Date().toISOString(),
			formResult: body,
			...addLandingMetadata(body as LandingBody),
		});
	},
);

apiApp.use("/:formType", async (c, next) => {
	const limit = formLimiter(c);
	return limit(c, next);
});

apiApp.post("/:formType", async (c) => {
	const formType = c.req.param("formType");

	// The schema depends on the route param, so validate here rather than with
	// zValidator. parseBody({ all: true }) parses the form the same way it does.
	const parsed = getFormSchema(formType).safeParse(
		await c.req.parseBody({ all: true }),
	);
	if (!parsed.success) return validationError(c, parsed.error);

	try {
		const body = await transformFormBody(parsed.data, c);
		const SUBMIT_TO_GITHUB = shouldSubmitToGitHub(c.env);
		if (SUBMIT_TO_GITHUB) {
			const gitHubResult = await processFormBodyForGitHub(c, formType, body);
			// SubmitToGitHub returns an error Response (e.g. profanity, not setup) when it rejects a submission
			if (gitHubResult instanceof Response) return gitHubResult;
			if (gitHubResult) {
				const finalResult = {
					success: true,
					message: `Successfully received submission for ${formType}`,
					receivedAt: new Date().toISOString(),
					formResult: body,
					number: gitHubResult.number,
					...redirectTo(gitHubResult.url),
				};
				return c.json(finalResult);
			} else {
				return BadRequest(c, "Github was unhappy, check logs");
			}
		} else {
			return c.json({
				success: true,
				message: "In testing mode",
				...redirectTo("/cheese"),
			});
		}
	} catch (err) {
		console.error(`Error processing form post ${formType}:`, err);
		const message = err instanceof Error ? err.message : String(err);
		return c.json({ success: false, error: message }, 400);
	}
});

// We need to signal to FormsMd/Frontend what to do on a completed form.
function redirectTo(location: string) {
	return {
		redirectTo: location,
	};
}

function addLandingMetadata(body: LandingBody) {
	const redirectType = body.type;

	// This means they skipped to the end, just the +1 -1 feedback
	if (!body.more) return {};
	// This means we already have the feedback, we can bail as well
	if (redirectType === TEXT) return {};

	// For the rest, we need to redirect somewhere else.
	if (redirectType === BUG) return redirectTo("/bug");
	if (redirectType === FEATURE) return redirectTo("/feature");

	if (redirectType === MODERATION || redirectType === SECURITY)
		return redirectTo(MODERATION_URL);

	return {};
}

async function processLanding(c: AppContext, body: LandingBody) {
	saveScore(c, body.happiness);

	const date = new Date().toISOString();

	// feedback is optional in the schema, so there's nothing to check or save
	// when it's missing or empty.
	if (body.more && body.type === TEXT && body.feedback) {
		if (containsProfanity(body.feedback)) {
			return BadRequest(c, "Issue contains profanity");
		}

		if (containsEmail(body.feedback)) {
			return BadRequest(c, "Issue contains an email address");
		}
		await saveFeedbackText(c, body.feedback, date);
	}
}

async function processFormBodyForGitHub(
	c: AppContext,
	formType: string,
	body: FormBody,
) {
	// Don't send Junk to GitHub
	if (!VALID_FORMS.includes(formType)) return;

	// ALL Other forms use redirects and come back here, so far no processing
	return await SubmitToGitHub(c, formType, body);
}
