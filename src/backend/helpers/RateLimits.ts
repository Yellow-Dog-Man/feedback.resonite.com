import { rateLimiter } from "hono-rate-limiter";
import { FORM, LANDING } from "../../shared/FormHelpers";
import { FeedbackKVStore } from "../lib/FeedbackKVStore.js";
import { hmacSha256Hex } from "../services/hashService.js";
import type { AppContext, AppEnv } from "../types";
import { GetClientIp } from "./CloudflareHelpers";
import { isDev } from "./EnvHelpers";

//TODO: we should be using Cloudflare's built-in rate limits, but this only supports windows of 10 or 60 seconds right now.
// This is great for Bots and DDOS, but it is not ok for limits that have longer windows, which... filing a form does.
// See: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/#configuration

// So for now we use: https://honohub.dev/docs/rate-limiter/stores/cloudflare

// Make sure you add a KV binding:
// [[kv_namespaces]]
// binding = "RATE_LIMIT_KV"
// id = "your-namespace-id"

function getFormLimit(key: string, dev: boolean) {
	if (dev) return 100;

	// 4 (100 in DEV)
	if (key === LANDING) return 4;

	if (key === FORM) return 4;

	return 0;
}

export function getLimitSettings(cx: AppContext, key: string): LimitSettings {
	return {
		windowMs: 3_600_000, // 1 Hour
		limit: getFormLimit(key, isDev(cx.env)),
	};
}

// 4 forms in one Hour.
export function formLimiter(cx: AppContext) {
	return createLimiter(cx, keyMaker(FORM), getLimitSettings(cx, FORM));
}

// 4 landing in one hour
export function landingLimiter(cx: AppContext) {
	return createLimiter(cx, keyMaker(LANDING), getLimitSettings(cx, LANDING));
}

export async function GetRateLimitKey(c: AppContext, key: string) {
	return `${key}:${await hashClientIp(c)}`;
}

// Rate limit keys hold a keyed hash of the IP, never the IP itself, so KV
// doesn't store real addresses. A plain SHA-256 isn't enough, because every
// IPv4 address can be hashed in minutes, so the hash needs a secret.
async function hashClientIp(c: AppContext) {
	const secret = c.env.IP_HASH_SECRET ?? (isDev(c.env) ? "dev" : undefined);
	if (!secret) throw new Error("IP_HASH_SECRET is not set");
	return hmacSha256Hex(secret, GetClientIp(c));
}

const keyMaker = (key: string) => {
	return function keyGenerator(c: AppContext) {
		return GetRateLimitKey(c, key);
	};
};

const rateLimitMessage = {
	status: 429,
	message: "Rate Limit exceeded",
};

export type LimitSettings = {
	windowMs: number;
	limit: number;
};

type KeyGenerator = (c: AppContext) => Promise<string> | string;

function createLimiter(
	cx: AppContext,
	keyGenerator: KeyGenerator,
	settings: LimitSettings,
) {
	return rateLimiter<AppEnv>({
		windowMs: settings.windowMs,
		limit: settings.limit,
		skipFailedRequests: true,
		keyGenerator: keyGenerator,
		message: rateLimitMessage,
		store: new FeedbackKVStore({
			namespace: cx.env.RATE_LIMIT_KV,
		}),
	});
}
