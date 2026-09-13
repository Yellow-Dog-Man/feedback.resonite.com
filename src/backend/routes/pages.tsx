import { Hono } from 'hono';
import { Form } from '../components/form';
import { renderer } from '../components/renderer';
import { VALID_FORMS } from '../helpers/FormHelpers';

export const pageApp = new Hono();

pageApp.use(renderer);

pageApp.get('/', (c) => {
  return c.redirect('/landing');
})

pageApp.get('/:form', (c) => {
  const formId = c.req.param('form').toLowerCase();
  if (!VALID_FORMS.includes(formId))
    return c.redirect('/landing');
  const form = {
    id: formId,
    templatePath: "/forms/" + formId.toUpperCase() + ".md"
  };
  return c.render(<Form formConfig={form}/>);
});