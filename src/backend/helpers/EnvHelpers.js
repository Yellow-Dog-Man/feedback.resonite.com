import { Env } from "hono";

export function isDev(env) {
    console.log(env);
    return env.ENVIRONMENT === "development" || env.ENVIRONMENT === "dev" || !env.ENVIRONMENT;
}