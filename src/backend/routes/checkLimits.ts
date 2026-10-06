import { Hono } from "hono";
import type { ClientRateLimitInfo } from "hono-rate-limiter";
import { FORM, LANDING } from "../../shared/FormHelpers.js";
import { GetClientIp } from "../helpers/CloudflareHelpers.js";
import { GetRateLimitKey, getLimitSettings } from "../helpers/RateLimits.js";
import { FeedbackKVStore } from "../lib/FeedbackKVStore.js";
import type { AppEnv } from "../types";

export const checkLimitsApp = new Hono<AppEnv>();

checkLimitsApp.get("/", async (c) => {
	const store = new FeedbackKVStore({
		namespace: c.env.RATE_LIMIT_KV,
	});

	const clientIp = GetClientIp(c);
	const formKey = await GetRateLimitKey(c, FORM);
	const landingKey = await GetRateLimitKey(c, LANDING);

	const formSettings = getLimitSettings(c, FORM);
	const landingSettings = getLimitSettings(c, LANDING);

	const formRecord = await store.get(formKey);
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
