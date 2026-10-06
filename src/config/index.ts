// Bindings, vars and secrets are typed by the generated `Env` interface in
// worker-configuration.d.ts (`npm run types`).

//!IMPORTANT: No secrets here, use ENV!
export const PARENT_DOMAIN = "resonite.com";

export const FEEDBACK_DOMAIN = `feedback.${PARENT_DOMAIN}`;

export const MODERATION_DOMAIN = `moderation.${PARENT_DOMAIN}`;
export const MODERATION_URL = `https://${MODERATION_DOMAIN}`;

export const BLOB_DOMAIN = `blob.${FEEDBACK_DOMAIN}`;
export const BLOB_URL = `https://${BLOB_DOMAIN}/`;

export const REPO_OWNER = "Yellow-Dog-Man";
export const REPO = "Resonite-Issues";
