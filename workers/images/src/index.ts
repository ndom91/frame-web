/**
 * Serves frame photos from R2, gated on a signed cookie minted by the Next app.
 *
 * The bucket has no public read path. Every request has to present a cookie
 * proving (a) it came from an authenticated session and (b) that session is a
 * member of the frame whose prefix it's asking for.
 */
import {
	COOKIE_NAME,
	readCookie,
	scopeHash,
	verifyImageCookie,
	type ImageCookieClaims,
} from "./cookie";

/**
 * Minimal shape of the Images binding, declared locally so this doesn't depend
 * on a particular @cloudflare/workers-types release exposing it.
 */
interface ImagesBinding {
	input(stream: ReadableStream): ImageTransformer;
}
interface ImageTransformer {
	transform(options: { width?: number; height?: number }): ImageTransformer;
	output(options: { format: string; quality?: number }): Promise<{
		response(): Response;
	}>;
}

export interface Env {
	BUCKET: R2Bucket;
	IMAGES: ImagesBinding;
	IMAGE_COOKIE_SECRET: string;
	APP_ORIGIN: string;
}

/**
 * Transformations bill per *unique* (image, parameters) pair per month, so the
 * set of widths is closed. An open `?w=` would let one caller mint unlimited
 * unique transformations against the account's allowance.
 */
const ALLOWED_WIDTHS = new Set([400, 800, 1600]);

const CACHE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Must be set explicitly. Without it the encoder produced effectively lossless
 * WebP — a 400px-wide thumbnail came back at 129 KB against a 310 KB full-size
 * JPEG source, and 1600px at 1.65 MB. Transforming was making things worse.
 */
const OUTPUT_QUALITY = 82;

/**
 * Bump whenever the transform or encoding changes. Without it a deploy leaves
 * every previously-cached variant in place until its 30-day TTL lapses — and
 * that failure is invisible, because stale bytes still come back as a 200.
 * Adding `quality` above was exactly this case.
 */
const CACHE_VERSION = "2";

function parseWidth(raw: string | null): number | null {
	if (!raw) return null;
	const width = Number(raw);
	return ALLOWED_WIDTHS.has(width) ? width : null;
}

function corsHeaders(env: Env): Record<string, string> {
	return {
		// Must be a concrete origin, not "*", for a credentialed fetch to be
		// allowed to read the body.
		"Access-Control-Allow-Origin": env.APP_ORIGIN,
		"Access-Control-Allow-Credentials": "true",
		Vary: "Origin",
	};
}

function deny(status: number, env: Env): Response {
	return new Response(null, {
		status,
		headers: { ...corsHeaders(env), "Cache-Control": "no-store" },
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					...corsHeaders(env),
					"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		if (request.method !== "GET" && request.method !== "HEAD") {
			return deny(405, env);
		}

		if (!env.IMAGE_COOKIE_SECRET) {
			// Fail closed. A missing secret must never degrade into open access.
			console.error("IMAGE_COOKIE_SECRET is not configured");
			return deny(500, env);
		}

		const url = new URL(request.url);
		const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
		if (!key || key.includes("..")) return deny(404, env);

		let claims: ImageCookieClaims | null;
		try {
			claims = await verifyImageCookie(
				readCookie(request.headers.get("Cookie"), COOKIE_NAME),
				env.IMAGE_COOKIE_SECRET,
			);
		} catch (error) {
			console.error("Cookie verification threw", error);
			return deny(403, env);
		}
		if (!claims) return deny(403, env);

		// Keys are `<frameId>/<filename>`. Holding a valid cookie isn't enough:
		// it has to name this frame.
		const prefix = key.split("/")[0];
		if (!prefix || !claims.f.includes(prefix)) return deny(403, env);

		const width = parseWidth(url.searchParams.get("w"));

		// Auth is settled before anything touches the cache. The key carries a
		// digest of the caller's entitlements so a cached object can only ever be
		// handed to someone allowed the same frames.
		const cache = caches.default;
		const cacheKey = new Request(
			`${url.origin}/${encodeURIComponent(key)}?v=${CACHE_VERSION}&w=${width ?? "orig"}&s=${await scopeHash(claims.f)}`,
			{ method: "GET" },
		);

		const cached = await cache.match(cacheKey);
		if (cached) return asPrivate(cached, env);

		const object = await env.BUCKET.get(key);
		if (!object) return deny(404, env);

		let response: Response;
		if (width) {
			response = (
				await env.IMAGES.input(object.body)
					.transform({ width })
					.output({ format: "image/webp", quality: OUTPUT_QUALITY })
			).response();
		} else {
			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set("ETag", object.httpEtag);
			response = new Response(object.body, { headers });
		}

		// Stored public so the edge will keep it; handed to the client as private
		// so no shared proxy in between does the same without the auth check.
		const storable = new Response(response.body, response);
		storable.headers.set("Cache-Control", `public, max-age=${CACHE_SECONDS}`);
		ctx.waitUntil(cache.put(cacheKey, storable.clone()));

		return asPrivate(storable, env);
	},
} satisfies ExportedHandler<Env>;

function asPrivate(response: Response, env: Env): Response {
	const out = new Response(response.body, response);
	out.headers.set("Cache-Control", `private, max-age=${CACHE_SECONDS}`);
	for (const [header, value] of Object.entries(corsHeaders(env))) {
		out.headers.set(header, value);
	}
	return out;
}
