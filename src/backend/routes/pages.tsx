import { Hono } from 'hono'
import { Top } from '../components/layout'
import { Form } from '../components/form'

export const pageApp = new Hono()

pageApp.get('/', (c) => {
  console.log("cheese");
  const form = {
    id: "cheese",
    templatePath: "/forms/LANDING.md"
  };
  return c.html(<Top><Form formConfig={form}/></Top>);
})