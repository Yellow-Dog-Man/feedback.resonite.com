import { FC, Fragment } from "hono/jsx";
import DefaultFormOptions from "../helpers/DefaultFormOptions.js";

import './../style.css';
import "formsmd/dist/css/formsmd.min.css";
import { Formsmd } from "formsmd";
import LANDING from '../../public/forms/LANDING.md?raw';

type FormConfig = {
    id: string;
    templatePath: string;
}

export const Form: FC<{formConfig: FormConfig}> = (props: {
    formConfig: FormConfig
}) => {
  
  return (
    <Fragment>
    <link as="text" rel="modulepreload" href={props.formConfig.templatePath} id="formTemplate"/>
    <div id="{id}">
    </div>

    <script dangerouslySetInnerHTML={{
      __html: `
        const el = document.getElementById(${props.formConfig.id});
        const link = document.querySelector('#formTemplate');
        const response = await fetch(link.href);
        const text = await response.text();
        const formsmd = new Formsmd(
            text,
            el,
            DefaultFormOptions,
            formsmd.init();
        );
      `
    }} />
    </Fragment>
  )
}

// https://docs.forms.md/getting-started/react#markdown-like