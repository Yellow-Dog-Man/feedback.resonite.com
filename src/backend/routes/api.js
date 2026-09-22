import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { saveFeedbackText } from '../services/feedbackService.js'
import { BUG, FEATURE, MODERATION, SECURITY, LANDING, TEXT, VALID_FORMS } from '../helpers/FormHelpers.js';
import { dumpScore, getScore, saveScore } from '../services/scoreService.js';
import { SubmitToGitHub } from '../services/githubService.js';
import { formatIssue } from '../services/markdownTemplateService.js';
import { formLimiter, landingLimiter } from '../helpers/RateLimits.js';
import { uploadFileToR2 } from '../services/r2Service.js';
import { turnstileMiddleware } from '../helpers/TurnstileMiddleware.js';
import { getFormSchema } from '../helpers/ValidationSchemas.js';

export const apiApp = new Hono();

// Apply turnstile middleware to all API POST routes
apiApp.use('*', turnstileMiddleware());

function isFile(value){
  return value instanceof File || value instanceof Blob;
}

const RECORD_ID_KEY = "_rid";

async function processFile(c, body, key, value, filePrefix) {
  if (c.env.BUCKET && value.size > 0) {
      try {
        const r2Key = await uploadFileToR2(c.env.BUCKET, filePrefix, value);
        body[key] = r2Key;
        body[`${key}_name`] = value.name;
      } catch (uploadErr) {
        console.error(`Failed to upload file for ${key}:`, uploadErr);
        body[key] = null;
      }
  } else {
    body[key] = null;
  }
}

// Helper to pre-process parsed form body values (booleans, files)
async function transformFormBody(rawBody, c) {
  const body = {};
  const files = [];
  for (const [key, value] of Object.entries(rawBody)) {
    if (value === 'yes') body[key] = true;
    else if (value === 'no') body[key] = false;
    else if (isFile(value)) {
      files.push(key);
    } else {
      body[key] = value;
    }
  }
  for (const key of files) {
    await processFile(c, body, key, rawBody[key], body[RECORD_ID_KEY] ?? "");
  }
  return body;
}

apiApp.use('/'+LANDING, async(c, next) => {
  const limit = landingLimiter(c);
  return limit(c, next);
});

apiApp.post(
  '/' + LANDING,
  zValidator('form', getFormSchema(LANDING), (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: "Validation failed",
        details: result.error.format()
      }, 400);
    }
  }),
  async (c) => {
    const rawValidated = c.req.valid('form');
    const body = await transformFormBody(rawValidated, c);
    console.log(`Received LANDING form post:`, body);

    var res = await processLanding(c, body);
    if (res)
      return res;

    return c.json({
      success: true,
      message: `Successfully received submission for ${LANDING}`,
      receivedAt: new Date().toISOString(),
      formResult: body,
      ...addLandingMetadata(body)
    });
  }
);


apiApp.use('/:formType', async (c, next) => {
  const limit = formLimiter(c);
  return limit(c, next);
});

apiApp.post(
  '/:formType',
  async (c, next) => {
    const formType = c.req.param('formType');
    const schema = getFormSchema(formType);
    if (!schema) {
      return next();
    }
    const validator = zValidator('form', schema, (result, c) => {
      if (!result.success) {
        return c.json({
          success: false,
          error: "Validation failed",
          details: result.error.format()
        }, 400);
      }
    });
    return validator(c, next);
  },
  async (c) => {
    const formType = c.req.param('formType');
    try {
      const schema = getFormSchema(formType);
      const rawValidated = schema ? c.req.valid('form') : await c.req.parseBody({ all: true });
      const body = await transformFormBody(rawValidated, c);
      console.log(`Received form post [${formType}]:`, body);

      var gitHubResult = await processFormBodyForGitHub(c, formType, body);
      if (gitHubResult) {
        var finalResult = {
          success: true,
          message: `Successfully received submission for ${formType}`,
          receivedAt: new Date().toISOString(),
          formResult: body,
          number: gitHubResult.number,
          ...redirectTo(gitHubResult.url)
        };
        console.log(finalResult);
        return c.json(finalResult);
      } else {
        // TODO: Handle Error
      }
    } catch (err) {
      console.error(`Error processing form post ${formType}:`, err);
      return c.json({ success: false, error: err.message }, 400);
    }
  }
);


apiApp.get('/md', async (c) => {
  return c.body(formatIssue("bug", {description: "TEST DESCRIPTION"}));
});

// TOTAL
apiApp.get('/stats/happiness', async (c) => {
  const score = await getScore(c);
  return c.json(score);
});

apiApp.get('/stats/happiness/daily', async (c) => {
  const score = await getScore(c, "'1' DAY");
  return c.json(score);
});

apiApp.get('/stats/happiness/hourly', async (c) => {
  const score = await getScore(c, "'1' HOUR");
  return c.json(score);
});

apiApp.get('/stats/dump', async (c) => {
  const score = await dumpScore(c);
  return c.json(score);
});

// We need to signal to FormsMd/Frontend what to do on a completed form.
function redirectTo(location) {
  return {
    redirectTo: location
  }
}

function addLandingMetadata(body) {
  const redirectType = body.type;

  // This means they skipped to the end, just the +1 -1 feedback
  if (!body.more) return {};
  // This means we already have the feedback, we can bail as well
  if (body.redirectType == TEXT) return {};

  // For the rest, we need to redirect somewhere else.
  if (redirectType === BUG) return redirectTo("/bug");
  if (redirectType === FEATURE) return redirectTo("/feature");

  // TODO: Config
  if (redirectType === MODERATION || redirectType === SECURITY) return redirectTo("https://moderation.resonite.com");
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

async function processFormBodyForGitHub(c, formType, body) {
  console.log("Form Type:" + formType);

  // Don't send Junk to GitHub
  if (!VALID_FORMS.includes(formType))
    return;

  console.log("Submitting to GH");
  // ALL Other forms use redirects and come back here, so far no processing
  return await SubmitToGitHub(c, formType, body);
}
