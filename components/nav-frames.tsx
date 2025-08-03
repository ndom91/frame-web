"use client";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	// useSidebar,
} from "@/components/ui/sidebar";
import { useFrames } from "@/app/lib/queries/frames";
import { getStatusBadge } from "@/app/(dashboard)/frame/[id]/frame";

export function NavFrames() {
	// const { isMobile } = useSidebar();
	const { data: frames } = useFrames();

	console.log("NavFrames.frames", frames);

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
						{/* <DropdownMenu> */}
						{/* 	<DropdownMenuTrigger asChild> */}
						{/* 		<SidebarMenuAction showOnHover> */}
						{/* 			<MoreHorizontal /> */}
						{/* 			<span className="sr-only">More</span> */}
						{/* 		</SidebarMenuAction> */}
						{/* 	</DropdownMenuTrigger> */}
						{/* 	<DropdownMenuContent */}
						{/* 		className="w-48" */}
						{/* 		side={isMobile ? "bottom" : "right"} */}
						{/* 		align={isMobile ? "end" : "start"} */}
						{/* 	> */}
						{/* 		<DropdownMenuItem> */}
						{/* 			<Folder className="text-muted-foreground" /> */}
						{/* 			<span>View Project</span> */}
						{/* 		</DropdownMenuItem> */}
						{/* 		<DropdownMenuItem> */}
						{/* 			<Share className="text-muted-foreground" /> */}
						{/* 			<span>Share Project</span> */}
						{/* 		</DropdownMenuItem> */}
						{/* 		<DropdownMenuSeparator /> */}
						{/* 		<DropdownMenuItem> */}
						{/* 			<Trash2 className="text-muted-foreground" /> */}
						{/* 			<span>Delete Project</span> */}
						{/* 		</DropdownMenuItem> */}
						{/* 	</DropdownMenuContent> */}
						{/* </DropdownMenu> */}
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
