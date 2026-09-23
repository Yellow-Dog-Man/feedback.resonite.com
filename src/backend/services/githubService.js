// Easiest option here is their HTTP API SO....
import { BUG, FEATURE } from "../helpers/FormHelpers";
import { formatIssue } from "./markdownTemplateService.js";
import { containsEmail, containsProfanity } from "./filterService.js";
import { BadRequest } from "../helpers/HttpHelpers.js";
import { FEEDBACK_DOMAIN } from "../../config/index.js";

const USER_AGENT = FEEDBACK_DOMAIN;


const URL = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO + "/issues";

const ISSUE_LABEL = FEEDBACK_DOMAIN;

export async function SubmitToGitHub(c, formType, body) {
    const markdownBody = formatIssue(formType, body); // Create Markdown representation of issue

    // TODO: filter should not be in this method or file.
    if (containsProfanity(markdownBody)) {
        console.log("Rejecting issue because it contains profanity");
        return BadRequest(c, "Issue contains profanity");
    }

    if (containsEmail(markdownBody)) {
        console.log("Rejecting issue because it contains an email address");
        return BadRequest(c, "Issue contains an email address");
    }

    const res = await fetch(URL, {
        method: "POST",
        body: JSON.stringify(convertToGitHub(formType, body, markdownBody)),
        headers: {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer " + c.env.GITHUB_TOKEN,
        }
    });

    // return issue number and link
    if (res.ok) {
        const obj = await res.json();
        return {
            url: obj.html_url,
            number: obj.number
        }
    }

    const body2 = await res.text();
}

// Map Us => GH labels
function getLabels(formType) {
    if (formType === BUG)
        return ["bug"];
    if (formType === FEATURE)
        return ["New Feature"];
}

// TODO: check for any additional items we can specify here
function convertToGitHub(formType, body, markdownBody) {
    const issue = {
        "title": body.issueTitle || body.title,
        "labels": [...getLabels(formType), ISSUE_LABEL],
        "body": markdownBody
    };

    return issue;
}
