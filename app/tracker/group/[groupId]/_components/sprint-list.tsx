import { HelpCircle, SquarePlus, User2, Zap } from "lucide-react";
import { Hint } from "../../_components/hint";
import { FormPopover } from "../../_components/form/form-popover";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export const SprintList = async () => {
  const { orgId } = auth();
  if (!orgId) {
    return redirect("/tracker/select-group");
  }
  const sprints = await db.sprint.findMany({
    where: {
      orgId: orgId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center font-semibold text-lg">
        <User2 className="h-6 mr-6 w-6" />
        Your Sprints
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
        {sprints.map((sprint) => (
          <Link
            href={`/tracker/sprint/${sprint.id}`}
            key={sprint.id}
            style={{ backgroundImage: `url(${sprint.imageThumbUrl})` }}
            className="group relative bg-purple-700 aspect-video bg-no-repeat bg-center rounded-md bg-cover h-full w-full p-2 overflow-hidden "
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
            <p className="text-white relative text-lg font-semibold">
              <Zap className="text-white z-10" />
              {sprint.title}
            </p>
          </Link>
        ))}
        <FormPopover>
          <div
            role="button"
            className="aspect-video relative h-full w-full bg-n-6 rounded-sm flex flex-col gap-y-1 items-center justify-center hover:bg-n-6/75 transition p-2 md:p-0"
          >
            <span>
              {" "}
              <SquarePlus />
            </span>
            <p className="sm:hidden block">New</p>
            <p className="sm:block hidden">Create new sprint</p>
            <Hint
              sideOffset={40}
              description="You can create sprints to boost your studying plan as a team/alone!"
            >
              <HelpCircle className="absolute bottom-2 right-2 h-[14px] w-[14px]" />
            </Hint>
          </div>
        </FormPopover>
      </div>
    </div>
  );
};

SprintList.Skeleton = function SkeletonBoardList() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
    </div>
  );
};
