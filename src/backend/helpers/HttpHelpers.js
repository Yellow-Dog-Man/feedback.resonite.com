
// Trying to make problem details here: https://jsonic.io/guides/json-api-error-handling


const BAD_REQUEST = 400;
const STATUS_BASE_URL = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/";

export function BadRequest(c, message) {
    return FormatAsProblemDetails(c, BAD_REQUEST, message, "Bad Request");
}

function FormatAsProblemDetails(c, code, message, title) {
    c.status(code);
    return c.body({
        status: code,
        detail: message,
        title: title,
        type: STATUS_BASE_URL + code
    });
}