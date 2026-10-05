-- Migration number: 0002 	 2026-10-03T00:00:00.000Z
-- Multi-language feedback support.
-- content_translated: English translation of content. Equal to content when the
--   feedback is already English. NULL means translation is pending, failed, or
--   the language could not be detected.
-- hash: SHA-256 hex of the original content.
-- language: ISO 639-1 code of the original content as detected by tinyld.
--   NULL when the language could not be detected.
ALTER TABLE feedback ADD COLUMN content_translated TEXT;
ALTER TABLE feedback ADD COLUMN hash TEXT;
ALTER TABLE feedback ADD COLUMN language TEXT;
CREATE INDEX IF NOT EXISTS idx_feedback_hash ON feedback (hash);
CREATE INDEX IF NOT EXISTS idx_feedback_language ON feedback (language);
