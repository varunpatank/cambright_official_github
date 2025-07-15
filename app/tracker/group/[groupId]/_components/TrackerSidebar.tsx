"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";
import { NavItem, Organization } from "./tracker-nav-item";

interface TrackerSidebarProps {
  storageKey?: string;
}

const TrackerSidebar = ({
  storageKey = "t-sidebar-state",
}: TrackerSidebarProps) => {
  const [expanded, setExpanded] = useLocalStorage<Record<string, any>>(
    storageKey,
    {}
  );
  const { organization: activeOrganization, isLoaded: isLoadedOrg } =
    useOrganization();

  const { userMemberships, isLoaded: isLoadedOrgList } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const defaultAccordionValue: string[] = Object.keys(expanded).reduce(
    (acc: string[], key: string) => {
      if (expanded[key]) {
        acc.push(key);
      }
      return acc;
    },
    []
  );

  const onExpand = (id: string) => {
    setExpanded((curr) => ({ ...curr, [id]: !expanded[id] }));
  };

  if (!isLoadedOrg || !isLoadedOrgList || userMemberships.isLoading) {
    return (
      <>
        <div className="font-medium pt-6 mb-1 bg-n-7 min-w-full pl-2 pr-2 gap-x-2 py-2">
          <Skeleton className="h-10 w-[90%] mb-4" />
          <NavItem.Skeleton /> <NavItem.Skeleton /> <NavItem.Skeleton />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="font-medium pt-6 mb-1 bg-n-7 min-w-full pl-2 pr-2 ">
        <div className="flex">
          <span className="pl-2 pt-2">Study Groups</span>
          <Button
            asChild
            className="ml-auto hover:bg-n-8 transition-all"
            size={"icon"}
            variant={"ghost"}
          >
            <Link href={"/tracker/select-group"}>
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <Accordion
          type="multiple"
          defaultValue={defaultAccordionValue}
          className="space-y-2"
        >
          {userMemberships.data.map(({ organization }) => (
            <NavItem
              key={organization.id}
              isActive={activeOrganization?.id === organization.id}
              isExpanded={expanded[organization.id]}
              group={organization as Organization}
              onExpand={onExpand}
            />
          ))}
        </Accordion>
      </div>
    </>
  );
};

export default TrackerSidebar;
