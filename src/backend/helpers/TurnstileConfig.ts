import type { AppContext } from "../types";
import { isDev } from "./EnvHelpers";

const DEMO_TURNSTILE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_SITE_KEY = "0x4AAAAAAE_ffmknZb7xGGEe"; // NOT a secret

// Only called outside dev, as TurnstileMiddleware skips verification in dev.
// Fails loudly rather than falling back to a key that rejects every token.
export function getTurnstileSecretKey(c: AppContext) {
	const secret = c.env.TURNSTILE_SECRET_KEY;
	if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not set");
	return secret;
}

export function getTurnstileSiteKey(env: Env) {
	if (isDev(env)) return DEMO_TURNSTILE_KEY;
	return TURNSTILE_SITE_KEY;
}
