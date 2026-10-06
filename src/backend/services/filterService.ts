import {
	englishDataset,
	englishRecommendedTransformers,
	RegExpMatcher,
} from "obscenity";

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

export function containsProfanity(text: string) {
	if (matcher.hasMatch(text)) return true;

	return false;
}

export function containsEmail(text: string) {
	const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
	return emailPattern.test(text);
}

export async function filter(text: string) {
	return (await containsProfanity(text)) || (await containsEmail(text));
}
