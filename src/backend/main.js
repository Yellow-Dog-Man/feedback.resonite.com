import { Hono } from 'hono'
import { apiApp } from './routes/api.js'
import { pageApp } from './routes/pages.tsx'
import { logger } from 'hono/logger'
import { parseEnv } from '../config/index.ts'

const app = new Hono()

app.use(logger());

app.use('*', async (c, next) => {
  parseEnv(c.env);
  return await next();
});

app.route('/api', apiApp);
app.route('/', pageApp);

export default app;
