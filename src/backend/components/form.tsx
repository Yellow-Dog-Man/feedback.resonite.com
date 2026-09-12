import { FC, Fragment } from "hono/jsx";
import "formsmd/dist/css/formsmd.min.css";

type FormConfig = {
    id: string;
    templatePath: string;
}

export const Form: FC<{formConfig: FormConfig}> = (props: {
    formConfig: FormConfig
}) => {
  return (
    <Fragment>
    <link as="text" rel="modulepreload" href={props.formConfig.templatePath} id="formTemplateLink"/>
    <div 
      id={props.formConfig.id} 
      class="formsMDTarget"
      data-form-template={props.formConfig.templatePath}
    />
    </Fragment>
  )
}

