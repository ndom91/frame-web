/**
 * Canonical public URL for an R2 object key.
 *
 * This exact string is stored in `media.url`, and both the uploader join in
 * GET /api/media and the row lookup in DELETE /api/media/[key] match on it, so
 * every producer has to agree byte-for-byte. It used to be spelled out as a
 * template literal in three places.
 */
export const IMAGE_HOSTNAME = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME ?? "";

export function imageUrl(key: string): string {
	// `wrangler dev` serves the images Worker over plain http on localhost.
	const scheme = IMAGE_HOSTNAME.startsWith("localhost") ? "http" : "https";
	return `${scheme}://${IMAGE_HOSTNAME}/${key}`;
}
