"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useFrames } from "@/app/lib/queries/frames";
import { FrameStatusBadge } from "@/components/frame-status";

export function NavFrames() {
	const { data: frames, isLoading, error } = useFrames();
	const pathname = usePathname();

	const frameList = Array.isArray(frames) ? frames : [];

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Frames</SidebarGroupLabel>
			<SidebarMenu>
				{isLoading &&
					// Placeholder rows, so the group isn't silently blank while loading.
					Array.from({ length: 3 }).map((_, index) => (
						<SidebarMenuItem key={index}>
							<SidebarMenuSkeleton />
						</SidebarMenuItem>
					))}

				{!isLoading && error && (
					<SidebarMenuItem>
						<p className="px-2 py-1 text-xs text-muted-foreground">
							Couldn&rsquo;t load frames. Reload the page to try again.
						</p>
					</SidebarMenuItem>
				)}

				{!isLoading && !error && frameList.length === 0 && (
					<SidebarMenuItem>
						<p className="px-2 py-1 text-xs text-muted-foreground">
							No frames yet.{" "}
							<Link href="/frames/add" className="underline">
								Add one
							</Link>
							.
						</p>
					</SidebarMenuItem>
				)}

				{!isLoading &&
					!error &&
					frameList.map((frame) => {
						const href = `/frame/${frame.id}`;
						const isCurrent = pathname === href;

						return (
							<SidebarMenuItem key={frame.id}>
								<SidebarMenuButton asChild isActive={isCurrent}>
									<Link
										href={href}
										aria-current={isCurrent ? "page" : undefined}
									>
										<div className="flex min-w-0 items-center gap-1">
											<span className="truncate">{frame.title}</span>
											<span className="scale-[0.8] opacity-80">
												<FrameStatusBadge status={frame.status} />
											</span>
										</div>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
