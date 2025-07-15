import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ActivityItem } from "../../../_components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import { MathUtils } from "three";

export const ActivityList = async () => {
  const { orgId } = auth();
  if (!orgId) {
    redirect("/tracker/select-group");
  }
  const auditLogs = await db.auditLog.findMany({
    where: {
      orgId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <ol className="space-y-4 mt-4 pb-4">
      <p className="hidden last:block text-xs text-center text-muted-foreground">
        No activity found inside this Organization
      </p>
      {auditLogs.map((audit, i) => (
        <ActivityItem data={audit} key={`${i}-${MathUtils.randFloat(0, 1)}`} />
      ))}
    </ol>
  );
};

ActivityList.Skeleton = function ActivityListSkeleton() {
  return (
    <ol className="space-y-4 mt-4">
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[50%] h-14" />
      <Skeleton className="w-[70%] h-14" />
      <Skeleton className="w-[80%] h-14" />
      <Skeleton className="w-[75%] h-14" />
    </ol>
  );
};
