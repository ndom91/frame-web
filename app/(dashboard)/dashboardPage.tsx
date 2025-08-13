"use client";

import { useFrames } from "@/app/lib/queries/frames";
import Frame from "./frames/list/frame";
import { FrameCornersIcon } from "@phosphor-icons/react/dist/ssr/FrameCorners";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { VideoIcon } from "@phosphor-icons/react/dist/ssr/Video";

export default function DashboardPage() {
	const { data: frames = [], isLoading, error } = useFrames();

	return (
		<>
			<div className="grid auto-rows-min gap-4 md:grid-cols-3">
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
					<div className="text-sidebar-foreground text-8xl">32</div>
					<div className="text-sidebar-foreground/75 text-2xl">Images</div>
				</div>
				<div className=" flex flex-col justify-between relative rounded-xl bg-muted/50 overflow-hidden p-5">
					<VideoIcon
						size={168}
						className="absolute -top-2 -right-10 rotate-10 text-muted-foreground/15"
					/>
					<div className="text-sidebar-foreground text-8xl">2</div>
					<div className="text-sidebar-foreground/75 text-2xl">Videos</div>
				</div>
			</div>
			<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-5">
				<div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-3">
					{!isLoading &&
						!error &&
						frames.map((frame) => <Frame key={frame.id} frame={frame} />)}
				</div>
			</div>
		</>
	);
}
