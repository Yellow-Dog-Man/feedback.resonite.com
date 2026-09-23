export function isDev(env) {
    return env.ENVIRONMENT === "development" || env.ENVIRONMENT === "dev" || !env.ENVIRONMENT;
}