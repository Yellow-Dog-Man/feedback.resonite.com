import { sha256Hex } from "./hashService";

type TurnstileResponse = {
	success: boolean;
	challenge_ts: string;
};

// token and ip come from request headers, so either may be missing.
export async function verifyTurnstileToken(
	secret: string,
	token: string | undefined,
	ip: string | undefined,
) {
	if (!token) return turnstileFail("no token");
	try {
		return await submitTurnstileToken(secret, token, ip);
	} catch (err) {
		return turnstileFail(err);
	}
}

async function submitTurnstileToken(
	secret: string,
	turnstileToken: string,
	ip: string | undefined,
) {
	const formData = new FormData();
	formData.append("secret", secret);
	formData.append("response", turnstileToken);
	if (ip) formData.append("remoteip", ip);

	const verifyRes = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{
			method: "POST",
			body: formData,
		},
	);
	const verifyOutcome: TurnstileResponse = await verifyRes.json();
	if (!verifyOutcome.success) {
		return turnstileFail(verifyOutcome);
	}

	// I think I need to use Cloudflare, https://developers.cloudflare.com/turnstile/tutorials/fraud-detection-with-ephemeral-ids/
	// But this is an enterprise feature.
	// Instead we stamp some items together and hash it
	const challengeTimeStamp = verifyOutcome.challenge_ts
		? Date.parse(verifyOutcome.challenge_ts)
		: Date.now();
	const hash = await sha256Hex(
		`cf_${challengeTimeStamp}_${turnstileToken}_${ip}`,
	);

	return turnstilePassed(hash);
}

function turnstileFail(err: unknown) {
	return { success: false, attestation: null, message: err };
}

function turnstilePassed(attestation: string) {
	return { success: true, attestation: attestation };
}
