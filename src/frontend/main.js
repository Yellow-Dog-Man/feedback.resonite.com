import './../style.css';
import "formsmd/dist/css/formsmd.min.css";
import { Formsmd } from "formsmd";
import {GetDefaultFormOptions} from "../backend/helpers/DefaultFormOptions.js";
import { initTurnstile, TURNSTILE_SUCCESS_EVENT } from "./turnstile.js";

document.addEventListener('DOMContentLoaded', () => {
  initTurnstile();
});

document.addEventListener(TURNSTILE_SUCCESS_EVENT, function() {
  // TODO Wait for turnstile
  document.querySelectorAll('.formsMDTarget').forEach(async (el) => {
    const templatePath = el.getAttribute('data-form-template');
    if (!templatePath) return;
    try {
      const response = await fetch(templatePath);
      const text = await response.text();
      const formsmd = new Formsmd(
        text,
        el,
        GetDefaultFormOptions(),
      );
      formsmd.init();
      formsmd.onCompletion = handleCompletion;
    } catch (err) {
      console.error('Failed to initialize form:', err);
    }
  });
});

function handleCompletion(result) {
  if (!result)
    return;

  if (result.redirectTo !== undefined)
    window.location.href = result.redirectTo;
}
