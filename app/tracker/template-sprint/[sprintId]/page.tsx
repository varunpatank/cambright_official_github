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
    // If the user is not logged in or doesn't have an orgId, redirect them to select a group
    return redirect("/tracker/select-group/");
  }

  // Fetch the sprint with the given sprintId and its associated `isTemplate` field
  const sprint = await db.sprint.findUnique({
    where: {
      id: params.sprintId,
    },
  });

  if (!sprint) {
    // If no sprint is found, redirect
    return redirect("/tracker/select-group/");
  }

  if (sprint.isTemplate) {
    // If it's a template sprint, don't redirect and allow access
    const lists = await db.list.findMany({
      where: {
        sprintId: params.sprintId,
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
        <ListContainer sprintId={params.sprintId} data={lists} orgId={orgId} />
      </div>
    );
  }

  // If it's not a template sprint, check if the sprint belongs to the user's org
  if (sprint.orgId !== orgId) {
    // If the sprint does not belong to the user's org, redirect
    return redirect("/tracker/select-group/");
  }

  // Fetch the lists for the sprint if it's a non-template sprint
  const lists = await db.list.findMany({
    where: {
      sprintId: params.sprintId,
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
      <ListContainer sprintId={params.sprintId} data={lists} orgId={orgId} />
    </div>
  );
};

export default SprintIdPage;
