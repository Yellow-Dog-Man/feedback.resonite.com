// Easiest option here is their HTTP API SO....
import { BUG, FEATURE } from "../helpers/FormHelpers";
import { formatIssue } from "./markdownTemplateService.js";

const OWNER = "Yellow-Dog-Man";
const REPO = "Resonite-Issues";
const URL = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/issues";


export async function SubmitToGitHub(c, formType, body) {
    const res = await fetch(URL, {
        method: "POST",
        body: JSON.stringify(convertToGitHub(formType, body)),
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "feedback.resonite.com",
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer " + c.env.GITHUB_TOKEN,
        }
    });
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

function convertToGitHub(formType, body) {
    const issue = {
        "title": body.issueTitle || body.title,
        "labels": getLabels(formType), 
        "body": formatIssue(formType, body)
    };

    return issue;
}
