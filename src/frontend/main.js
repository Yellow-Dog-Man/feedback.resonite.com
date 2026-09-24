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
      formsmd.getSubmissionErrors = getSubmissionErrors;
    } catch (err) {
      console.error('Failed to initialize form:', err);
    }
  });
});

function unwrapZodErrors(details) {
  const messages = [];
  for (const [field, errObj] of Object.entries(details)) {
    if (errObj && Array.isArray(errObj._errors) && errObj._errors.length > 0) {
      for (const errMessage of errObj._errors) {
        messages.push(`${field}: ${errMessage}`);
      }
    }
  }
  return messages;
}

function getSubmissionErrors(json) {
  let messages = [];
  if (json.details) {
    messages = messages.concat(unwrapZodErrors(json.details));
  }
  if (messages.length === 0 && json.error) {
    messages.push(json.error);
  }
  return messages;
}

function showResetButton() {
  var element = document.getElementById('success-container');
  element.classList.remove('hidden');
  document.getElementById('restart').addEventListener('click', function() {
    window.location ="/landing";
  });
}

function handleCompletion(result) {
  if (!result)
    return;

  if (result.redirectTo !== undefined)
    window.location.href = result.redirectTo;

  if (!result.success)
    if (result.message)
      window.showModal(result.message);

  showResetButton();
}
