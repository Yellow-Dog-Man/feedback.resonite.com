import './../style.css';
import "formsmd/dist/css/formsmd.min.css";
import { Formsmd } from "formsmd";
import {GetDefaultFormOptions} from "../backend/helpers/DefaultFormOptions.js";
import { initTurnstile, TURNSTILE_SUCCESS_EVENT } from "./turnstile.js";
import { LANDING } from '../backend/helpers/FormHelpers.js';

//TODO: Move this to the form component, ideally it shouldn't be here

document.addEventListener('DOMContentLoaded', () => {
  initTurnstile();
});

async function checkLimit(id) {
  const res = await fetch('/api/checklimits');
  const json = await res.json();
  
  switch(id) {
    case LANDING:
      return json.limits.landing.limited;
    default:
      return json.limits.form.limited;
  }
}

document.addEventListener(TURNSTILE_SUCCESS_EVENT, function() {
  document.querySelectorAll('.formsMDTarget').forEach(async (el) => {
    const templatePath = el.getAttribute('data-form-template');
    const id = el.getAttribute('data-form-type');

    const limit = await checkLimit(id);
    if (limit) {
      limited();
      return;
    }

    if (!templatePath) {
      showModal('Invalid form setup');
      return;
    }
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

function limited() {
  showModal('You have filled this in too many times and are rate limited. Please try again in 1 hour');
  window.location = "/limited";
}

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

document.getElementById('restart').addEventListener('click', function() {
  window.location ="/" + LANDING;
});

function showResetButton() {
  var element = document.getElementById('success-container');
  element.classList.remove('hidden');
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
