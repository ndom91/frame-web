import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function wait(time: number = 1000) {
	await new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Widths the images Worker will actually resize to. Transformations bill per
 * unique (image, parameters) pair, so the set is closed on both ends — the
 * Worker serves the untouched original for anything outside it.
 */
export const IMAGE_WIDTHS = [400, 800, 1600] as const;

export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

/**
 * Offers every width the Worker will serve, so the browser picks one from the
 * viewport and pixel density rather than us guessing. Paired with `sizes`, a 1×
 * display stops downloading the 2× variant.
 *
 * Returns undefined for URLs we don't serve (the placeholder), so no bogus
 * srcset is emitted.
 */
export function imageSrcSet(url: string): string | undefined {
	const widths = IMAGE_WIDTHS.map(
		(width) => `${sizedImageUrl(url, width)} ${width}w`,
	);
	// sizedImageUrl passes foreign URLs through untouched, so an unchanged first
	// entry means this isn't ours to resize.
	if (widths[0] === `${url} ${IMAGE_WIDTHS[0]}w`) return undefined;
	return widths.join(", ");
}

/**
 * Requests a resized variant, but only from our own image host. Placeholder and
 * third-party URLs are passed through untouched.
 */
export function sizedImageUrl(url: string, width: ImageWidth): string {
	const hostname = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME;
	if (!url || !hostname) return url;

	try {
		const parsed = new URL(url);
		if (parsed.hostname !== hostname.split(":")[0]) return url;
		parsed.searchParams.set("w", String(width));
		return parsed.toString();
	} catch {
		return url;
	}
}

export function lowercaseKeys(obj: Record<string, unknown>) {
	if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
		return obj;
	}

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		result[key.toLowerCase()] = value;
	}
	return result;
}

export function camelCaseKeys<T>(obj: T): T {
	if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
		return obj as T;
	}

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		const camelKey = key
			.toLowerCase()
			.replace(/[_\-\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""));
		result[camelKey] = value;
	}
	return result as T;
}

/**
 * Locale used when none is supplied.
 *
 * Formatting must produce identical output on the server and on the first
 * client render, so these helpers cannot silently fall back to the runtime
 * locale (Node's on the server, the browser's on the client) — that would
 * desync the two and trigger a hydration mismatch. Components that want the
 * visitor's real locale should pass one in from `useLocale()`
 * (`app/lib/use-locale.ts`), which only switches over after mount.
 */
export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_TIME_ZONE = "UTC";

/** Narrow width space, so a value and its unit never wrap apart. */
const NBSP = " ";

function toDate(input: string | number | Date | null | undefined): Date | null {
	if (input === null || input === undefined || input === "") return null;
	const date = input instanceof Date ? input : new Date(input);
	return Number.isNaN(date.getTime()) ? null : date;
}

export function getRelativeTime(
	date: string | number | Date | null | undefined,
	locale: string = DEFAULT_LOCALE,
) {
	const parsed = toDate(date);
	if (!parsed) return "";

	const diffInSeconds = Math.round((parsed.getTime() - Date.now()) / 1000);
	const absDiff = Math.abs(diffInSeconds);

	if (absDiff < 30) return "just now";

	const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
		{ unit: "year", seconds: 31536000 },
		{ unit: "month", seconds: 2592000 },
		{ unit: "week", seconds: 604800 },
		{ unit: "day", seconds: 86400 },
		{ unit: "hour", seconds: 3600 },
		{ unit: "minute", seconds: 60 },
		{ unit: "second", seconds: 1 },
	];

	const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

	for (const { unit, seconds } of units) {
		if (absDiff >= seconds) {
			return formatter.format(Math.trunc(diffInSeconds / seconds), unit);
		}
	}

	return "just now";
}

const FILE_SIZE_UNITS = ["B", "kB", "MB", "GB", "TB"] as const;

/**
 * Formats a byte count using SI units, so the divisor (1000) and the label
 * agree — the previous implementation divided by 1024 but labelled the result
 * "kB", and only ever emitted kB, rendering 3.5 GB as "3670016.0 kB".
 */
export function formatFileSize(
	input: number | string | null | undefined,
	locale: string = DEFAULT_LOCALE,
): string {
	const bytes = typeof input === "string" ? Number.parseInt(input, 10) : input;

	if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return "";
	if (bytes <= 0) return `0${NBSP}B`;

	const exponent = Math.min(
		Math.floor(Math.log10(bytes) / 3),
		FILE_SIZE_UNITS.length - 1,
	);
	const value = bytes / 1000 ** exponent;

	const formatted = new Intl.NumberFormat(locale, {
		maximumFractionDigits: exponent === 0 ? 0 : 1,
	}).format(value);

	return `${formatted}${NBSP}${FILE_SIZE_UNITS[exponent]}`;
}

export function formatDate(
	input: string | number | Date | null | undefined,
	locale: string = DEFAULT_LOCALE,
	timeZone: string = DEFAULT_TIME_ZONE,
): string {
	const date = toDate(input);
	if (!date) return "";

	return new Intl.DateTimeFormat(locale, {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone,
	}).format(date);
}

/** Same value as `formatDate`, plus the time — for tooltips and detail rows. */
export function formatDateTime(
	input: string | number | Date | null | undefined,
	locale: string = DEFAULT_LOCALE,
	timeZone: string = DEFAULT_TIME_ZONE,
): string {
	const date = toDate(input);
	if (!date) return "";

	return new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone,
	}).format(date);
}
