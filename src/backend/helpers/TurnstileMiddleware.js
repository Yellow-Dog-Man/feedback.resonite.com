import { verifyTurnstileToken } from '../services/turnstileService.js';
import { TURNSTILE_HEADER } from '../../frontend/turnstile.js';

export function turnstileMiddleware() {
  return async (c, next) => {
    // Only protect POST requests to API endpoints
    if (c.req.method !== 'POST') {
      return await next();
    }
    
    const verification = await verifyTurnstileToken(
      c.env.TURNSTILE_SECRET_KEY, 
      c.req.header(TURNSTILE_HEADER), 
      c.req.header('CF-Connecting-IP')
    );

    //TODO Problem details
    if (!verification.success) {
      return c.json({
        success: false,
        error: 'Cloudflare Turnstile verification failed. Please complete the verification challenge.',
      }, 403);
    }

    await next();
  };
}
