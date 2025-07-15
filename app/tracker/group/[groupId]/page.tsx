import { createSprintz } from "@/actions/create-sprint";
import { db } from "@/lib/db";
import { OrganizationSwitcher } from "@clerk/nextjs";
import React, { Suspense } from "react";
import { Info } from "./_components/Info";
import { Separator } from "@/components/ui/separator";
import { SprintList } from "./_components/sprint-list";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
export const revalidate = 0;

const GroupIdPage = async () => {
  const { orgId } = auth();

  if (!orgId) {
    redirect("/select-org/");
  }

  // Fetch the count of sprints for the given organization
  const sprintCount = await db.sprint.count({
    where: {
      orgId, // Filter by the organization ID
    },
  });

  // Fetch all tasks from all lists in all sprints for the given organization
  const sprintsWithTasks = await db.sprint.findMany({
    where: {
      orgId, // Filter by the organization ID
    },
    include: {
      lists: {
        include: {
          tasks: {
            where: {
              dueDate: {
                not: null, // Only fetch tasks where dueDate is not null
              },
            },
            orderBy: {
              order: "asc", // Optional: ordering tasks within the list
            },
          },
        },
      },
    },
  });

  // Flatten all the tasks from the lists of the sprints and add sprint name to each task
  const allTasks = sprintsWithTasks.flatMap((sprint) =>
    sprint.lists.flatMap((list) =>
      list.tasks.map((task) => ({
        ...task,
        sprintName: sprint.title, // Add the sprint name to the task data
      }))
    )
  );

  return (
    <div className="w-full mb-20 pr-4">
      {/* Pass the sprintCount to the Info component */}
      <Info num={sprintCount} name={sprintCount === 1 ? "sprint" : "sprints"} />
      <Separator className="my-4" />
      <div className="px-2 md:px-4">
        <Suspense fallback={<SprintList.Skeleton />}>
          <SprintList />
        </Suspense>
      </div>
    </div>
  );
};

export default GroupIdPage;
