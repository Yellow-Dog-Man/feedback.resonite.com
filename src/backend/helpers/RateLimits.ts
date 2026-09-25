import { rateLimiter } from "hono-rate-limiter";
import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";
import { FORM, LANDING } from "./FormHelpers";
import { isDev } from "./EnvHelpers";
import { GetClientIp } from "./CloudflareHelpers";
import { Context } from "hono";

//TODO: we should be using Cloudflares built-in rate limits, but this only supports windows of 10 or 60 seconds right now.
// This is great for Bots and DDOS, but it is not ok for limits that have longer windows, which... filing a form does.
// See: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/#configuration

// So for now we use: https://honohub.dev/docs/rate-limiter/stores/cloudflare

// Make sure you add a KV binding:
// [[kv_namespaces]]
// binding = "RATE_LIMIT_KV"
// id = "your-namespace-id"

// 4 forms in one Hour.
export function formLimiter(cx: Context) {
	return createLimiter(cx, keyMaker(FORM), getLimitSettings(cx, FORM));
}

// 4 landing in one hour
export function landingLimiter(cx: Context) {
	return createLimiter(cx, keyMaker(LANDING), getLimitSettings(cx, LANDING));
}

export function GetRateLimitKey(c: Context, key: string) {
	return key + ":" + GetClientIp(c);
}

const keyMaker = (key: string) => {
	return function keyGenerator(c: Context) {
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

export function getLimitSettings(cx: Context, key: string): LimitSettings {
	return {
		windowMs: 3_600_000, // 1 Hour
		limit: isDev(cx.env) ? 100 : 4, // 4 (100 in DEV)
	};
}

type KeyGenerator = (c: Context) => Promise<string> | string;

function createLimiter(
	cx: Context,
	keyGenerator: KeyGenerator,
	settings: LimitSettings,
) {
	return rateLimiter({
		windowMs: settings.windowMs,
		limit: settings.limit,
		keyGenerator: keyGenerator,
		message: rateLimitMessage,
		store: new WorkersKVStore({
			namespace: cx.env.RATE_LIMIT_KV,
		}),
	});
}
