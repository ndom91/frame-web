"use client";

import * as React from "react";
import Image from "next/image";
import Logo from "./logo.png";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
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
import { NavFrames } from "@/components/nav-frames";
import packageJson from "../package.json";
import Link from "next/link";

const data = {
	navMain: [
		{
			title: "Frames",
			icon: ImagesIcon,
			isActive: true,
			items: [
				{
					title: "View",
					url: "/frames/list",
				},
				{
					title: "Add",
					url: "/frames/add",
				},
			],
		},
	],
};

type Props = {
	session: Session | null;
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ session, ...props }: Props) {
	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="text-sidebar-primary-foreground flex items-center justify-center rounded-lg">
									<Image
										src={Logo}
										alt=""
										width={36}
										height={36}
										// The source artwork is dark, so it only needs inverting
										// against the dark theme's surface.
										className="dark:invert"
									/>
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-medium" translate="no">
										Domino Frame
									</span>
									<span className="text-muted-foreground tabular-nums">
										v{packageJson.version}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavFrames />
			</SidebarContent>
			<SidebarFooter>
				{session?.user && <NavUser user={session.user} />}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
