import React, { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import { ActivityList } from "./_components/activity-list";
export const revalidate = 0;

const ActivityPage = async () => {
  return (
    <div className="w-full">
      <h1 className="flex">
        <Info className="inline mr-2" /> Members Activity
      </h1>
      <Separator className="my-2" />
      <Suspense fallback={<ActivityList.Skeleton />}>
        <ActivityList />
      </Suspense>
    </div>
  );
};

export default ActivityPage;
