"use client";

import * as React from "react";
import Image from "next/image";
import Logo from "./logo_transparent.png";
import { ApertureIcon } from "@phosphor-icons/react/dist/ssr/Aperture";
import { FrameCornersIcon } from "@phosphor-icons/react/dist/ssr/FrameCorners";
// import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
// import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
// import { LifebuoyIcon } from "@phosphor-icons/react/dist/ssr/Lifebuoy";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { type Session } from "@/app/lib/auth";

const data = {
	navMain: [
		// {
		//   title: "Media",
		//   icon: ImagesIcon,
		//   isActive: true,
		//   items: [
		//     {
		//       title: "Files",
		//       url: "/dashboard/media/view",
		//     },
		//     {
		//       title: "Settings",
		//       url: "/dashboard/media/settings",
		//     },
		//   ],
		// },
		{
			title: "Frames",
			icon: FrameCornersIcon,
			isActive: true,
			items: [
				{
					title: "View",
					url: "/dashboard/frames/list",
				},
				{
					title: "Add",
					url: "/dashboard/frames/add",
				},
			],
		},
	],
};

type Props = {
	session: Session | null;
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ ...props }: Props) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="#">
								<div className=" text-sidebar-primary-foreground flex items-center justify-center rounded-lg">
									<Image src={Logo} alt="Frame Logo" width={64} height={48} />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-medium">Domino Frame</span>
									<span className="text-muted-foreground">v0.1.2</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				{/* <NavProjects projects={data.projects} /> */}
			</SidebarContent>
			<SidebarFooter>
				{props.session?.user && <NavUser user={props.session?.user} />}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
