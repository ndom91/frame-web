"use client"

import * as React from "react"
import { ApertureIcon } from "@phosphor-icons/react/dist/ssr/Aperture";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { FrameCornersIcon } from "@phosphor-icons/react/dist/ssr/FrameCorners";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { LifebuoyIcon } from "@phosphor-icons/react/dist/ssr/Lifebuoy";

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { type Session } from "@/app/lib/auth"

const data = {
  navMain: [
    {
      title: "Media",
      icon: ImagesIcon,
      isActive: true,
      items: [
        {
          title: "Files",
          url: "/dashboard/media/view",
        },
        {
          title: "Settings",
          url: "/dashboard/media/settings",
        },
      ],
    },
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
}

type Props = {
  session: Session | null
} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({ ...props }: Props) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ApertureIcon className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Domino Frame</span>
                  <span className="">v1.0.0</span>
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
        <NavUser user={props.session?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
