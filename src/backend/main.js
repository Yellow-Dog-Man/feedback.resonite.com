import { Hono } from 'hono'
import { apiApp } from './routes/api.js'
import { pageApp } from './routes/pages.tsx'

const app = new Hono()

app.route('/api', apiApp)
app.route('/', pageApp)

export default app;

