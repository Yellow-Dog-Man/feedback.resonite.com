import { Hono } from 'hono'
import { apiApp } from './routes/api.js'
import { pageApp } from './routes/pages.tsx'
import { logger } from 'hono/logger'

const app = new Hono()

app.use(logger());

app.route('/api', apiApp);
app.route('/', pageApp);

export default app;

