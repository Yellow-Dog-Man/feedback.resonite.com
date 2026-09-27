export async function saveFeedbackText(db, body, date) {
	if (!db) 
		throw new Error("DB is not setup correctly");
	try {
		await createFeedbackTable(db);
		await db
			.prepare(`INSERT INTO feedback (content, created_at) VALUES (?, ?)`)
			.bind(body, date)
			.run();
	} catch (dbErr) {
		console.error(`Error saving text to D1 database:`, dbErr);
	}
}

const CREATE_SQL = `CREATE TABLE IF NOT EXISTS feedback (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	content TEXT NOT NULL,
	created_at TEXT NOT NULL)`;

async function createFeedbackTable(db) {
	// Automatically create the table if it doesn't exist yet
	// Keep this in sync with the schema folder.
	// TODO: ORM, like Drizzle or something?
	await db.prepare(CREATE_SQL).run();
}
