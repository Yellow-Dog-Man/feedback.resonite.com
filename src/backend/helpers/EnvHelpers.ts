import type { Bindings } from "../../config";

export function isDev(env: Bindings) {
	return (
		env.ENVIRONMENT === "development" ||
		env.ENVIRONMENT === "dev"
	);
}

// Accepts a boolean from wrangler.toml [vars] or a "true" string from .dev.vars / dashboard
export function shouldSubmitToGitHub(env: Bindings) {
	return env.SUBMIT_TO_GITHUB === true || env.SUBMIT_TO_GITHUB === "true";
}
