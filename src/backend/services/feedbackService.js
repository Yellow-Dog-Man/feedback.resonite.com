
import { sha256Hex } from "./hashService";
import { translateToEnglish, detectLanguage } from "./translationService";

// The feedback table is created by D1 migrations in /migrations.
// Run `npm run db:migrate:local` (dev) or `npm run db:migrate:remote` (prod).

export async function saveFeedbackText(c, body, date) {
	const db = c.env.DB;
	if (!db) throw new Error("DB is not setup correctly");

	const language = detectLanguage(body);

	let rowId;
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
	c.executionCtx.waitUntil(saveTranslation(c.env, rowId, body, language));
}

async function saveTranslation(env, id, body, language) {
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
