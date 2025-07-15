"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateTaskOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { orgId, userId } = auth();

  if (!orgId || !userId) {
    return {
      error: "Unauthorized",
    };
  }

  const { items, sprintId } = data;
  let updatedTasks;

  try {
    const transaction = items.map((task) =>
      db.task.update({
        where: {
          id: task.id,
          list: {
            sprint: {
              orgId,
            },
          },
        },
        data: {
          order: task.order,
          listId: task.listId,
        },
      })
    );

    updatedTasks = await db.$transaction(transaction);
  } catch (e) {
    if (e instanceof Error) {
      return {
        error: `${e.message}: Failed to reorder`,
      };
    }
    return {
      error: ` Failed to create list`,
    };
  }
  revalidatePath(`/sprint/${sprintId}`);
  return { data: updatedTasks };
};
export const updateTaskOrder = createSafeAction(UpdateTaskOrder, handler);
