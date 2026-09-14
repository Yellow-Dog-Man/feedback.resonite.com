// https://developers.cloudflare.com/workers/runtime-apis/web-crypto/#digest

export async function sha256Hex(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hex;
}