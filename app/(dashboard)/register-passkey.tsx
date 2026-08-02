"use client";

import { passkey } from "@/app/lib/auth-client";
import { useEffect, useState } from "react";

type Status = "idle" | "registering" | "registered" | "failed";

/**
 * Offers to register a passkey immediately after a user signs up, signalled by
 * the `?new-user=true` callback param set in the login flow.
 */
export default function RegisterPasskey() {
	const [status, setStatus] = useState<Status>("idle");

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.get("new-user") !== "true") return;

		let cancelled = false;

		async function registerPasskey() {
			setStatus("registering");
			try {
				const response = await passkey.addPasskey();
				if (cancelled) return;
				setStatus(response?.error ? "failed" : "registered");
			} catch (error) {
				if (cancelled) return;
				console.error("Passkey registration failed", error);
				setStatus("failed");
			}
		}

		registerPasskey();

		return () => {
			cancelled = true;
		};
	}, []);

	if (status === "idle") return null;

	return (
		<div role="status" aria-live="polite" className="text-sm">
			{status === "registering" && (
				<p className="text-muted-foreground">Registering passkey…</p>
			)}
			{status === "registered" && (
				<p className="text-muted-foreground">Passkey registered.</p>
			)}
			{status === "failed" && (
				<p className="text-destructive">
					Couldn&rsquo;t register a passkey. You can add one later from your
					account settings.
				</p>
			)}
		</div>
	);
}
