// PlannerPage.tsx
import React from "react";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DataCalendar } from "./_components/data-calednar"; // Ensure correct filename
import { Info } from "../_components/Info";
import { Separator } from "@/components/ui/separator";
import { Task } from "@prisma/client";

// New interface extending Task to include `sprintName` and `listName`
export interface TaskWithSprintName extends Omit<Task, "sprintName"> {
  sprintName: string; // Add sprintName property
  listName: string; // Add listName property
}

interface PlannerPageProps {
  params: {
    sprintId: string;
  };
}

const PlannerPage = async ({ params }: PlannerPageProps) => {
  const { orgId } = auth();

  if (!orgId) {
    redirect("/select-org/");
  }

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

  // Flatten all the tasks from the lists of the sprints and add sprint name and list name to each task
  const allTasks: TaskWithSprintName[] = sprintsWithTasks.flatMap((sprint) =>
    sprint.lists.flatMap((list) =>
      list.tasks.map((task) => ({
        ...task,
        sprintName: sprint.title, // Add sprint name to each task
        listName: list.title, // Add list name to each task
      }))
    )
  );

  return (
    <div className="w-full mb-20 pr-4">
      <Info
        num={allTasks.length}
        name={allTasks.length === 1 ? "task" : "tasks"}
      />
      <Separator className="my-4" />
      <DataCalendar data={allTasks} />
    </div>
  );
};

export default PlannerPage;
