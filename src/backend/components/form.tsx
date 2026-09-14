import { FC, Fragment } from "hono/jsx";
import "formsmd/dist/css/formsmd.min.css";
import { TURNSTILE_SITE_KEY } from "../helpers/TurnstileConfig.js";

type FormConfig = {
    id: string;
    templatePath: string;
}

export const Form: FC<{formConfig: FormConfig}> = (props: {
    formConfig: FormConfig
}) => {
  // <link jumps to the top of the page, this pre-loads the markdown so that by the time the forms need it, its already in the cache :)
  // TODO: use <Link, see renderer for example
  return (
    <Fragment>
    <link as="text" rel="modulepreload" href={props.formConfig.templatePath} id="formTemplateLink"/>
    <div 
      id={props.formConfig.id} 
      class="formsMDTarget"
      data-form-template={props.formConfig.templatePath}
    />
    <div id="turnstile-container" data-sitekey={TURNSTILE_SITE_KEY} style="margin: 20px 0; display: flex; justify-content: center;"></div>
    </Fragment>
  )
}


