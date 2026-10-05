// https://developers.cloudflare.com/workers/runtime-apis/web-crypto/#digest

const encoder = new TextEncoder();

export async function sha256Hex(message) {
	const hashBuffer = await crypto.subtle.digest(
		"SHA-256",
		encoder.encode(message),
	);
	return toHex(hashBuffer);
}

// Keyed hash. Unlike sha256Hex, the result can't be reversed by hashing every
// possible input (e.g. all 2^32 IPv4 addresses) unless you also have the secret.
// https://developers.cloudflare.com/workers/runtime-apis/web-crypto/#sign
export async function hmacSha256Hex(secret, message) {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(message),
	);
	return toHex(signature);
}

function toHex(buffer) {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
