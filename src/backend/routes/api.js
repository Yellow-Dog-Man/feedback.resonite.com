import { Hono } from 'hono'

export const apiApp = new Hono();

function getValidFormTypes() {
  return ['bug', 'landing', 'feature']
}

function redirectTo(location) {
  return {
    redirectTo: location
  }
}

function addProgress(formType, body) {
  const redirectType = body.type;
  if (formType === "landing") {
    if (body.more === 'no') return {end:true};

    if (redirectType === "bug") return redirectTo("/bug");
    if (redirectType === "feature") return redirectTo("/feature");
    if (redirectType === "moderation") return redirectTo("https://moderation.resonite.com");
  }
}

apiApp.post('/:formType', async (c) => {
  const formType = c.req.param('formType')
  try {
    const body = await c.req.parseBody()
    console.log(`Received form post [${formType}]:`, body)

    return c.json({
      success: true,
      message: `Successfully received submission for ${formType}`,
      receivedAt: new Date().toISOString(),
      formResult: body,
      ...addProgress(formType, body)
    })
  } catch (err) {
    console.error(`Error processing form post ${formType}:`, err)
    return c.json({ success: false, error: err.message }, 400)
  }
})

