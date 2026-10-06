import { Hono } from "hono";
import { logger } from "hono/logger";
import { apiApp } from "./routes/api.js";
import { pageApp } from "./routes/pages.tsx";
import { backfillTranslations } from "./services/feedbackService.js";

const app = new Hono();

app.use(logger());

app.route("/api", apiApp);
app.route("/", pageApp);

export default {
	fetch: app.fetch,
	// https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/
	async scheduled(_controller, env, ctx) {
		ctx.waitUntil(backfillTranslations(env));
	},
};
