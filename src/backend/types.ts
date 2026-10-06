import type { Context } from "hono";

// Hono environment for the Worker. `Env` is generated from wrangler.toml and
// .dev.vars.example by `npm run types` (see worker-configuration.d.ts).
export type AppEnv = {
	Bindings: Env;
	Variables: {
		// Set by TurnstileMiddleware on verified POST requests.
		turnstile: boolean;
		attestation: string | null;
	};
};

export type AppContext = Context<AppEnv>;
