export function isDev(env: Env) {
	return env.ENVIRONMENT === "development" || env.ENVIRONMENT === "dev";
}

// Accepts a boolean from wrangler.toml [vars] or a "true" string from .dev.vars / dashboard
export function shouldSubmitToGitHub(env: Env) {
	return String(env.SUBMIT_TO_GITHUB) === "true";
}
