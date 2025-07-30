import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ["@phosphor-icons/react"],
	},
	images: {
		remotePatterns: [
			new URL("https://unsplash.it/**"),
			new URL("https://unsplash.it/300/200?random"),
			new URL("https://picsum.photos/**"),
			new URL(`https://images.frame.ndo.dev/**`),
		],
	},
};

export default nextConfig;
