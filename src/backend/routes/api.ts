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
import { BadRequest, TemporaryError } from "../helpers/HttpHelpers";
import { formLimiter, landingLimiter } from "../helpers/RateLimits";
import { getFormSchema, landingSchema } from "../helpers/ValidationSchemas";
import { turnstileMiddleware } from "../middleware/TurnstileMiddleware";
import {
	type Attachments,
	checkAttachments,
	uploadAttachments,
} from "../services/attachmentService";
import { saveFeedbackText } from "../services/feedbackService";
import { containsEmail, containsProfanity } from "../services/filterService";
import { isGitHubSetup, SubmitToGitHub } from "../services/githubService";
import { sha256Hex } from "../services/hashService";
import { formatIssue } from "../services/markdownTemplateService";
import { deleteFromR2 } from "../services/r2Service";
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

// A validated form after transformFormBody: "yes"/"no" are booleans. File
// fields get their R2 URL from uploadAttachments, once every check has passed.
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

// Helper to pre-process parsed form body values (booleans, record ID). Files
// are returned separately and not uploaded yet.
async function transformFormBody(rawBody: Record<string, unknown>) {
	const body: FormBody = {};
	const files: Attachments = [];
	// Groups this submission's uploads in R2. Empty means each file gets a random ID.
	let filePrefix = "";
	for (const [key, value] of Object.entries(rawBody)) {
		if (value === "yes") body[key] = true;
		else if (value === "no") body[key] = false;
		else if (isFile(value)) {
			// An optional file input that was left empty.
			if (value.size > 0) files.push([key, value]);
			else body[key] = null;
		} else if (key === RECORD_ID_KEY) {
			// Hash the incoming _rid from Forms.md, this prevents it from being edited by the client.
			filePrefix = await sha256Hex(String(value));
			body[HASHED_RECORD_ID_KEY] = filePrefix;
		} else {
			body[key] = value;
		}
	}
	return { body, files, filePrefix };
}

// Profanity and email checks on everything that ends up in the issue. Files
// aren't uploaded yet, so this renders the issue without them and adds their
// names, which the issue also shows. The title isn't in the template, as it's
// sent to GitHub separately, so it's added too.
function checkIssueContent(
	c: AppContext,
	formType: string,
	body: FormBody,
	files: Attachments,
) {
	const text = [
		String(body.issueTitle ?? body.title ?? ""),
		formatIssue(formType, body),
		...files.map(([, file]) => file.name),
	].join("\n");

	if (containsProfanity(text)) return BadRequest(c, "Issue contains profanity");
	if (containsEmail(text))
		return BadRequest(c, "Issue contains an email address");
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
		const { body } = await transformFormBody(rawValidated);

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

	// Don't send Junk to GitHub
	if (!VALID_FORMS.includes(formType)) return BadRequest(c, "Unknown form");

	// Checks run cheapest first, and nothing is uploaded until they all pass,
	// so a rejected submission doesn't leave files in R2.
	let uploadedKeys: string[] = [];
	try {
		const { body, files, filePrefix } = await transformFormBody(parsed.data);
		const submitToGitHub = shouldSubmitToGitHub(c.env);
		if (submitToGitHub && !isGitHubSetup(c.env))
			return TemporaryError(c, "Github Not Setup");

		const blocked = checkIssueContent(c, formType, body, files);
		if (blocked) return blocked;

		const checkedFiles = await checkAttachments(files);
		if (typeof checkedFiles === "string") return BadRequest(c, checkedFiles);

		// Testing mode runs every check, but doesn't upload or create an issue.
		if (!submitToGitHub) {
			return c.json({
				success: true,
				message: "In testing mode",
				...redirectTo("/cheese"),
			});
		}

		uploadedKeys = await uploadAttachments(
			c.env.BUCKET,
			body,
			checkedFiles,
			filePrefix,
		);
		const gitHubResult = await SubmitToGitHub(c, formType, body);
		// SubmitToGitHub returns an error Response (e.g. not setup) when it rejects a submission
		if (gitHubResult instanceof Response || !gitHubResult) {
			await deleteFromR2(c.env.BUCKET, uploadedKeys);
			return gitHubResult instanceof Response
				? gitHubResult
				: BadRequest(c, "Github was unhappy, check logs");
		}

		return c.json({
			success: true,
			message: `Successfully received submission for ${formType}`,
			receivedAt: new Date().toISOString(),
			formResult: body,
			number: gitHubResult.number,
			...redirectTo(gitHubResult.url),
		});
	} catch (err) {
		console.error(`Error processing form post ${formType}:`, err);
		await deleteFromR2(c.env.BUCKET, uploadedKeys);
		const message = `Error processing form post for ${formType}`;
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
