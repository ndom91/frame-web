import type { Metadata } from "next";
import type { Viewport } from "next";

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	colorScheme: "dark light",
};

export const metadata: Metadata = {
	title: "Domino Frame",
	description: "Manage your Frames",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	robots: {
		index: false,
		follow: false,
		nocache: false,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: false,
		},
	},
	openGraph: {
		title: "Domino Frame",
		description: "Manage your Frames",
		url: "https://domino.photos",
		siteName: "Domino Frame",
		images: [
			{
				url: "https://domino.photos/logo.png", // Must be an absolute URL
				width: 256,
				height: 256,
			},
		],
		locale: "en_US",
		type: "website",
	},
	icons: {
		icon: [{ url: "/logo.png" }],
		shortcut: ["/logo.png"],
		apple: [{ url: "/logo.png" }],
		other: [
			{
				rel: "apple-touch-icon-precomposed",
				url: "/apple-touch-icon-precomposed.png",
			},
		],
	},
	appleWebApp: {
		title: "Domino Frame",
		statusBarStyle: "black-translucent",
		startupImage: ["/logo.png"],
	},
};
