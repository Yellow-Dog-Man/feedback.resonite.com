import { Hono } from 'hono'

export const apiApp = new Hono();

const LANDING = "landing";
const FEATURE = "feature";
const BUG = "bug";
const MODERATION = "moderation";

function getValidFormTypes() {
  return [BUG, LANDING, FEATURE]
}

function redirectTo(location) {
  return {
    redirectTo: location
  }
}

function addSuccessMetadata(formType, body) {
  const redirectType = body.type;
  if (formType === LANDING) {
    if (body.more === 'no') return {end:true};

    if (redirectType === BUG) return redirectTo("/bug");
    if (redirectType === FEATURE) return redirectTo("/feature");
    if (redirectType === MODERATION) return redirectTo("https://moderation.resonite.com");
  }
}

apiApp.post('/:formType', async (c) => {
  const formType = c.req.param('formType')
  try {
    const body = await c.req.parseBody()
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
  if (formType === LANDING)
  {
    const date = new Date().toISOString();
    c.env.SCORE.writeDataPoint({
      "doubles": [yesNoToScore(body.happinessScore)],
      "indexes": [date]
    });
    if (body.more ==="yes" && type === "text")
    {

    }
  }
}

function yesNoToScore(yn) {
  if (yn === "yes")
    return 1;

  if (yn === "no")
    return -1;

  return 0;
}

