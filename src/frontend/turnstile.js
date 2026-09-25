export const TOKEN_KEY = "turnstile_token";
export const TURNSTILE_HEADER = "X-Turnstile-Token";

const TURNSTILE_DIV = "#turnstile-container";

export const TURNSTILE_SUCCESS_EVENT = "turnstileSuccess";
const turnstileSuccessEvent = new Event(TURNSTILE_SUCCESS_EVENT);

export const TURNSTILE_FAILURE_EVENT = "turnstileFailure";
const turnstileFailureEvent = new Event(TURNSTILE_FAILURE_EVENT);

export function initTurnstile() {
	const turnstileContainer = document.querySelector(TURNSTILE_DIV);
	const key = turnstileContainer.dataset.sitekey;

	if (window.turnstile) {
		renderWidget(key);
	} else {
		const checkTurnstile = setInterval(() => {
			if (window.turnstile) {
				clearInterval(checkTurnstile);
				renderWidget(key);
			}
		}, 100);
	}
}

function renderWidget(key) {
	window.turnstile.render(TURNSTILE_DIV, {
		sitekey: key,
		callback: onSuccess,
		"expired-callback": onExpired,
		"error-callback": onFailure,
	});
}

function onExpired() {
	sessionStorage.removeItem(TOKEN_KEY);
	// Re-init
	initTurnstile();
}

function onFailure() {
	sessionStorage.removeItem(TOKEN_KEY);
	document.dispatchEvent(turnstileFailureEvent);
	// Re-init
	initTurnstile();
}

function onSuccess(token) {
	sessionStorage.setItem(TOKEN_KEY, token);
	document.dispatchEvent(turnstileSuccessEvent);
	document.querySelector(TURNSTILE_DIV).style.display = "none";
}

export function getTurnstileToken() {
	return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

export function getTurnstileHeader() {
	let obj = {};
	obj[TURNSTILE_HEADER] = getTurnstileToken();
	return obj;
}
