-- Migration number: 0001 	 2026-10-03T00:00:00.000Z
-- IF NOT EXISTS so this applies cleanly to databases where the table was
-- already created at runtime by the old feedbackService code.
CREATE TABLE IF NOT EXISTS feedback (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	content TEXT NOT NULL,
	created_at TEXT NOT NULL
);
