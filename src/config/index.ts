
//!IMPORTANT: No secrets here, use ENV!
//TODO: Actually config this, right now its just a set of static properties.

export const PARENT_DOMAIN = "resonite.com";

export const FEEDBACK_DOMAIN = "feedback." + PARENT_DOMAIN;

export const MODERATION_DOMAIN = "moderation." + PARENT_DOMAIN;
export const MODERATION_URL = "https://" + MODERATION_DOMAIN;

export const BLOB_DOMAIN = "blob." + FEEDBACK_DOMAIN;
export const BLOB_URL  = "https://" + BLOB_DOMAIN + "/";

export const REPO_OWNER = "Yellow-Dog-Man";
export const REPO = "Resonite-Issues";
