// The feedback table is created by D1 migrations in /migrations.
// Run `npm run db:migrate:local` (dev) or `npm run db:migrate:remote` (prod).
export async function saveFeedbackText(db, body, date) {
	if (!db) throw new Error("DB is not setup correctly");
	try {
		await db
			.prepare(`INSERT INTO feedback (content, created_at) VALUES (?, ?)`)
			.bind(body, date)
			.run();
	} catch (dbErr) {
		console.error(`Error saving text to D1 database:`, dbErr);
	}
}
