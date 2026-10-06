import { sha256Hex } from "./hashService";

// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
type TurnstileResponse = {
	success: boolean;
	challenge_ts: string;
	// The site the widget was solved on.
	hostname: string;
	"error-codes": string[];
};

// token and ip come from request headers, so either may be missing.
// hostname is the site the token must have been issued for.
export async function verifyTurnstileToken(
	secret: string,
	token: string | undefined,
	ip: string | undefined,
	hostname: string,
) {
	if (!token) return turnstileFail("Missing Token");
	try {
		return await submitTurnstileToken(secret, token, ip, hostname);
	} catch (err) {
		return turnstileFail("Submission Failure", err);
	}
}

async function submitTurnstileToken(
	secret: string,
	turnstileToken: string,
	ip: string | undefined,
	hostname: string,
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
		return turnstileFail(
			"TurnStile Failed",
			verifyOutcome["error-codes"]?.join(", "),
		);
	}

	// A valid token solved on another site isn't valid here.
	if (verifyOutcome.hostname !== hostname) {
		return turnstileFail(
			"Hostname Mismatch",
			`expected ${hostname}, got ${verifyOutcome.hostname}`,
		);
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

function turnstileFail(message: string, err?: unknown) {
	console.log(`Turnstile failed with: ${message} and error: ${err}`);
	return { success: false, attestation: null, message: message };
}

function turnstilePassed(attestation: string) {
	return { success: true, attestation: attestation };
}
