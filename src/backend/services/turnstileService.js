export async function verifyTurnstileToken(c, token) {
  try {
    return await submitTurnstileToken(c, token);
  } catch (err) {
    return turnstileFail();
  }
}

async function submitTurnstileToken(secret, turnstileToken, ip) {
  const formData = new FormData();
  formData.append('secret', );
  formData.append('response', turnstileToken);
  formData.append('remoteip', );

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
  });
  const verifyOutcome = await verifyRes.json();
  if (!verifyOutcome.success) {
      return turnstileFail();
  }

  // I think I need to use Cloudflare, https://developers.cloudflare.com/turnstile/tutorials/fraud-detection-with-ephemeral-ids/
  // But this is an enterprise feature.
  // Instead we stamp some items together.
  const challengeStamp = verifyOutcome.challenge_ts ? Date.parse(verifyOutcome.challenge_ts) : Date.now();

  //TODO: probably should hash this
  attestationId = `cf_${challengeStamp}_${turnstileToken.slice(-6)}`;

  return turnstilePassed(attestationId);
}


function turnstileFail() {
  return { success: false, attestation: null };
}

function turnstilePassed(attestation) {
  return { success: true, attestation: attestation };
}
