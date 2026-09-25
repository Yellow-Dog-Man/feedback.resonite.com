// Trying to make problem details here: https://jsonic.io/guides/json-api-error-handling
//TODO: Swap to: https://github.com/paveg/hono-problem-details

import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

const BAD_REQUEST = 400;
const SERVER_TEMPORARY_ERROR = 503;
const STATUS_BASE_URL =
	"https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/";

export function TemporaryError(c: Context, message: string) {
	return FormatAsProblemDetails(
		c,
		SERVER_TEMPORARY_ERROR,
		message,
		"Bad Request",
	);
}
export function BadRequest(c: Context, message: string) {
	return FormatAsProblemDetails(c, BAD_REQUEST, message, "Bad Request");
}

function FormatAsProblemDetails(
	c: Context,
	code: StatusCode,
	message: string,
	title: string,
) {
	c.status(code);
	// RFC 9457
	c.header("Content-Type", "application/problem+json");
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
		field: "",
	});
}
