import { Hono } from "hono";
import { cache } from "hono/cache";
import { getScore } from "../services/scoreService";
import type { AppEnv } from "../types";

export const statsApp = new Hono<AppEnv>();

// Cache happiness stats for 3 minutes (180 seconds) to prevent analytics query thrashing
statsApp.get(
	"/happiness",
	cache({
		cacheName: "feedback-happiness-stats",
		cacheControl: "max-age=180",
	}),
	async (c) => {
		// The queries don't depend on each other, so run them in parallel.
		const [overall, daily, hourly] = await Promise.all([
			getScore(c),
			getScore(c, "'1' DAY"),
			getScore(c, "'1' HOUR"),
		]);

		return c.json({ overall, daily, hourly });
	},
);
