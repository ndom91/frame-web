/**
 * Signing half of the image cookie. The Worker at `workers/images/src/cookie.ts`
 * holds the verification half; the wire format below is the contract between
 * them and can't drift:
 *
 *   <base64url(JSON payload)>.<base64url(HMAC-SHA256 of that first segment)>
 *
 * The cookie is what lets a plain `<img src>` on domino.photos read a private
 * object from img.frame.domino.photos without a presigned, expiring URL in the
 * markup.
 */
import type { NextRequest, NextResponse } from "next/server";

import { IMAGE_HOSTNAME } from "@/app/lib/image-url";

export const IMAGE_COOKIE_NAME = "frame_img";

/**
 * Short enough that losing access to a frame takes effect quickly, long enough
 * to outlast a browsing session. Every media request refreshes it, so an active
 * user never sees it lapse.
 */
export const IMAGE_COOKIE_MAX_AGE_SECONDS = 60 * 60;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signImageCookie(frameIds: string[]): Promise<string> {
	const secret = process.env.IMAGE_COOKIE_SECRET;
	if (!secret) {
		throw new Error("IMAGE_COOKIE_SECRET is not set");
	}

	const payload = JSON.stringify({
		f: frameIds,
		exp: Math.floor(Date.now() / 1000) + IMAGE_COOKIE_MAX_AGE_SECONDS,
	});
	const payloadSegment = toBase64Url(encoder.encode(payload));

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
		encoder.encode(payloadSegment),
	);

	return `${payloadSegment}.${toBase64Url(new Uint8Array(signature))}`;
}

/**
 * Widest domain covering both the app and the image host, or undefined when
 * they're the same host (localhost against `wrangler dev`, where the default
 * host-only cookie already reaches both — cookies ignore port).
 */
export function imageCookieDomain(
	appHost: string,
	imageHost: string,
): string | undefined {
	const app = appHost.split(":")[0].toLowerCase();
	const image = imageHost.split(":")[0].toLowerCase();
	if (!app || !image || app === image) return undefined;

	const appLabels = app.split(".").reverse();
	const imageLabels = image.split(".").reverse();

	const shared: string[] = [];
	for (let i = 0; i < Math.min(appLabels.length, imageLabels.length); i++) {
		if (appLabels[i] !== imageLabels[i]) break;
		shared.unshift(appLabels[i]);
	}

	// Anything shorter than `domain.tld` is a public suffix; browsers reject it.
	return shared.length >= 2 ? shared.join(".") : undefined;
}

/**
 * Attaches a refreshed image cookie to a response.
 *
 * Called from the endpoints the gallery already hits before rendering any
 * image, so there's no extra round trip and no separate token endpoint.
 *
 * Never throws. The security boundary is the Worker, which denies by default —
 * so a cookie we couldn't mint costs the user their images, but it must not
 * take the media API down with it. That also means the app can be deployed
 * before IMAGE_COOKIE_SECRET exists without a 500.
 */
export async function attachImageCookie(
	response: NextResponse,
	request: NextRequest,
	frameIds: string[],
): Promise<void> {
	try {
		const appHost = request.headers.get("host") ?? "";
		const domain = imageCookieDomain(appHost, IMAGE_HOSTNAME);

		if (!domain && appHost.split(":")[0] !== IMAGE_HOSTNAME.split(":")[0]) {
			// Without a shared parent domain the browser drops the cookie and every
			// image 403s — worth saying out loud rather than debugging it blind.
			console.warn(
				`Image cookie can't span ${appHost} and ${IMAGE_HOSTNAME}; images will not authenticate.`,
			);
		}

		response.cookies.set({
			name: IMAGE_COOKIE_NAME,
			value: await signImageCookie(frameIds),
			domain,
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			// Lax rather than Strict: the cookie has to ride along on subresource
			// requests for <img> tags to load.
			sameSite: "lax",
			maxAge: IMAGE_COOKIE_MAX_AGE_SECONDS,
		});
	} catch (error) {
		console.error("Failed to mint image cookie; images will 403.", error);
	}
}
