import { detect } from "tinyld";

// https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/
const TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";
const TARGET_LANG = "en";

// Languages m2m100 can translate from. tinyld can detect some that aren't
// here (e.g. "ber", "rn"), and passing those to the model throws.
// https://huggingface.co/facebook/m2m100_1.2B
export const SUPPORTED_LANGUAGES = new Set(
	"af am ar ast az ba be bg bn br bs ca ceb cs cy da de el en es et fa ff fi fr fy ga gd gl gu ha he hi hr ht hu hy id ig ilo is it ja jv ka kk km kn ko lb lg ln lo lt lv mg mk ml mn mr ms my ne nl no ns oc or pa pl ps pt ro ru sd si sk sl so sq sr ss su sv sw ta th tl tn tr uk ur uz vi wo xh yi yo zh zu".split(
		" ",
	),
);

export function isSupported(language) {
	if (language === null) return false;
	return SUPPORTED_LANGUAGES.has(language);
}

// Returns the English text, or null if the source language is unknown or
// one the model can't translate.
export async function translateToEnglish(ai, text, sourceLang) {
	if (!sourceLang || !SUPPORTED_LANGUAGES.has(sourceLang)) return null;
	if (sourceLang === TARGET_LANG) return text;

	if (!ai) throw new Error("AI is not setup correctly");
	const result = await ai.run(TRANSLATION_MODEL, {
		text,
		source_lang: sourceLang,
		target_lang: TARGET_LANG,
	});
	return result.translated_text ?? null;
}

// tinyld guesses badly on very short Latin text ("Cheese" → nl, "No pretzels"
// → ber). The cutoff is in UTF-8 bytes, not characters, so short CJK text
// (3 bytes a character, and detected reliably) still gets through.
const MIN_DETECT_BYTES = 12;
const encoder = new TextEncoder();

// tinyld returns an ISO 639-1 code, or "" when it isn't confident.
export function detectLanguage(text) {
	if (encoder.encode(text.trim()).length < MIN_DETECT_BYTES) return null;
	return detect(text) || null;
}
