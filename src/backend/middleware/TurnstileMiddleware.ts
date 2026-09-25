import { verifyTurnstileToken } from "../services/turnstileService.js";
import { TURNSTILE_HEADER } from "../../frontend/turnstile.js";
import { getTurnstileSecretKey } from "../helpers/TurnstileConfig.js";
import { isDev } from "../helpers/EnvHelpers.js";
import { IP_HEADER } from "../helpers/CloudflareHelpers.js";
import type { Context, Next } from "hono";

export function turnstileMiddleware() {
	return async (c: Context, next: Next) => {
		// Only protect POST requests to API endpoints
		if (c.req.method !== "POST") {
			return await next();
		}

		if (isDev(c.env)) await next();

		const verification = await verifyTurnstileToken(
			getTurnstileSecretKey(c),
			c.req.header(TURNSTILE_HEADER),
			c.req.header(IP_HEADER),
		);
		if (!verification.success) {
			return c.json(
				{
					success: false,
					error:
						"Cloudflare Turnstile verification failed. Please complete the verification challenge.",
				},
				403,
			);
		}

		c.set("turnstile", true);
		c.set("attestation", verification.attestation);
		await next();
	};
}
