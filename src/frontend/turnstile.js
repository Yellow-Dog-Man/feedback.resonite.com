export const TURNSTILE_HEADER = "X-Turnstile-Token";

const TURNSTILE_DIV = "#turnstile-container";

// How long a submission waits for a fresh token before sending without one.
// The server will then reject it with a message, rather than the form hanging.
const TOKEN_WAIT_MS = 30_000;

// Fired once, when the first token arrives. Forms should initialize on this.
let firstSuccess = false;
export const TURNSTILE_SUCCESS_EVENT = "turnstileSuccess";
const turnstileSuccessEvent = new Event(TURNSTILE_SUCCESS_EVENT);

export const TURNSTILE_FAILURE_EVENT = "turnstileFailure";
const turnstileFailureEvent = new Event(TURNSTILE_FAILURE_EVENT);

// Turnstile tokens are single use, so we hold at most one unused token and
// fetch a new one each time it is spent.
let widgetId = null;
let currentToken = null;

//TODO: I want to make turnstile a full component for SSR
export function initTurnstile() {
	const turnstileContainer = document.querySelector(TURNSTILE_DIV);
	if (!turnstileContainer) {
		return;
	}
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
	// Only ever render one widget.
	if (widgetId !== null) return;

	widgetId = window.turnstile.render(TURNSTILE_DIV, {
		sitekey: key,
		// Only shows itself if the visitor needs to interact, including on later
		// refreshes after a token has been used.
		appearance: "interaction-only",
		callback: onSuccess,
		"expired-callback": onExpired,
		"error-callback": onFailure,
		// Automatically refresh expired tokens
		"refresh-expired": "auto"
	});
}

function onExpired() {
	currentToken = null;
}

function onFailure() {
	currentToken = null;
	document.dispatchEvent(turnstileFailureEvent);
}

// Store a function to be called when turnstile is successful
let turnstileWaiter = null;

function onSuccess(token) {
	currentToken = token;

	// If a submit is waiting, we can tell it to progress.
	if (turnstileWaiter) {
		turnstileWaiter();
		turnstileWaiter = null;
	}

	if (!firstSuccess) {
		firstSuccess = true;
		document.dispatchEvent(turnstileSuccessEvent);
	}
}

function refreshToken() {
	if (widgetId !== null && window.turnstile) {
		window.turnstile.reset(widgetId);
	}
}

// Resolves when a token arrives or the timeout passes, whichever is first.
// It never deals with the token itself, the caller picks it up afterwards.
function waitForToken() {
	return new Promise((resolve) => {
		const timer = setTimeout(resolve, TOKEN_WAIT_MS);
		turnstileWaiter = () => {
			clearTimeout(timer);
			resolve();
		};
	});
}

/**
 * Takes an unused Turnstile token, and starts fetching the next one.
 * Waits for a token if none is ready. Never rejects; resolves to "" on timeout.
 * @returns {Promise<string>}
 */
export async function takeTurnstileToken() {
	if (!currentToken) {
		await waitForToken();
	}

	// Empty string if we timed out, so the server rejects it with a message.
	const token = currentToken ?? "";
	currentToken = null;

	if (token) {
		refreshToken();
	}
	return token;
}

export async function getTurnstileHeader() {
	const obj = {};
	obj[TURNSTILE_HEADER] = await takeTurnstileToken();
	return obj;
}