"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCALE } from "@/lib/utils";

/**
 * The visitor's locale, in a hydration-safe way.
 *
 * Server and first client render both return `DEFAULT_LOCALE`, so the markup
 * matches; the real `navigator.language` is adopted after mount. Reading
 * `navigator` during render instead would make the server (Node's locale) and
 * the client (the browser's) disagree and produce a hydration mismatch on every
 * formatted date and file size.
 */
export function useLocale(): string {
	const [locale, setLocale] = useState(DEFAULT_LOCALE);

	useEffect(() => {
		const preferred = navigator.languages?.[0] ?? navigator.language;
		if (preferred) setLocale(preferred);
	}, []);

	return locale;
}
