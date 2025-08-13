"use client";

import { useFrames } from "@/app/lib/queries/frames";
import Frame from "./frames/list/frame";

export default function DashboardPage() {
	const { data: frames = [], isLoading, error } = useFrames();
	return (
		<div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-3">
			{!isLoading &&
				!error &&
				frames.map((frame) => <Frame key={frame.id} frame={frame} />)}
		</div>
	);
}
