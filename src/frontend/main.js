import './../style.css';
import "formsmd/dist/css/formsmd.min.css";
import { Formsmd } from "formsmd";
import DefaultFormOptions from "../backend/helpers/DefaultFormOptions.js";

document.querySelectorAll('.formsMDTarget').forEach(async (el) => {
  const templatePath = el.getAttribute('data-form-template');
  if (!templatePath) return;
  try {
    const response = await fetch(templatePath);
    const text = await response.text();
    const formsmd = new Formsmd(
      text,
      el,
      DefaultFormOptions,
    );
    formsmd.init();
  } catch (err) {
    console.error('Failed to initialize form:', err);
  }
});

