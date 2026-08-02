"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div
			role="alert"
			className="flex flex-col items-start justify-start gap-2 p-4"
		>
			<h2 className="text-lg font-semibold">Something went wrong</h2>
			<p className="text-muted-foreground text-sm">
				This page couldn&rsquo;t load. Try again, and if it keeps happening,
				reload the browser.
			</p>
			{error.digest && (
				<p className="text-muted-foreground text-xs">
					Reference: <span className="font-mono">{error.digest}</span>
				</p>
			)}
			<Button className="mt-2" onClick={() => reset()}>
				Try Again
			</Button>
		</div>
	);
}
