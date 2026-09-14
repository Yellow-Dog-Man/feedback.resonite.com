import { rateLimiter } from "hono-rate-limiter";
import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";

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
    return rateLimiter({
        windowMs: 3_600_000, // 1 Hour
        limit: isDev(cx.env) ? 100 : 4, // 4 (100 in DEV)
        keyGenerator: (c) => "form:" + c.req.header("cf-connecting-ip") ?? "",
        store: new WorkersKVStore({
            namespace: cx.env.RATE_LIMIT_KV,
        }),
    });
}

// 4 landing in one hour
export function landingLimiter(cx) {
    return rateLimiter({
        windowMs: 3_600_000, // 1 Hour
        limit: isDev(cx.env) ? 100 : 4, // 4 (100 in DEV)
        keyGenerator: (c) => "landing:" + c.req.header("cf-connecting-ip") ?? "",
        store: new WorkersKVStore({
            namespace: cx.env.RATE_LIMIT_KV,
        }),
    });
}

// This shouldn't change in between environments.
// I mean it might
// TODO: rethink this, it was late and I wanted more limits lol
let cachedDev = null;
function isDev(env) {
    if (cachedDev == null)
    {
        cachedDev = env.ENVIRONMENT === "development" || env.ENVIRONMENT === "dev" || !env.ENVIRONMENT;
    }
    return cachedDev;
}

