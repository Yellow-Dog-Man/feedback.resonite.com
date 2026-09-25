import { Hono } from "hono";
import { cache } from "hono/cache";
import { getScore } from "../services/scoreService.js";

export const statsApp = new Hono();

// Cache happiness stats for 3 minutes (180 seconds) to prevent analytics query thrashing
statsApp.get(
	"/happiness",
	cache({
		cacheName: "feedback-happiness-stats",
		cacheControl: "max-age=180",
	}),
	async (c) => {
		const scoreOverall = await getScore(c);
		const scoreDaily = await getScore(c, "'1' DAY");
		const scoreHour = await getScore(c, "'1' HOUR");

		var res = {
			overall: scoreOverall,
			daily: scoreDaily,
			hourly: scoreHour,
		};
		return c.json(res);
	},
);
