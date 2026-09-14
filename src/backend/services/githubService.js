// Easiest option here is their HTTP API SO....
import { BUG, FEATURE } from "../helpers/FormHelpers";
import { formatIssue } from "./markdownTemplateService.js";
import { containsEmail, containsProfanity } from "./filterService.js";
import { BadRequest } from "../helpers/HttpHelpers.js";

const USER_AGENT = "feedback.resonite.com"
const OWNER = "Yellow-Dog-Man";
const REPO = "Resonite-Issues";

const URL = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/issues";

const ISSUE_LABEL = "feedback.resonite.com";

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

    //TODO: Not ok. Log
    console.log(res);
    const body2 = await res.text();
    console.log(body2);
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
