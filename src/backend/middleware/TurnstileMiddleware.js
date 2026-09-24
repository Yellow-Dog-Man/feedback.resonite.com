import { verifyTurnstileToken } from '../services/turnstileService.js';
import { TURNSTILE_HEADER } from '../../frontend/turnstile.js';
import { getTurnstileSecretKey } from '../helpers/TurnstileConfig.js';
import { isDev } from '../helpers/EnvHelpers.js';

export function turnstileMiddleware() {
  return async (c, next) => {
    // Only protect POST requests to API endpoints
    if (c.req.method !== 'POST') {
      return await next();
    }

    if (isDev(c.env))
      await next();
    
    const verification = await verifyTurnstileToken(
      getTurnstileSecretKey(c),
      c.req.header(TURNSTILE_HEADER),
      c.req.header('CF-Connecting-IP')
    );
    if (!verification.success) {
      return c.json({
        success: false,
        error: 'Cloudflare Turnstile verification failed. Please complete the verification challenge.',
      }, 403);
    }

    c.set('turnstile', true);
    c.set('attestation', verification.attestation);
    await next();
  };
}
