// v.0.0.01 salah
"use client";
import { getProgress } from "@/actions/get-progress-notes";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  Atom,
  BookOpen,
  FlaskConical,
  Frame,
  GalleryVerticalEnd,
  Languages,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  teams: [
    {
      name: "AS/AL Chemistry",
      logo: FlaskConical,
      plan: "Cambridge",
      link: "/nts/alchemistry",
    },
    {
      name: "IGCSE EFL",
      logo: Languages,
      plan: "Cambridge",
      link: "/nts/efl",
    },
  ],
  navMain: [
    {
      title: "Unit 1",
      url: "#",
      icon: Atom,
      isActive: true,
      items: [
        {
          title: "The Atom",
          url: "/nts/alchemistry",
        },
        {
          title: "Isotopes",
          url: "/nts/alchemistry/t1/isotopes",
        },
        {
          title: "Energy Levels",
          url: "/nts/alchemistry/t1/energy",
        },
        // {
        //   title: "Starred",
        //   url: "#",
        // },
        // {
        //   title: "Settings",
        //   url: "#",
        // },
      ],
    },
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    // // {
    // //   title: "Documentation",
    // //   url: "#",
    // //   icon: BookOpen,
    // //   items: [
    // //     {
    // //       title: "Introduction",
    // //       url: "#",
    // //     },
    // //     {
    // //       title: "Get Started",
    // //       url: "#",
    // //     },
    // //     {
    // //       title: "Tutorials",
    // //       url: "#",
    // //     },
    // //     {
    // //       title: "Changelog",
    // //       url: "#",
    // //     },
    // //   ],
    // // },
  ],
  projects: [
    // {
    //   name: "Design Engineering",
    //   url: "#",
    //   icon: Frame,
    // },
    // {
    //   name: "Sales & Marketing",
    //   url: "#",
    //   icon: PieChart,
    // },
    // {
    //   name: "Travel",
    //   url: "#",
    //   icon: Map,
    // },
  ],
};

const NoteLayout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { noteId: string };
}) => {
  return (
    <SidebarProvider>
      <AppSidebar data={data} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-n-7 ">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">AS/AL Chem</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Unit 1</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Link href={"/search-notes"} className="justify-end absolute right-4">
            <Button
              className="mt-1
           hover:bg-n-8
           bg-n-6/60
           "
              variant={"default"}
            >
              <LogOut className="h-4 w-4 mr-2" /> Exit
            </Button>
          </Link>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 bg-n-8">
          {children}{" "}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
export default NoteLayout;
