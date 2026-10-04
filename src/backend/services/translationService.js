import { detect } from "tinyld";

// https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/
const TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";
const TARGET_LANG = "en";

// Returns the English text, or null if the source language is unknown.
export async function translateToEnglish(ai, text, sourceLang) {
	if (!sourceLang) return null;
	if (sourceLang === TARGET_LANG) return text;

	if (!ai) throw new Error("AI is not setup correctly");
	const result = await ai.run(TRANSLATION_MODEL, {
		text,
		source_lang: sourceLang,
		target_lang: TARGET_LANG,
	});
	return result.translated_text ?? null;
}

// tinyld returns an ISO 639-1 code, or "" when it isn't confident.
export function detectLanguage(text) {
	return detect(body) || null;
}
