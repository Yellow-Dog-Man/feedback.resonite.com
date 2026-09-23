import { rateLimiter } from "hono-rate-limiter";
import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";
import { FORM, LANDING } from "./FormHelpers";

//TODO: we should be using Cloudflares built-in rate limits, but this only supports windows of 10 or 60 seconds right now.
// This is great for Bots and DDOS, but it is not ok for limits that have longer windows, which... filing a form does.
// See: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/#configuration

// So for now we use: https://honohub.dev/docs/rate-limiter/stores/cloudflare

// Make sure you add a KV binding: 
// [[kv_namespaces]]
// binding = "RATE_LIMIT_KV"
// id = "your-namespace-id"

// 4 forms in one Hour.
export function formLimiter(cx) {
    return createLimiter(cx, keyMaker(FORM), getLimitSettings(cx, FORM));
}

// 4 landing in one hour
export function landingLimiter(cx) {
    return createLimiter(cx, keyMaker(LANDING), getLimitSettings(cx, LANDING));
}

const keyMaker = (key) => {
    return function keyGenerator(c) {
        return key + ":" + c.req.header("cf-connecting-ip") ?? ""
    }
}

const rateLimitMessage = {
    "status": 429,
    "message": "Rate Limit exceeded"
}

function getLimitSettings(cx, key) {
    return {
        windowMs: 3_600_000, // 1 Hour
        limit: isDev(cx.env) ? 100 : 4, // 4 (100 in DEV)
    }
}

function createLimiter(cx, keyGenerator, settings) {
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

function isDev(env) {
    return env.ENVIRONMENT === "development" || env.ENVIRONMENT === "dev" || !env.ENVIRONMENT;
}
