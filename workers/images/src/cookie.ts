/**
 * Verification half of the signed image cookie.
 *
 * The signing half lives in the Next app at `app/lib/image-cookie.ts`. The two
 * are deliberately separate copies — the Worker deploys independently and can't
 * import from the app — so the wire format below has to stay in lockstep:
 *
 *   <base64url(JSON payload)>.<base64url(HMAC-SHA256 of that first segment)>
 *
 * Payload is `{ f: string[], exp: number }`: the frame prefixes the bearer may
 * read, and an absolute expiry in seconds.
 */

export const COOKIE_NAME = "frame_img";

export type ImageCookieClaims = {
	/** Frame prefixes (`frame.frameId`), i.e. the first path segment of a key. */
	f: string[];
	/** Expiry, seconds since epoch. */
	exp: number;
};

const encoder = new TextEncoder();

function fromBase64Url(value: string): Uint8Array {
	const padded = value
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.padEnd(Math.ceil(value.length / 4) * 4, "=");
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

export function readCookie(header: string | null, name: string): string | null {
	if (!header) return null;
	for (const part of header.split(";")) {
		const separator = part.indexOf("=");
		if (separator === -1) continue;
		if (part.slice(0, separator).trim() !== name) continue;
		return part.slice(separator + 1).trim();
	}
	return null;
}

/**
 * Returns the claims when the cookie is present, correctly signed and unexpired;
 * null in every other case. Callers treat null as "deny" — there is no partial
 * trust here.
 */
export async function verifyImageCookie(
	value: string | null,
	secret: string,
): Promise<ImageCookieClaims | null> {
	if (!value) return null;

	const separator = value.lastIndexOf(".");
	if (separator <= 0) return null;

	const payloadSegment = value.slice(0, separator);
	const signatureSegment = value.slice(separator + 1);

	let signature: Uint8Array;
	try {
		signature = fromBase64Url(signatureSegment);
	} catch {
		return null;
	}

	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["verify"],
	);

	// subtle.verify does the comparison itself, so there's no hand-rolled
	// (and timing-leaky) string equality on the signature.
	const valid = await crypto.subtle.verify(
		"HMAC",
		key,
		signature as BufferSource,
		encoder.encode(payloadSegment),
	);
	if (!valid) return null;

	let claims: ImageCookieClaims;
	try {
		claims = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadSegment)));
	} catch {
		return null;
	}

	if (!Array.isArray(claims.f) || typeof claims.exp !== "number") return null;
	if (claims.exp <= Math.floor(Date.now() / 1000)) return null;

	return claims;
}

/**
 * Short stable digest of an entitlement set, used in the cache key so that two
 * requests share a cached object only when they're allowed the same frames.
 */
export async function scopeHash(frameIds: string[]): Promise<string> {
	const canonical = [...frameIds].sort().join(",");
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(canonical));
	return [...new Uint8Array(digest)]
		.slice(0, 8)
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}
