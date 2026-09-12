import { Hono } from 'hono'
import { Eta } from 'eta'
import layoutHtml from '../public/templates/layout.html?raw'

const app = new Hono()
const eta = new Eta({ autoTrim: [false, false] })

// Receive formsmd posts
app.post('/api/:formType', async (c) => {
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

// HTML route rendering using layout.html template via Eta
app.get('/', (c) => {
  const html = eta.renderString(layoutHtml, {
    title: 'Resonite Feedback - Home',
    heading: 'Resonite Feedback System',
    content: '<p>Welcome to Resonite feedback portal. Eta templating & Formsmd active.</p>'
  })
  return c.html(html)
})


export default app

