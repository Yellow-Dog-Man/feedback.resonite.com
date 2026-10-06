// Based on: https://github.com/gr2m/cloudflare-worker-github-app-example which is Copyright (c) 2020 Gregor Martynus
// Authenticates as a GitHub App.
// Better than being a PAT, and also allows us to expand this later to other matters.

import { App } from "@octokit/app";
import type { Octokit } from "@octokit/core";
import { FEEDBACK_DOMAIN, REPO, REPO_OWNER } from "../../config/index.js";
import { BUG, FEATURE } from "../../shared/FormHelpers.js";
import { TemporaryError } from "../helpers/HttpHelpers.js";
import type { AppContext } from "../types.js";
import { formatIssue } from "./markdownTemplateService.js";

const ISSUE_LABEL = FEEDBACK_DOMAIN;

export function isGitHubSetup(env: Env) {
	return (
		env.GITHUB_APP_ID !== undefined && env.GITHUB_PRIVATE_KEY !== undefined
	);
}

// Callers check the content for profanity and email addresses first, before
// uploading any files, so a rejected submission doesn't leave uploads behind.
export async function SubmitToGitHub(
	c: AppContext,
	formType: string,
	body: Record<string, unknown>,
) {
	if (!isGitHubSetup(c.env)) return TemporaryError(c, "Github Not Setup");

	const markdownBody = formatIssue(formType, body); // Create Markdown representation of issue

	try {
		const octokit = await getOctokit(c.env);
		const { data } = await octokit.request(
			"POST /repos/{owner}/{repo}/issues",
			{
				owner: REPO_OWNER,
				repo: REPO,
				...convertToGitHub(formType, body, markdownBody),
			},
		);

		// return issue number and link
		return {
			url: data.html_url,
			number: data.number,
		};
	} catch (error: unknown) {
		console.error("GitHub issue creation failed:", error);

		// Octokit throws a RequestError with the HTTP status of the failed call.
		if (getErrorStatus(error) === 401)
			return TemporaryError(c, "Github Not Setup");
	}
}

function getErrorStatus(error: unknown) {
	if (typeof error === "object" && error !== null && "status" in error)
		return error.status;
}

let _octokit: Octokit | null = null;
async function getOctokit(env: Env) {
	if (_octokit === null) _octokit = await getInstallationOctokit(env);

	return _octokit;
}

// Get an Octokit authenticated as the App's installation on the issues repo
async function getInstallationOctokit(env: Env) {
	const app = new App({
		appId: env.GITHUB_APP_ID,
		privateKey: env.GITHUB_PRIVATE_KEY,
	});

	const { data: installation } = await app.octokit.request(
		"GET /repos/{owner}/{repo}/installation",
		{ owner: REPO_OWNER, repo: REPO },
	);

	return app.getInstallationOctokit(installation.id);
}

// Map Us => GH labels
function getLabels(formType: string): string[] {
	if (formType === BUG) return ["bug"];
	if (formType === FEATURE) return ["New Feature"];
	return [];
}

function isAnonymous(reporter: unknown) {
	return typeof reporter !== "string" || reporter.length === 0;
}

// TODO: check for any additional items we can specify here
function convertToGitHub(
	formType: string,
	body: Record<string, unknown>,
	markdownBody: string,
) {
	const labels = [...getLabels(formType), ISSUE_LABEL];

	const anonymous = isAnonymous(body.reporter);
	if (anonymous) labels.push("Anonymous");

	// Only bug and feature forms have a title. Without one GitHub rejects the
	// issue, so fail here rather than make the API call.
	const title = body.issueTitle || body.title;
	if (typeof title !== "string") {
		throw new Error(`No issue title for ${formType} submission`);
	}

	const issue = {
		title,
		labels: labels,
		body: markdownBody,
	};

	return issue;
}
