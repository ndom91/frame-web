"use client";

import { useFrames } from "@/app/lib/queries/frames";
import Frame from "./frames/list/frameCard";
import { FrameCornersIcon } from "@phosphor-icons/react/dist/ssr/FrameCorners";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { useQueries } from "@tanstack/react-query";

export default function DashboardPage() {
	const {
		data: frames = [],
		isLoading: framesLoading,
		error: framesError,
	} = useFrames();

	const mediaQueries = useQueries({
		queries: frames.map((frame) => ({
			queryKey: ["media", frame.frameId],
			queryFn: async () => {
				const url = new URL("/api/media", window.location.origin);
				if (frame.frameId) {
					url.searchParams.set("prefix", frame.frameId);
				}

				const response = await fetch(url.toString());
				if (!response.ok) {
					throw new Error("Failed to fetch media files");
				}
				return response.json();
			},
		})),
	});

	const totalMediaCount = mediaQueries.reduce((total, query) => {
		return total + (query.data?.length || 0);
	}, 0);

	return (
		<>
			<div className="grid auto-rows-min gap-4 md:grid-cols-2">
				<div className=" flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5">
					<FrameCornersIcon
						size={168}
						className="absolute -top-2 -right-10 rotate-10 text-muted-foreground/20"
					/>
					<div className="text-sidebar-foreground text-8xl">
						{frames.length ?? 0}
					</div>
					<div className="text-sidebar-foreground/75 text-2xl">Frames</div>
				</div>
				<div className=" flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5">
					<ImageIcon
						size={168}
						className="absolute -top-2 -right-10 rotate-10 text-muted-foreground/15"
					/>
					<div className="text-sidebar-foreground text-8xl">
						{totalMediaCount ?? 0}
					</div>
					<div className="text-sidebar-foreground/75 text-2xl">Images</div>
				</div>
			</div>
			<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-5">
				<div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-3">
					{!framesLoading &&
						!framesError &&
						frames.map((frame) => <Frame key={frame.id} frame={frame} />)}
				</div>
			</div>
		</>
	);
}
