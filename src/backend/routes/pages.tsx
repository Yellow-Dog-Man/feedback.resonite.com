import { Hono } from 'hono';
import { Form } from '../components/form';
import { renderer } from '../components/renderer';

export const pageApp = new Hono();

pageApp.use(renderer);

pageApp.get('/', (c) => {
  return c.redirect('/landing');
})

pageApp.get('/:form', (c) => {
  const formId = c.req.param('form').toLowerCase();
  const form = {
    id: formId,
    templatePath: "/forms/" + formId.toUpperCase() + ".md"
  };
  return c.render(<Form formConfig={form}/>);
});