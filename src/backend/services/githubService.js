// Easiest option here is their HTTP API SO....

import { FEEDBACK_DOMAIN, REPO, REPO_OWNER } from "../../config/index.js";
import { BUG, FEATURE } from "../helpers/FormHelpers";
import { BadRequest } from "../helpers/HttpHelpers.js";
import { containsEmail, containsProfanity } from "./filterService.js";
import { formatIssue } from "./markdownTemplateService.js";

const USER_AGENT = FEEDBACK_DOMAIN;

const URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO}/issues`;

const ISSUE_LABEL = FEEDBACK_DOMAIN;

export async function SubmitToGitHub(c, formType, body) {
	if (c.env.GITHUB_TOKEN === undefined)
		return TemporaryError("Github Not Setup");

	const markdownBody = formatIssue(formType, body); // Create Markdown representation of issue

	// TODO: filter should not be in this method or file.
	if (containsProfanity(markdownBody)) {
		return BadRequest(c, "Issue contains profanity");
	}

	if (containsEmail(markdownBody)) {
		return BadRequest(c, "Issue contains an email address");
	}

	const res = await fetch(URL, {
		method: "POST",
		body: JSON.stringify(convertToGitHub(formType, body, markdownBody)),
		headers: {
			"Content-Type": "application/json",
			"User-Agent": USER_AGENT,
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${c.env.GITHUB_TOKEN}`,
		},
	});

	// return issue number and link
	if (res.ok) {
		const obj = await res.json();
		return {
			url: obj.html_url,
			number: obj.number,
		};
	}

	const githubJson = await res.json();
	if (githubJson.status === 401) return TemporaryError("Github Not Setup");
}

// Map Us => GH labels
function getLabels(formType) {
	if (formType === BUG) return ["bug"];
	if (formType === FEATURE) return ["New Feature"];
}

// TODO: check for any additional items we can specify here
function convertToGitHub(formType, body, markdownBody) {
	const issue = {
		title: body.issueTitle || body.title,
		labels: [...getLabels(formType), ISSUE_LABEL],
		body: markdownBody,
	};

	return issue;
}
