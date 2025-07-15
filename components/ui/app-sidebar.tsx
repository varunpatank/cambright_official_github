"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LucideIcon, // Import LucideIcon type
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Define types for props
type Team = {
  name: string;
  logo: React.ComponentType<any>; // Logo is a React component (icon)
  plan: string;
  link: string;
};

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon; // Icon is a LucideIcon (component type, not ReactElement)
  isActive?: boolean;
  items: {
    title: string;
    url: string;
  }[];
};

type Project = {
  name: string;
  url: string;
  icon: LucideIcon; // Icon is a LucideIcon (component type, not ReactElement)
};

type User = {
  name: string;
  email: string;
  avatar: string;
};

type SidebarData = {
  user: User;
  teams: Team[];
  navMain: NavItem[];
  projects: Project[];
};

interface AppSidebarProps {
  data: SidebarData;
}

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Render NavMain */}
        <NavMain
          items={data.navMain.map((item) => ({
            ...item,
            // Pass the icon as a component reference (not rendered JSX)
            icon: item.icon,
          }))}
        />
        {/* Render NavProjects */}
        <NavProjects
          projects={data.projects.map((project) => ({
            ...project,
            // Pass the icon as a component reference (not rendered JSX)
            icon: project.icon,
          }))}
        />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
