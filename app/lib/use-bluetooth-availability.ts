"use client";

import { useCallback, useEffect, useState } from "react";

export type BluetoothAvailability =
	/** Server render and first client render, before the capability check runs. */
	| "checking"
	/** No `navigator.bluetooth` at all — Safari, Firefox, anything on iOS/iPadOS. */
	| "unsupported"
	/** API present but no usable radio (switched off, absent, or gated behind a flag). */
	| "unavailable"
	| "available";

/**
 * Reports whether this browser can pair with a frame over Web Bluetooth.
 *
 * `navigator` is only read inside an effect, never during render, so the server
 * and the first client render agree — the same hydration-safe shape as
 * `useLocale` and the passkey check in `components/login-form.tsx`.
 */
export function useBluetoothAvailability() {
	const [availability, setAvailability] =
		useState<BluetoothAvailability>("checking");

	const check = useCallback(async () => {
		if (typeof navigator === "undefined" || !navigator.bluetooth) {
			setAvailability("unsupported");
			return;
		}

		// getAvailability isn't implemented everywhere navigator.bluetooth exists,
		// so a throw here means "present but can't tell" — treat as usable and let
		// requestDevice surface the real error.
		try {
			const available = await navigator.bluetooth.getAvailability();
			setAvailability(available ? "available" : "unavailable");
		} catch {
			setAvailability("available");
		}
	}, []);

	useEffect(() => {
		void check();

		const bluetooth = navigator.bluetooth;
		if (!bluetooth?.addEventListener) return;

		// Fires when the user toggles Bluetooth in system settings, so the page
		// recovers without a reload.
		const onAvailabilityChanged = () => void check();
		bluetooth.addEventListener("availabilitychanged", onAvailabilityChanged);
		return () =>
			bluetooth.removeEventListener(
				"availabilitychanged",
				onAvailabilityChanged,
			);
	}, [check]);

	return { availability, recheck: check };
}
