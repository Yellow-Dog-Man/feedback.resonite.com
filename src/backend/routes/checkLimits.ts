import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";
import { type Context, Hono } from "hono";
import type { ClientRateLimitInfo } from "hono-rate-limiter";
import { GetClientIp } from "../helpers/CloudflareHelpers.js";
import { FORM, LANDING } from "../helpers/FormHelpers.js";
import { GetRateLimitKey, getLimitSettings } from "../helpers/RateLimits.js";

export const checkLimitsApp = new Hono();

checkLimitsApp.get("/", async (c: Context) => {
	const store = new WorkersKVStore({
		namespace: c.env.RATE_LIMIT_KV,
	});

	const clientIp = GetClientIp(c);
	const formKey = GetRateLimitKey(c, FORM);
	const landingKey = GetRateLimitKey(c, LANDING);

	const formSettings = getLimitSettings(c, FORM);
	const landingSettings = getLimitSettings(c, LANDING);

	// Initialize store window settings required by WorkersKVStore
	store.init(formSettings as any); //TODO
	const formRecord = await store.get(formKey);

	store.init(landingSettings as any); //TODO
	const landingRecord = await store.get(landingKey);

	return c.json({
		success: true,
		clientIp,
		limits: {
			form: getStatus(formRecord, formSettings.limit),
			landing: getStatus(landingRecord, landingSettings.limit),
		},
	});
});

function getStatus(record: ClientRateLimitInfo | undefined, limit: number) {
	if (!record) {
		return {
			limited: false,
			hits: 0,
			limit: limit,
			remaining: limit,
			resetInMs: 0,
		};
	}

	const now = Date.now();
	const resetTime = record.resetTime
		? new Date(record.resetTime).getTime()
		: now;
	const expired = now >= resetTime;
	const hits = expired ? 0 : record.totalHits;
	const remaining = Math.max(0, limit - hits);
	const limited = !expired && hits >= limit;

	return {
		limited,
		hits,
		limit,
		remaining,
		resetInMs: expired ? 0 : Math.max(0, resetTime - now),
	};
}
