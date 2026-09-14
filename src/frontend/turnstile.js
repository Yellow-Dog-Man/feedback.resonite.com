let turnstileWidgetId = null;

const TURNSTILE_DIV = '#turnstile-container';
export const TURNSTILE_SUCCESS_EVENT = 'turnstileSuccess';
const turnstileEvent = new Event(TURNSTILE_SUCCESS_EVENT);

export const TOKEN_KEY = "turnstile_token";
export const TURNSTILE_SITE_KEY = turnstileContainer.dataset.sitekey || '1x00000000000000000000AA'; 
export const TURNSTILE_HEADER = 'X-Turnstile-Token';

export function initTurnstile() {
    const turnstileContainer = document.getElementById('turnstile-container');
    if (!turnstileContainer) return;
    const renderWidget = () => {
        if (window.turnstile && turnstileWidgetId === null) {
            turnstileWidgetId = window.turnstile.render(TURNSTILE_DIV, {
                sitekey: TURNSTILE_SITE_KEY,
                callback: (token) => {
                    sessionStorage.setItem(TOKEN_KEY, token)
                    document.dispatchEvent(turnstileEvent);
                },
                'expired-callback': () => sessionStorage.removeItem(TOKEN_KEY),
                'error-callback': () => sessionStorage.removeItem(TOKEN_KEY)
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

export function getTurnstileToken() {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
}