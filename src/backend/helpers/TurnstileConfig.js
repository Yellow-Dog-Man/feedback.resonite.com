const DEMO_TURNSTILE_KEY = '1x00000000000000000000AA';
export const TURNSTILE_SITE_KEY = '0x4AAAAAAE_ffmknZb7xGGEe'; // NOT a secret

export function getTurnstileSecretKey(c) {
  return c.env.TURNSTILE_SECRET_KEY ?? DEMO_TURNSTILE_KEY;
}