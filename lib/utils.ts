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
