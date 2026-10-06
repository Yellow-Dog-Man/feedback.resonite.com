import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";
import type { ClientRateLimitInfo } from "hono-rate-limiter";
import type { AppEnv } from "../types";

// The KV Store we use here is deprecated: https://honohub.dev/docs/rate-limiter/stores/cloudflare#workers-kv-store-legacy
// We should move to: https://unstorage.unjs.io/drivers/cloudflare#cloudflare-kv-binding

// Until then this patches, the legacy KV to remove a bug found on decrement as described.
// WorkersKVStore stores resetTime as JSON, so get() returns it as a string,
// but its decrement() calls resetTime.getTime(). That crashes every request
// skipFailedRequests tries to un-count. Turn it back into a Date on read.
export class FeedbackKVStore extends WorkersKVStore<AppEnv> {
	async get(key: string): Promise<ClientRateLimitInfo | undefined> {
		const record = await super.get(key);
		if (record?.resetTime) record.resetTime = new Date(record.resetTime);
		return record;
	}
}
