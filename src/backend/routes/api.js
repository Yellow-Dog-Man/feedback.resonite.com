import { Hono } from 'hono'
import { saveFeedbackText } from '../services/feedbackService.js'
import { BUG, FEATURE, MODERATION, SECURITY, LANDING } from '../helpers/FormHelpers.js';

export const apiApp = new Hono();

function redirectTo(location) {
  return {
    redirectTo: location
  }
}

function addSuccessMetadata(formType, body) {
  const redirectType = body.type;
  if (formType === LANDING) {
    if (body.more === false) return {end:true};

    if (redirectType === BUG) return redirectTo("/bug");
    if (redirectType === FEATURE) return redirectTo("/feature");
    if (redirectType === MODERATION || redirectType === SECURITY) return redirectTo("https://moderation.resonite.com");
  }
}

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

function boolToScore(b) {
  if (b === true) return 1;
  if (b === false) return -1;
  return 0;
}

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

async function processBody(c, formType, body) {
  console.log("Form Type:" + formType);
  if (formType === LANDING)
  {
    const date = new Date().toISOString();
    c.env.SCORE.writeDataPoint({
      "doubles": [boolToScore(body.happinessScore)],
      "indexes": [date]
    });

    if (body.more && body.type === "text")
    {
      console.log("Saving feedback to DB");
      console.log(body.feedback);
      await saveFeedbackText(c.env.DB, body.feedback, date);
    }
  }

  // ALL Other forms use redirects and come back here, so far no processing
  // SubmitToGH(body)
}


