// Easiest option here is their HTTP API SO....
import { BUG, FEATURE } from "../helpers/FormHelpers";
import { formatIssue } from "./markdownTemplateService.js";
import { containsEmail, containsProfanity } from "./filterService.js";
import { BadRequest } from "../helpers/HttpHelpers.js";

const USER_AGENT = "feedback.resonite.com"
const OWNER = "Yellow-Dog-Man";
const REPO = "Resonite-Issues";

const URL = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/issues";

export async function SubmitToGitHub(c, formType, body) {
    const markdownBody = formatIssue(formType, body); // Create Markdown representation of issue

    if (containsProfanity(markdownBody)) {
        console.log("Watch your profanity");
        return BadRequest(c, "Issue contains profanity");
    }

    if (containsEmail(markdownBody)) {
        return BadRequest(c, "Issue contains an email address");
    }

    const res = await fetch(URL, {
        method: "POST",
        body: JSON.stringify(convertToGitHub(formType, markdownBody)),
        headers: {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer " + c.env.GITHUB_TOKEN,
        }
    });
    console.log(res);
    const body2 = await res.text();
    console.log(body2);
    // TODO: return the GH Issue number up the chain to immediately allow them to go see their issue.
}

// Map Us => GH labels
function getLabels(formType) {
    if (formType === BUG)
        return ["bug"];
    if (formType === FEATURE)
        return ["New Feature"];
}

// TODO: check for any additional items we can specify here
function convertToGitHub(formType, markdownBody) {
    const issue = {
        "title": body.issueTitle || body.title,
        "labels": getLabels(formType), 
        "body": markdownBody
    };

    return issue;
}
