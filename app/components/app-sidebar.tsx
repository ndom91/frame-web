"use client"

import * as React from "react"
import { ApertureIcon } from "@phosphor-icons/react/dist/ssr/Aperture";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { FrameCornersIcon } from "@phosphor-icons/react/dist/ssr/FrameCorners";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { LifebuoyIcon } from "@phosphor-icons/react/dist/ssr/Lifebuoy";

import { NavMain } from "@/app/components/nav-main"
// import { NavProjects } from "@/app/components/nav-projects"
import { NavSecondary } from "@/app/components/nav-secondary"
import { NavUser } from "@/app/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { type Session } from "../lib/auth"

const data = {
  navMain: [
    {
      title: "Media",
      icon: ImagesIcon,
      isActive: true,
      items: [
        {
          title: "Upload",
          url: "/dashboard/media/upload",
        },
        {
          title: "View All",
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
          title: "Add",
          url: "/dashboard/frames/add",
        },
        {
          title: "List",
          url: "/dashboard/frames/list",
        },
        {
          title: "Settings",
          url: "/dashboard/frames/settings",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifebuoyIcon,
    },
    {
      title: "Feedback",
      url: "#",
      icon: PaperPlaneTiltIcon,
    },
  ],
}

type Props = {
  session: Session | null
} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({ ...props }: Props) {
  console.log('AppSidebar.sessoin', props.session)
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ApertureIcon className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="truncate font-semibold">Domino Frame</div>
                  <div className="truncate text-xs flex items-center gap-2">Share the love</div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.session?.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
