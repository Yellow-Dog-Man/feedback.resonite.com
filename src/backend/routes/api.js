import { Hono } from 'hono'
import { saveFeedbackText } from '../services/feedbackService.js'
import { BUG, FEATURE, MODERATION, SECURITY, LANDING, TEXT, VALID_FORMS } from '../helpers/FormHelpers.js';
import { saveScore } from '../services/scoreService.js';
import { SubmitToGitHub } from '../services/githubService.js';
import { formatIssue } from '../services/markdownTemplateService.js';

export const apiApp = new Hono();

// TODO: move middleware to helper file
// Middleware to parse body and convert yes/no to booleans
apiApp.use('/:formType', async (c, next) => {
  if (c.req.method === 'POST') {
    try {
      const body = await filterBody(c);
      c.set('parsedBody', body);
    } catch (err) {
      c.set('parsedBody', {});
    }
  }
  await next();
});

async function filterBody(c) {
  const rawBody = await c.req.parseBody();
  const body = {};
  for (const [key, value] of Object.entries(rawBody)) {
    if (value === 'yes') body[key] = true;
    else if (value === 'no') body[key] = false;
    else body[key] = value;
  }

  return body;
}

apiApp.get('/md', async (c) => {
  return c.body(formatIssue("bug", {description: "TEST DESCRIPTION"}));
})

apiApp.post('/:formType', async (c) => {
  const formType = c.req.param('formType');
  try {
    const body = c.get('parsedBody');
    console.log(`Received form post [${formType}]:`, body)

    await processBody(c, formType, body);

    return c.json({
      success: true,
      message: `Successfully received submission for ${formType}`,
      receivedAt: new Date().toISOString(),
      formResult: body,
      ...addSuccessMetadata(formType, body)
    });
  } catch (err) {
    console.error(`Error processing form post ${formType}:`, err)
    return c.json({ success: false, error: err.message }, 400)
  }
});

// We need to signal to FormsMd/Frontend what to do on a completed form.
function redirectTo(location) {
  return {
    redirectTo: location
  }
}

function addSuccessMetadata(formType, body) {
  const redirectType = body.type;
  if (formType === LANDING) {

    // This means they skipped to the end, just the +1 -1 feedback
    if (!body.more) return {};
    // This means we already have the feedback, we can bail as well
    if (body.redirectType == TEXT) return {};

    // For the rest, we need to redirect somewhere else.
    if (redirectType === BUG) return redirectTo("/bug");
    if (redirectType === FEATURE) return redirectTo("/feature");
    if (redirectType === MODERATION || redirectType === SECURITY) return redirectTo("https://moderation.resonite.com");
  }
}

async function processBody(c, formType, body) {
  console.log("Form Type:" + formType);
  if (formType === LANDING) await processLanding(c, body);

  // Don't send Junk to GitHub
  if (!VALID_FORMS.includes(formType))
    return;
  console.log("Submitting to GH");
  // ALL Other forms use redirects and come back here, so far no processing
  await SubmitToGitHub(c, formType, body);
}

async function processLanding(c, body) {
  saveScore(c, body.happiness);

  const date = new Date().toISOString();

  if (body.more && body.type === "text")
  {
    console.log("Saving feedback to DB");
    console.log(body.feedback);
    await saveFeedbackText(c.env.DB, body.feedback, date);
  }
}
