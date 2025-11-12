import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Domino Photos",
		short_name: "Domino Photos",
		description: "Manage your Domino Photo Frames directly from your phone!",
		start_url: "/",
		display: "standalone",
		background_color: "#ccc",
		theme_color: "#000000",
		icons: [
			{
				src: "/logo_192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/logo_512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
