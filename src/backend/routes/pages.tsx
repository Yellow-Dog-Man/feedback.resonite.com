import { Hono } from "hono";
import { Cheese } from "../components/cheese";
import { Form } from "../components/form";
import { Limited } from "../components/limited";
import { renderer } from "../components/renderer";
import { LANDING, VALID_FORMS } from "../helpers/FormHelpers";

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
