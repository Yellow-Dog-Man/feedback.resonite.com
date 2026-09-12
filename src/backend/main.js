import { Hono } from 'hono'
import Mustache from 'mustache';

// TODO: I keep writing this in Cloudflare projects, there's gotta be a better way?
// TODO: Research Cloudflare ENV and bindings, see if there's something we can do in Wrangler?
function checkBindings(env) {
    const envsToCheck = ["ASSETS"];
    for (const key of envsToCheck) {
        if (!env[key]) {
            console.error(`Missing environment variable: ${key}`);
            return new Response("Server configuration error", { status: 500, headers: { "Content-Type": "text/plain" } });
        }
    }
    return null;
}

async function localAsset(c, path) {
  return c.fetch(new URL("https://assets.local/" + path));
}


const app = new Hono()


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

async function localTemplate(c, path) {
  const layoutResponse = await localAsset(c, path);
  const template = await layoutResponse.text();

  return template;
}

app.get('/', async (c) => {
  const template = await localTemplate(c.env.ASSETS, 'templates/layout.html');
  console.log(template);
  const templateObject = {

  };
  const html = Mustache.render(template, templateObject);
  return c.html(html);
});

// Serve static assets via Cloudflare Workers env.ASSETS binding under /public/*
app.get('/*', async (c) => {
    return await c.env.ASSETS.fetch(c.req.raw)
})


export default app
