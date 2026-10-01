import { type FC, Fragment } from "hono/jsx";
import "formsmd/dist/css/formsmd.min.css";
import { useRequestContext } from "hono/jsx-renderer";
import { getTurnstileSiteKey } from "../helpers/TurnstileConfig.js";

type FormConfig = {
	id: string;
	templatePath: string;
};

export const Form: FC<{ formConfig: FormConfig }> = (props: {
	formConfig: FormConfig;
}) => {
	// <link jumps to the top of the page, this pre-loads the markdown so that by the time the forms need it, its already in the cache :)
	// TODO: use <Link, see renderer for example
	const c = useRequestContext();
	const key = getTurnstileSiteKey(c.env);
	return (
		<Fragment>
			<link
				as="text"
				rel="modulepreload"
				href={props.formConfig.templatePath}
				id="formTemplateLink"
			/>
			<div
				id={props.formConfig.id}
				class="formsMDTarget"
				data-form-template={props.formConfig.templatePath}
				data-form-type={props.formConfig.id}
			>
				{/* Formsmd replaces this when the form is ready */}
				<div class="loader" role="status">
					<div class="loader-spinner" aria-hidden="true"></div>
					<div class="loader-messages" aria-hidden="true">
						<span>Checking you're not a robot...</span>
						<span>Warming up the forms...</span>
						<span>Consulting the cheese...</span>
					</div>
					<span class="visually-hidden">Loading the form</span>
				</div>
			</div>
			<div
				id="turnstile-container"
				data-sitekey={key}
				style="margin: 20px 0; display: flex; justify-content: center;"
			></div>
			<div id="success-container" class="center hidden">
				<button id="restart" type="button">
					Restart
				</button>
			</div>
		</Fragment>
	);
};
