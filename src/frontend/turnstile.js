export const TURNSTILE_SUCCESS_EVENT = 'turnstileSuccess';
export const TOKEN_KEY = "turnstile_token";
export const TURNSTILE_HEADER = 'X-Turnstile-Token';

const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

const TURNSTILE_DIV = '#turnstile-container';
const turnstileEvent = new Event(TURNSTILE_SUCCESS_EVENT);

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

function renderWidget() {
    window.turnstile.render(TURNSTILE_DIV, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onSuccess,
        'expired-callback': onFailure,
        'error-callback': onFailure
    });
}

function onFailure() {
    sessionStorage.removeItem(TOKEN_KEY);
}

function onSuccess(token) {
    sessionStorage.setItem(TOKEN_KEY, token)
    document.dispatchEvent(turnstileEvent);
    document.querySelector(TURNSTILE_DIV).style.display = 'none';
}

export function getTurnstileToken() {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

export function getTurnstileHeader() {
    return {
        TURNSTILE_HEADER: getTurnstileToken()
    }
}