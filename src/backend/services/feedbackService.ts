import type { AppContext } from "../types";
import { sha256Hex } from "./hashService";
import {
	detectLanguage,
	isSupported,
	SUPPORTED_LANGUAGES,
	translateToEnglish,
} from "./translationService";

// A row of the feedback table (see /migrations).
export type FeedbackRow = {
	id: number;
	content: string;
	created_at: string;
	// NULL until translated, or when the language is unknown or unsupported.
	content_translated: string | null;
	// NULL when the language couldn't be detected.
	language: string | null;
	// NULL for rows saved before migration 0002, until the backfill runs.
	hash: string | null;
};

// The feedback table is created by D1 migrations in /migrations.
// Run `npm run db:migrate:local` (dev) or `npm run db:migrate:remote` (prod).

// date is an ISO string, as D1 can't bind Date objects.
export async function saveFeedbackText(
	c: AppContext,
	body: string,
	date: string,
) {
	const db = c.env.DB;
	if (!db) throw new Error("DB is not setup correctly");

	const language = detectLanguage(body);

	let rowId: number;
	try {
		const hash = await sha256Hex(body);
		const result = await db
			.prepare(
				`INSERT INTO feedback (content, created_at, hash, language) VALUES (?, ?, ?, ?)`,
			)
			.bind(body, date, hash, language)
			.run();

		rowId = result.meta.last_row_id;
	} catch (dbErr) {
		console.error(`Error saving text to D1 database:`, dbErr);
		return;
	}

	// Translate after the response is sent, so a slow or failing AI call
	// doesn't hold up the user or lose the original feedback.
	// https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil
	// Don't wait if we don't have a language
	if (isSupported(language))
		c.executionCtx.waitUntil(saveTranslation(c.env, rowId, body, language));
}

// This is disabled for now, because our Database is Backfilled.
const BACKFILL_BATCH_SIZE = 25;

// Run by the cron trigger. Fills in hash, language and translation for rows
// saved before migration 0002 (hash IS NULL), and retries translations that
// failed after a submission. Rows whose language couldn't be detected, or
// isn't one the model supports, are left with content_translated NULL and
// aren't picked up again.
export async function backfillTranslations(env: Env) {
	const { results } = await env.DB.prepare(
		`SELECT id, content, hash, language FROM feedback
		WHERE hash IS NULL
			OR (content_translated IS NULL
				AND language IN (SELECT value FROM json_each(?)))
		ORDER BY id LIMIT ?`,
	)
		.bind(JSON.stringify([...SUPPORTED_LANGUAGES]), BACKFILL_BATCH_SIZE)
		.all<FeedbackRow>();

	for (const row of results) {
		let language = row.language;
		if (row.hash === null) {
			const hash = await sha256Hex(row.content);
			language = detectLanguage(row.content);
			await env.DB.prepare(
				`UPDATE feedback SET hash = ?, language = ? WHERE id = ?`,
			)
				.bind(hash, language, row.id)
				.run();
		}
		await saveTranslation(env, row.id, row.content, language);
	}

	console.log(`Translation backfill processed ${results.length} rows`);
}

async function saveTranslation(
	env: Env,
	id: number,
	body: string,
	language: string | null,
) {
	try {
		const translated = await translateToEnglish(env.AI, body, language);
		if (translated === null) return;

		await env.DB.prepare(
			`UPDATE feedback SET content_translated = ? WHERE id = ?`,
		)
			.bind(translated, id)
			.run();
	} catch (err) {
		console.error(`Error translating feedback ${id}:`, err);
	}
}
