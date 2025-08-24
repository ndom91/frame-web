"use client";

import { passkey } from "@/app/lib/auth-client";
import { useEffect } from "react";

export default function RegisterPasskey() {
	useEffect(() => {
		if (!document) return;

		const pathnameParams = new URLSearchParams(new URL(document.URL).search);
		async function registerPasskey() {
			if (pathnameParams.get("new-user") === "true") {
				const response = await passkey.addPasskey();
				if (response) {
					const { data, error } = response;
					console.log("PASSKEY", { data, error });
				}
			}
		}
		registerPasskey();
	}, []);

	return (
		<div>
			<h3>Passkey Registered</h3>
		</div>
	);
}
