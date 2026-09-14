let turnstileWidgetId = null;

const TURNSTILE_DIV = '#turnstile-container';
export const TURNSTILE_SUCCESS_EVENT = 'turnstileSuccess';
const turnstileEvent = new Event(TURNSTILE_SUCCESS_EVENT);

export const TOKEN_KEY = "turnstile_token";

export const TURNSTILE_HEADER = 'X-Turnstile-Token';

export function initTurnstile() {
    const turnstileContainer = document.querySelector(TURNSTILE_DIV);
    const TURNSTILE_SITE_KEY = turnstileContainer.dataset.sitekey || '1x00000000000000000000AA'; 
    if (!turnstileContainer) 
        return;

    const renderWidget = () => {
        if (window.turnstile && turnstileWidgetId === null) {
            turnstileWidgetId = window.turnstile.render(TURNSTILE_DIV, {
                sitekey: TURNSTILE_SITE_KEY,
                callback: onSuccess,
                'expired-callback': onFailure,
                'error-callback': onFailure
            });
        }
    };

    if (window.turnstile) {
        renderWidget();
    } else {
        const checkTurnstile = setInterval(() => {
            if (window.turnstile) {
                clearInterval(checkTurnstile);
                renderWidget();
            }
        }, 100);
    }
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