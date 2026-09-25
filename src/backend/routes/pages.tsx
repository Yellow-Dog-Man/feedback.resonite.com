import { Hono } from "hono";
import { Form } from "../components/form";
import { renderer } from "../components/renderer";
import { VALID_FORMS, LANDING } from "../helpers/FormHelpers";
import { Cheese } from "../components/cheese";
import { Limited } from "../components/limited";

export const pageApp = new Hono();

const landingUrl = `/${LANDING}`;

pageApp.use(renderer);

pageApp.get("/", (c) => {
	return c.redirect(landingUrl);
});

pageApp.get("/cheese", (c) => {
	return c.render(<Cheese />);
});

pageApp.get("/limited", (c) => {
	return c.render(<Limited />);
});

pageApp.get("/:form", (c) => {
	const formId = c.req.param("form").toLowerCase();
	if (!VALID_FORMS.includes(formId)) return c.redirect(landingUrl);
	const form = {
		id: formId,
		templatePath: `/forms/${formId.toUpperCase()}.md`,
	};
	return c.render(<Form formConfig={form} />);
});
