import { sha256Hex } from "./hashService";

export async function verifyTurnstileToken(secret, token) {
  try {
    return await submitTurnstileToken(secret, token);
  } catch (err) {
    console.log(err);
    return turnstileFail();
  }
}

async function submitTurnstileToken(secret, turnstileToken, ip) {
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', turnstileToken);
  formData.append('remoteip', ip);

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
  // Instead we stamp some items together and hash it
  const challengeTimeStamp = verifyOutcome.challenge_ts ? Date.parse(verifyOutcome.challenge_ts) : Date.now();
  const hash = await sha256Hex(`cf_${challengeTimeStamp}_${turnstileToken}_${ip}`);

  return turnstilePassed(hash);
}

function turnstileFail() {
  return { success: false, attestation: null };
}

function turnstilePassed(attestation) {
  return { success: true, attestation: attestation };
}
