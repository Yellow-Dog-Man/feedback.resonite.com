import { Hono } from 'hono'
import { saveFeedbackText } from '../services/feedbackService.js'
import { BUG, FEATURE, MODERATION, SECURITY, LANDING, TEXT, VALID_FORMS } from '../helpers/FormHelpers.js';
import { saveScore } from '../services/scoreService.js';
import { SubmitToGitHub } from '../services/githubService.js';
import { formatIssue } from '../services/markdownTemplateService.js';
import { formLimiter, landingLimiter } from '../helpers/RateLimits.js';

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

apiApp.use('/'+LANDING, async(c, next) => {
  const limit = landingLimiter(c);
  return limit(c, next);
});
apiApp.post('/'+LANDING, async (c) => {
  const body = c.get('parsedBody');
  console.log(`Received LANDING form post:`, body)

  var res = await processLanding(c, body);
  if (res)
    return res;

  return c.json({
    success: true,
    message: `Successfully received submission for ${LANDING}`,
    receivedAt: new Date().toISOString(),
    formResult: body,
    ...addLandingMetadata(LANDING, body)
  });
});

apiApp.use('/:formType', async (c, next) => {
  const limit = formLimiter(c);
  return limit(c, next);
});
apiApp.post('/:formType', async (c) => {
  const formType = c.req.param('formType');
  try {
    const body = c.get('parsedBody');
    console.log(`Received form post [${formType}]:`, body)

    var gitHubResult = await processFormBodyForGitHub(c, formType, body);
    if (gitHubResult) {
      return c.json({
        success: true,
        message: `Successfully received submission for ${formType}`,
        receivedAt: new Date().toISOString(),
        formResult: body,
        number: gitHubResult.number,
        ...redirectTo(gitHubResult.url)
      });
    } else {
      // TODO: Handle Error
    }
  } catch (err) {
    console.error(`Error processing form post ${formType}:`, err)
    return c.json({ success: false, error: err.message }, 400)
  }
});

apiApp.get('/md', async (c) => {
  return c.body(formatIssue("bug", {description: "TEST DESCRIPTION"}));
});

// We need to signal to FormsMd/Frontend what to do on a completed form.
function redirectTo(location) {
  return {
    redirectTo: location
  }
}

function addLandingMetadata(formType, body) {
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

async function processFormBodyForGitHub(c, formType, body) {
  console.log("Form Type:" + formType);

  // Don't send Junk to GitHub
  if (!VALID_FORMS.includes(formType))
    return;

  console.log("Submitting to GH");
  // ALL Other forms use redirects and come back here, so far no processing
  return await SubmitToGitHub(c, formType, body);
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
