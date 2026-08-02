import type { NextConfig } from "next";

// Read from env rather than hardcoded, so pointing the app at a different image
// host (or a local `wrangler dev`) doesn't require editing two places.
const imageHostname = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME;

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ["@phosphor-icons/react"],
	},
	images: {
		remotePatterns: [
			new URL("https://unsplash.it/**"),
			new URL("https://unsplash.it/300/200?random"),
			new URL("https://picsum.photos/**"),
			// Frame photos render with `unoptimized`, since the optimizer fetches
			// server-side without the user's cookie and the images Worker rejects
			// that. Listed anyway so the app still works if that flag is dropped.
			...(imageHostname ? [new URL(`https://${imageHostname}/**`)] : []),
		],
	},
	async redirects() {
		return [
			{ source: "/frames", destination: "/frames/list", permanent: true },
		];
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
		];
	},
};

export default nextConfig;
