
// Trying to make problem details here: https://jsonic.io/guides/json-api-error-handling


const BAD_REQUEST = 400;
const STATUS_BASE_URL = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/";

export function BadRequest(c, message) {
    return FormatAsProblemDetails(c, BAD_REQUEST, message, "Bad Request");
}

function FormatAsProblemDetails(c, code, message, title) {
    c.status(code);
    // RFC 9457
    c.header('Content-Type', 'application/problem+json');
    return c.json({
        status: code,
        detail: message,
        title: title,
        type: STATUS_BASE_URL + code,

        // TODO: we validate the whole, body right now, if we do field by field we can render this.
        // Set this to the field that generated the error
        // https://docs.forms.md/getting-started/options
        // We might need to do errors: [{field}, {field}] though.
        // TODO: Zod?
        field: ""
    });
}