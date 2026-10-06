// Schema
/*
- double1/double[0] => Score
- index1/index[0] => date
*/

import type { AppContext } from "../types";

export function saveScore(
	c: AppContext,
	bool: boolean,
	question: string = "happiness",
) {
	const score = boolToScore(bool);

	// Don't actually score in Dev, but log for testing.
	if (!c.env.SCORE) {
		console.log(`Recording a score of: ${score}`);
		return;
	}

	c.env.SCORE.writeDataPoint({
		doubles: [score],
		indexes: [question], //TODO: see Survey.md
	});
}

function boolToScore(b: boolean) {
	if (b === true) return 1;
	if (b === false) return -1;
	return 0;
}
const SCORE_QUERY = `
        SELECT 
            SUM(_sample_interval) AS total_events,
            SUM(_sample_interval * double1) / SUM(_sample_interval) AS average_score
        FROM SCORE`;
// Analytics Engine SQL API response, for SCORE_QUERY.
type ScoreQueryResult = {
	data?: {
		average_score?: number;
		total_events?: number;
		timestamp?: string;
	}[];
};

// Runs a query against the Analytics Engine SQL API and returns the parsed JSON.
// https://developers.cloudflare.com/analytics/analytics-engine/sql-api/
async function queryAnalyticsEngine<T>(env: Env, query: string): Promise<T> {
	const API = `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/analytics_engine/sql`;

	const response = await fetch(API, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.API_TOKEN}`,
			"Content-Type": "text/plain",
		},
		body: query,
	});

	if (!response.ok) {
		throw new Error(
			`Failed to query analytics engine: ${await response.text()}`,
		);
	}

	return response.json<T>();
}

// '1' DAY
//WHERE timestamp > NOW() - INTERVAL '1' DAY
// Without an interval, scores across all time.
export async function getScore(c: AppContext, interval?: string) {
	let query = SCORE_QUERY;
	if (interval !== undefined) {
		query = `${query} WHERE timestamp > NOW() - INTERVAL ${interval}`;
	}

	const result = await queryAnalyticsEngine<ScoreQueryResult>(c.env, query);

	const row = result.data && result.data.length > 0 ? result.data[0] : {};

	return {
		score: row.average_score ?? 0,
		totalEvents: row.total_events ?? 0,
		timestamp: row.timestamp ?? new Date().toISOString(),
	};
}

export async function dumpScore(c: AppContext) {
	return queryAnalyticsEngine<unknown>(c.env, `SELECT * FROM SCORE`);
}
