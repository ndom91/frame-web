"use client";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useFrames } from "@/app/lib/queries/frames";
import { getStatusBadge } from "@/app/(dashboard)/frame/[id]/frame";

export function NavFrames() {
	const { data: frames } = useFrames();

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Frames</SidebarGroupLabel>
			<SidebarMenu>
				{frames?.map((frame) => (
					<SidebarMenuItem key={frame.id}>
						<SidebarMenuButton asChild>
							<a
								href={`/frame/${frame.id}`}
								className="flex flex-col items-start"
							>
								<div className="flex gap-1">
									<span>{frame.title}</span>
									<span className="opacity-80 scale-80">
										{getStatusBadge(frame.status)}
									</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
