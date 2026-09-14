import { verifyTurnstileToken } from '../services/turnstileService.js';
import { TURNSTILE_HEADER } from '../../frontend/turnstile.js';

export function turnstileMiddleware() {
  return async (c, next) => {
    // Only protect POST requests to API endpoints
    if (c.req.method !== 'POST') {
      return await next();
    }
    const secretKey = c.env.TURNSTILE_SECRET_KEY;
    const token = c.req.header(TURNSTILE_HEADER);

    const remoteIp = c.req.header('cf-connecting-ip') || '';
    const verification = await verifyTurnstileToken(secretKey, token, remoteIp);

    if (!verification.success) {
      return c.json({
        success: false,
        error: 'Cloudflare Turnstile verification failed. Please complete the verification challenge.',
        errorCodes: verification['error-codes']
      }, 403);
    }

    await next();
  };
}
