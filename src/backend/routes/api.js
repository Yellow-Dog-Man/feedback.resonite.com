import { Hono } from 'hono'
import { html } from 'hono/html'

export const apiApp = new Hono()

apiApp.post('/:formType', async (c) => {
  const formType = c.req.param('formType')
  try {
    const body = await c.req.parseBody()
    console.log(`Received form post [${formType}]:`, body)

    return c.json({
      success: true,
      message: `Successfully received submission for ${formType}`,
      receivedAt: new Date().toISOString()
    })
  } catch (err) {
    console.error(`Error processing form post ${formType}:`, err)
    return c.json({ success: false, error: err.message }, 400)
  }
})
