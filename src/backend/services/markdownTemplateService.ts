import Mustache from "mustache";

// Every template in public/templates is bundled at build time, keyed by its
// lowercase file name (BUG.md => bug), so new templates need no code changes.
const templateFiles = import.meta.glob<string>(
	"../../../public/templates/*.md",
	{
		query: "?raw",
		import: "default",
		eager: true,
	},
);

const templates: Record<string, string> = Object.fromEntries(
	Object.entries(templateFiles).map(([path, template]) => [
		path.split("/").pop()?.replace(/\.md$/, "").toLowerCase(),
		template,
	]),
);

export function formatIssue(issueType: string, body: Record<string, unknown>) {
	const template = templates[issueType];

	if (!template) {
		throw new Error(`Template not found for issue type: ${issueType}`);
	}

	return Mustache.render(template, body);
}
