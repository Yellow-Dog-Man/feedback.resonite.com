import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { MODERATION_URL } from "../../config/index.js";
import { isDev } from "../helpers/EnvHelpers.js";
import {
	BUG,
	FEATURE,
	LANDING,
	MODERATION,
	SECURITY,
	TEXT,
	VALID_FORMS,
} from "../helpers/FormHelpers.js";
import { BadRequest } from "../helpers/HttpHelpers.js";
import { formLimiter, landingLimiter } from "../helpers/RateLimits.js";
import { getFormSchema } from "../helpers/ValidationSchemas.js";
import { turnstileMiddleware } from "../middleware/TurnstileMiddleware.js";
import { saveFeedbackText } from "../services/feedbackService.js";
import { SubmitToGitHub } from "../services/githubService.js";
import { uploadFileToR2 } from "../services/r2Service.js";
import { saveScore } from "../services/scoreService.js";
import { checkLimitsApp } from "./checkLimits.js";
import {anonymizeLogs, shouldAnonymizeLog} from "../services/logFilterService";
import { statsApp } from "./stats.js";

export const apiApp = new Hono();

// Apply turnstile middleware to all API POST routes
apiApp.use("*", turnstileMiddleware());

function isFile(value) {
	return value instanceof File || value instanceof Blob;
}

function handleValidationError(result, c) {
	if (!result.success) {
		return c.json(
			{
				success: false,
				error: "Validation failed",
				details: result.error.format(),
			},
			400,
		);
	}
}

const RECORD_ID_KEY = "_rid";

async function processFile(c, formBody, key, file, filePrefix) {
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
async function transformFormBody(rawBody, c) {
	const body = {};
	const files = [];
	for (const [key, value] of Object.entries(rawBody)) {
		if (value === "yes") body[key] = true;
		else if (value === "no") body[key] = false;
		else if (isFile(value)) {
			files.push(key);
		} else {
			body[key] = value;
		}
	}
	for (const key of files) {
		await processFile(c, body, key, rawBody[key], body[RECORD_ID_KEY] ?? "");
	}
	return body;
}

apiApp.use(`/${LANDING}`, async (c, next) => {
	const limit = landingLimiter(c);
	return limit(c, next);
});

apiApp.post(
	`/${LANDING}`,
	zValidator("form", getFormSchema(LANDING), (result, c) => {
		if (!result.success) return handleValidationError(result, c);
	}),
	async (c) => {
		const rawValidated = c.req.valid("form");
		const body = await transformFormBody(rawValidated, c);

		var res = await processLanding(c, body);
		if (res) return res;

		return c.json({
			success: true,
			message: `Successfully received submission for ${LANDING}`,
			receivedAt: new Date().toISOString(),
			formResult: body,
			...addLandingMetadata(body),
		});
	},
);

apiApp.use("/:formType", async (c, next) => {
	const limit = formLimiter(c);
	return limit(c, next);
});

apiApp.post(
	"/:formType",
	async (c, next) => {
		const formType = c.req.param("formType");
		const schema = getFormSchema(formType);
		if (!schema) {
			return next();
		}
		const validator = zValidator("form", schema, (result, c) => {
			if (!result.success) return handleValidationError(result, c);
		});
		return validator(c, next);
	},
	async (c) => {
		const formType = c.req.param("formType");
		try {
			const schema = getFormSchema(formType);
			const rawValidated = schema
				? c.req.valid("form")
				: await c.req.parseBody({ all: true });
			const body = await transformFormBody(rawValidated, c);
			const SUBMIT_TO_GITHUB = isDev(c.env);
			if (SUBMIT_TO_GITHUB) {
				const gitHubResult = await processFormBodyForGitHub(c, formType, body);
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
			return c.json({ success: false, error: err.message }, 400);
		}
	},
);

// Endpoint to check if the current user/IP is rate limited for forms or landing
apiApp.route("/checklimits", checkLimitsApp);

// Stats endpoints
apiApp.route("/stats", statsApp);

// We need to signal to FormsMd/Frontend what to do on a completed form.
function redirectTo(location) {
	return {
		redirectTo: location,
	};
}

function addLandingMetadata(body) {
	const redirectType = body.type;

	// This means they skipped to the end, just the +1 -1 feedback
	if (!body.more) return {};
	// This means we already have the feedback, we can bail as well
	if (body.redirectType === TEXT) return {};

	// For the rest, we need to redirect somewhere else.
	if (redirectType === BUG) return redirectTo("/bug");
	if (redirectType === FEATURE) return redirectTo("/feature");

	if (redirectType === MODERATION || redirectType === SECURITY)
		return redirectTo(MODERATION_URL);
}

async function processLanding(c, body) {
	saveScore(c, body.happiness);

	const date = new Date().toISOString();

	if (body.more && body.type === "text") {
		await saveFeedbackText(c.env.DB, body.feedback, date);
	}
}

async function processFormBodyForGitHub(c, formType, body) {
	// Don't send Junk to GitHub
	if (!VALID_FORMS.includes(formType)) return;

	// ALL Other forms use redirects and come back here, so far no processing
	return await SubmitToGitHub(c, formType, body);
}
