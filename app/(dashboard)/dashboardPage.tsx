"use client";

import { useFrames } from "@/app/lib/queries/frames";
import Frame from "./frames/list/frameCard";
import SkeletonCard from "@/components/card-skeleton";
import { FrameCornersIcon } from "@phosphor-icons/react/dist/ssr/FrameCorners";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { useQueries } from "@tanstack/react-query";
import { useLocale } from "@/app/lib/use-locale";

function StatTile({
	label,
	value,
	icon,
	iconClassName,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	iconClassName?: string;
}) {
	return (
		<div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-muted/50 p-5">
			<div aria-hidden="true" className={iconClassName}>
				{icon}
			</div>
			<div className="text-sidebar-foreground text-8xl tabular-nums">
				{value}
			</div>
			<div className="text-sidebar-foreground/75 text-2xl">{label}</div>
		</div>
	);
}

export default function DashboardPage() {
	const locale = useLocale();
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

	const formatCount = (count: number) =>
		new Intl.NumberFormat(locale).format(count);

	return (
		<>
			<div className="grid auto-rows-min gap-4 md:grid-cols-2">
				<StatTile
					label="Frames"
					value={formatCount(frames.length)}
					iconClassName="absolute -top-2 -right-10 rotate-[10deg] text-muted-foreground/20"
					icon={<FrameCornersIcon size={168} />}
				/>
				<StatTile
					label="Images"
					value={formatCount(totalMediaCount)}
					iconClassName="absolute -top-2 -right-10 rotate-[10deg] text-muted-foreground/15"
					icon={<ImageIcon size={168} />}
				/>
			</div>
			<div className="min-h-[100dvh] flex-1 rounded-xl bg-muted/50 p-5 md:min-h-min">
				<div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-3">
					{framesLoading &&
						Array.from({ length: 3 }).map((_, index) => (
							<SkeletonCard key={index} />
						))}

					{!framesLoading &&
						!framesError &&
						frames.map((frame) => <Frame key={frame.id} frame={frame} />)}
				</div>

				{!framesLoading && framesError && (
					<div role="alert" className="py-12 text-center">
						<p className="mb-2 text-destructive">Couldn&rsquo;t load frames</p>
						<p className="text-muted-foreground text-sm">
							{framesError.message}
						</p>
					</div>
				)}

				{!framesLoading && !framesError && frames.length === 0 && (
					<p className="py-12 text-center text-muted-foreground">
						No frames yet. Add your first frame to get started.
					</p>
				)}
			</div>
		</>
	);
}
