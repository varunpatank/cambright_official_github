"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateTask } from "./schema";
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

  const { title, sprintId, listId, dueDate } = data;
  let task;
  try {
    const list = await db.list.findUnique({
      where: {
        id: listId,
        sprint: {
          orgId,
        },
      },
    });
    if (!list) {
      return { error: "List not found" };
    }
    const lastTask = await db.task.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastTask ? lastTask.order + 1 : 1;

    task = await db.task.create({
      data: {
        title,
        listId,
        order: newOrder,
        dueDate: dueDate ? new Date(dueDate) : null, // Handle null explicitly
      },
    });
    await createAuditLog({
      entityId: task.id,
      entityTitle: task.title,
      entityType: ENTITY_TYPE.TASK,
      action: ACTION.CREATE,
    });
  } catch (e) {
    if (e instanceof Error) {
      return {
        error: `${e.message}: Failed to update`,
      };
    }
    return {
      error: ` Failed to create task`,
    };
  }
  revalidatePath(`/sprint/${sprintId}`);
  if (!data && !task) {
    return {
      error: "Something went wrong",
    };
  }
  return { data: task };
};
export const createTask = createSafeAction(CreateTask, handler);
