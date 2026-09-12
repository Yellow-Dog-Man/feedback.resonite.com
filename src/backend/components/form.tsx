import { FC } from "hono/jsx";

type FormConfig = {
    id: string;
    templatePath: string;
}

export const Form: FC<{formConfig: FormConfig}> = (props: {
    formConfig: FormConfig
}) => {
  return (
    <div id="form-wrapper">
    <link as="text" rel="modulepreload" src="{props.formConfig.templatePath}" />
    <p>Test</p>
    </div>
  )
}