"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IconDashboard } from "@tabler/icons-react";
import {
  Activity,
  Calendar,
  CalendarCheck,
  GaugeIcon,
  Layout,
  LayoutDashboard,
  Settings,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export type Organization = {
  id: string;
  slug: string;
  imageUrl: string;
  name: string;
};

interface NavItemProps {
  isExpanded: boolean;
  isActive: boolean;
  group: any;
  onExpand: (id: string) => void;
}

export const NavItem = ({
  isExpanded,
  onExpand,
  group,
  isActive,
}: NavItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = [
    {
      label: "Sprints",
      icon: <ZapIcon className="h-4 w-4 mr-2" />,
      href: `/tracker/group/${group.id}`,
    },
    {
      label: "Planner",
      icon: <CalendarCheck className="h-4 w-4 mr-2" />,
      href: `/tracker/group/${group.id}/planner`,
    },
    {
      label: "Templates",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      href: `/tracker/group/${group.id}/templates`,
    },
    {
      label: "Activity",
      icon: <Activity className="h-4 w-4 mr-2" />,
      href: `/tracker/group/${group.id}/activity`,
    },
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
      href: `/tracker/group/${group.id}/settings`,
      link: `/tracker/group/${group.id}/settings/organization-members`,
    },
  ];

  const onClick = (href: string) => {
    router.push(href);
  };

  return (
    <AccordionItem value={group.id} className="border-none">
      <AccordionTrigger
        onClick={() => onExpand(group.id)}
        className={cn(
          "flex items-center gap-x-2 p-1.5 text-gray-200 rounded-md hover:bg-n-5/60 transition-all text-start no-underline hover:no-underline",
          isActive && !isExpanded && "bg-n-6 hover:bg-n-6 "
        )}
      >
        <div className="flex items-center gap-x-2">
          <div className="w-7 h-7 relative">
            <Image
              fill
              src={group.imageUrl}
              alt={group.name}
              className="rounded-md object-cover"
            />
          </div>
          <span className="font-medium"> {group.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-1 text-gray-200">
        {routes.map((route) => (
          <Button
            key={route.href}
            size="sm"
            onClick={() => onClick(route.href)}
            variant={"ghost"}
            className={cn(
              "w-full font-normal justify-start pl-10 mb-1 hover:bg-n-5/60",
              pathname === route.href && "bg-n-6 hover:bg-n-6 ",
              pathname === route.link && "bg-n-6 hover:bg-n-6 "
            )}
          >
            {route.icon} {route.label}
          </Button>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

NavItem.Skeleton = function SkeletonNavItem() {
  return (
    <>
      <div className="flex mb-4 items-center gap-x-2">
        <div className="w-[80%] h-10 relative shrink-0">
          <Skeleton className="h-full w-full absolute " />
        </div>
      </div>
    </>
  );
};
