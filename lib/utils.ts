import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function wait(time: number = 1000) {
	await new Promise((resolve) => setTimeout(resolve, time));
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
			.replace(/[_-\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""));
		result[camelKey] = value;
	}
	return result as T;
}

export function getRelativeTime(date: Date) {
	const now = new Date().getTime();
	const isValidDate = date instanceof Date && !isNaN(date.getTime());
	const diffInSeconds = Math.floor(
		(now - (isValidDate ? date.getTime() : new Date(date).getTime())) / 1000,
	);
	const isFuture = diffInSeconds < 0;
	const absDiff = Math.abs(diffInSeconds);

	const intervals = [
		{ label: "year", seconds: 31536000 },
		{ label: "month", seconds: 2592000 },
		{ label: "week", seconds: 604800 },
		{ label: "day", seconds: 86400 },
		{ label: "hour", seconds: 3600 },
		{ label: "minute", seconds: 60 },
		{ label: "second", seconds: 1 },
	];

	// Handle "just now" case
	if (absDiff < 30) {
		return "just now";
	}

	// Find the appropriate interval
	for (const interval of intervals) {
		const count = Math.floor(absDiff / interval.seconds);
		if (count >= 1) {
			const plural = count !== 1 ? "s" : "";
			const timeText = `${count} ${interval.label}${plural}`;
			return isFuture ? `in ${timeText}` : `${timeText} ago`;
		}
	}

	return "just now";
}

export const formatFileSize = (input: number | string | undefined) => {
	if (!input) return;
	let bytes: number;

	if (typeof input === "string") {
		bytes = parseInt(input);
	} else {
		bytes = input;
	}
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const formatDate = (input: string | Date | undefined) => {
	if (!input) return;
	let date;

	if (typeof input === "string") {
		date = new Date(input);
	} else {
		date = input;
	}

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};
