"use client";

import { useFrames } from "@/app/lib/queries/frames";
import Frame from "./frames/list/frame";

export default function DashboardPage() {
	const { data: frames = [], isLoading, error } = useFrames();
	return (
		<>
			{!isLoading &&
				!error &&
				frames.map((frame) => <Frame key={frame.id} frame={frame} />)}
		</>
	);
}
