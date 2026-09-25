import type { Bindings } from "../../config";

export function isDev(env: Bindings) {
	return (
		env.ENVIRONMENT === "development" ||
		env.ENVIRONMENT === "dev" ||
		!env.ENVIRONMENT
	);
}
