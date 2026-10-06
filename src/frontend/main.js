import "./../style.css";
import { Formsmd } from "formsmd";
import { LANDING } from "../shared/FormHelpers.js";
import { GetDefaultFormOptions } from "./DefaultFormOptions.js";
import {
	getTurnstileHeader,
	initTurnstile,
	TURNSTILE_FAILURE_EVENT,
	TURNSTILE_SUCCESS_EVENT,
} from "./turnstile.js";

//TODO: Move this to the form component, ideally it shouldn't be here

document.addEventListener("DOMContentLoaded", () => {
	initTurnstile();
});

async function checkLimit(id) {
	const res = await fetch("/api/checklimits");
	const json = await res.json();

	if (!json.limits) {
		throw new Error("Invalid format for limit items");
	}

	switch (id) {
		case LANDING:
			return json.limits.landing.limited;
		default:
			return json.limits.form.limited;
	}
}

// Turnstile tokens are single use, so each POST gets a fresh one rather than
// baking one into postHeaders at init (which made every retry a 403).
function attachFreshTurnstileTokens(formsmd) {
	const postFormData = formsmd.postFormData;
	formsmd.postFormData = async (postCondition, end) => {
		if (postCondition) {
			formsmd.options.postHeaders = {
				...formsmd.options.postHeaders,
				...(await getTurnstileHeader()),
			};
		}
		return postFormData(postCondition, end);
	};
}

// Only build the forms once. Rebuilding on a later Turnstile success would
// wipe whatever the user has typed so far.
let formsStarted = false;
document.addEventListener(TURNSTILE_SUCCESS_EVENT, initForms, { once: true });

// Turnstile errors before the first token mean the forms never start, so
// replace the spinner with an explanation. Turnstile may still recover and
// fire a success later, which builds the forms as normal.
document.addEventListener(TURNSTILE_FAILURE_EVENT, () => {
	if (formsStarted) return;
	for (const el of document.querySelectorAll(".formsMDTarget")) {
		showFormError(
			el,
			"We couldn't check that you're not a robot. Please refresh the page to try again.",
		);
	}
});

function initForms() {
	formsStarted = true;
	document.querySelectorAll(".formsMDTarget").forEach(async (el) => {
		const templatePath = el.getAttribute("data-form-template");
		const id = el.getAttribute("data-form-type");

		if (!templatePath) {
			showFormError("Invalid form setup");
			return;
		}
		try {
			if (await checkLimit(id)) {
				limited();
				return;
			}

			const response = await fetch(templatePath);
			if (!response.ok) throw new Error(`Template fetch: ${response.status}`);
			const text = await response.text();
			const formsmd = new Formsmd(text, el, GetDefaultFormOptions());
			attachFreshTurnstileTokens(formsmd);
			formsmd.init();
			formsmd.onCompletion = handleCompletion;
			formsmd.getSubmissionErrors = getSubmissionErrors;
		} catch (err) {
			console.error("Failed to initialize form:", err);
			showFormError("The form failed to load. Please refresh the page to try again.");
		}
	});
}

// Replaces the loading spinner (or anything else in the form target) with a message.
function showFormError(message) {
	window.showModal(message);
}

function limited() {
	window.showModal(
		"You have filled this in too many times and are rate limited. Please try again in 1 hour",
		() => (window.location = "/limited"),
	);
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
	// Problem details (RFC 9457) responses from HttpHelpers
	if (messages.length === 0 && json.detail) {
		messages.push(json.detail);
	}
	return messages;
}

// Only the form and limited pages have a restart button.
document.getElementById("restart")?.addEventListener("click", () => {
	window.location = `/${LANDING}`;
});

function showResetButton() {
	var element = document.getElementById("success-container");
	element.classList.remove("hidden");
}

function handleCompletion(result) {
	if (!result) return;

	if (result.redirectTo !== undefined) {
		window.location.href = result.redirectTo;
	}

	if (!result.success) {
		if (result.message) {
			window.showModal(result.message);
		}
	}

	showResetButton();
}
