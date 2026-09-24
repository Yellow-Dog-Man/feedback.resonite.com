
import { z } from 'zod';

export const envSchema = z.object({
  ENVIRONMENT: z.string().optional().default('dev'),
  GITHUB_TOKEN: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  API_TOKEN: z.string().optional(),
  ACCOUNT_ID: z.string().optional(),
  DB: z.any().optional(),
  BUCKET: z.any().optional(),
  RATE_LIMIT_KV: z.any().optional(),
  SCORE: z.any().optional(),
});

export type Bindings = z.infer<typeof envSchema>;

export function parseEnv(env: unknown): Bindings {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    console.error('Invalid environment variables/bindings:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data as Bindings;
}

//!IMPORTANT: No secrets here, use ENV!
export const PARENT_DOMAIN = "resonite.com";

export const FEEDBACK_DOMAIN = "feedback." + PARENT_DOMAIN;

export const MODERATION_DOMAIN = "moderation." + PARENT_DOMAIN;
export const MODERATION_URL = "https://" + MODERATION_DOMAIN;

export const BLOB_DOMAIN = "blob." + FEEDBACK_DOMAIN;
export const BLOB_URL  = "https://" + BLOB_DOMAIN + "/";

export const REPO_OWNER = "Yellow-Dog-Man";
export const REPO = "Resonite-Issues";



