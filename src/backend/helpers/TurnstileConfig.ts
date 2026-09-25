import type { Context } from "hono";
import { isDev } from "./EnvHelpers";
import type { Bindings } from "../../config";

const DEMO_TURNSTILE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_SITE_KEY = "0x4AAAAAAE_ffmknZb7xGGEe"; // NOT a secret

export function getTurnstileSecretKey(c: Context) {
	if (isDev(c.env)) return DEMO_TURNSTILE_KEY;

	return c.env.TURNSTILE_SECRET_KEY ?? DEMO_TURNSTILE_KEY;
}

export function getTurnstileSiteKey(env: Bindings) {
	if (isDev(env)) return DEMO_TURNSTILE_KEY;
	return TURNSTILE_SITE_KEY;
}
