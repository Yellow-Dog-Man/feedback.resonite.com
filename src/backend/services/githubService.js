// Easiest option here is their HTTP API SO....

import { BUG, FEATURE } from "../helpers/FormHelpers";

const OWNER = "Yellow-Dog-Man";
const REPO = "Resonite-Issues";
const URL = "https://api.github.com/repos/" + OWNER + "/" + REPO;


export async function SubmitToGitHub(c, formType, body) {
    await fetch(URL, {
        method: "POST",
        body: JSON.stringify(convertToGitHub(formType, body)),
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "feedback.resonite.com",
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer " + c.env.TOKEN,
        }
    });
}

// Map Us => GH labels
function getLabels(formType) {
    if (formType === BUG)
        return ["bug"];
    if (formType === FEATURE)
        return ["New Feature"];
}

function convertToGitHub(formType, body) {
    const issue = {
        "title": body.title,
        "labels": getLabels(formType), 
        "body": formatBody(body)
    };

    return issue;
}

function formatBody(formType, body) {
    //TODO: probably MARKDOWN??
    return JSON.stringify(body);
}

// POST https://api.github.com/repos/{owner}/{repo}/issues

// Headers:
//   Authorization: Bearer <token>
//   Accept: application/vnd.github+json
//   X-GitHub-Api-Version: 2022-11-28
//   User-Agent: <something identifying your worker>
//   Content-Type: application/json

// Body (JSON):
//   {
//     "title": "string, required",
//     "body": "string, optional",
//     "labels": ["optional", "array", "of", "strings"],
//     "assignees": ["optional", "usernames"]
//   }