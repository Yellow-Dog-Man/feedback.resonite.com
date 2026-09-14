const DEMO_SECRET_KEY = '1x0000000000000000000000000000000AA';


export async function verifyTurnstileToken(secretKey, token, remoteIp) {
  if (!token) {
    return { success: false, 'error-codes': ['missing-input-response'] };
  }

  // Test Keys
  if (secretKey ===  DEMO_SECRET_KEY && token === DEMO_SECRET_KEY) {
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();
    return outcome;
  } catch (err) {
    return { success: false, attestation: null };
  }
}

function turnstileFail() {
  return { success: false, attestation: null };
}

function turnstilePassed(attestation) {
  return { success: true, attestation: attestation };
}

async function submitTurnstilToken(c, turnstileToken) {
  const formData = new FormData();
  formData.append('secret', c.env.TURNSTILE_SECRET_KEY);
  formData.append('response', turnstileToken);
  const ip = context.request.headers.get('CF-Connecting-IP');
  if (ip) {
    formData.append('remoteip', ip);
  }

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
  });
  const verifyOutcome = await verifyRes.json();
  if (!verifyOutcome.success) {
      return turnstileFail();
  }

  turnstileVerified = true;
  const challengeStamp = verifyOutcome.challenge_ts ? Date.parse(verifyOutcome.challenge_ts) : Date.now();
  attestationId = `cf_${challengeStamp}_${turnstileToken.slice(-6)}`;

  return turnstilePassed(attestationId);
}
