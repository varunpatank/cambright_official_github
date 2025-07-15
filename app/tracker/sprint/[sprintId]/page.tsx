import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ListContainer } from "./_components/list-container";

interface SprintIdPageProps {
  params: {
    sprintId: string;
  };
}
const SprintIdPage = async ({ params }: SprintIdPageProps) => {
  const { orgId } = auth();
  if (!orgId) {
    redirect("/tracker/select-group/");
  }
  const lists = await db.list.findMany({
    where: {
      sprintId: params.sprintId,
      sprint: {
        orgId,
      },
    },
    include: {
      tasks: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return (
    <div className="p-4 h-full overflow-x-auto">
      <ListContainer sprintId={params.sprintId} data={lists} />
    </div>
  );
};

export default SprintIdPage;
