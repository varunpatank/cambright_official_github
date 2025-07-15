"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CopyTask } from "./schema";
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
  const { id, sprintId } = data;
  let task;
  try {
    const taskToCopy = await db.task.findUnique({
      where: {
        id,
        list: {
          sprint: { orgId },
          sprintId,
        },
      },
    });
    if (!taskToCopy) {
      return {
        error: "task not found",
      };
    }
    const lastTask = await db.task.findFirst({
      where: { listId: taskToCopy.listId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const newOrder = lastTask ? lastTask.order + 1 : 1;
    task = await db.task.create({
      data: {
        title: `${taskToCopy.title} - Copy`,
        description: taskToCopy.description,
        order: newOrder,
        listId: taskToCopy.listId,
      },
    });
    await createAuditLog({
      entityId: task.id,
      entityType: ENTITY_TYPE.TASK,
      entityTitle: task.title,
      action: ACTION.CREATE,
    });
  } catch (e) {
    if (e instanceof Error) {
      return {
        error: `${e.message}: Failed to copy`,
      };
    }
    return {
      error: `Failed to update`,
    };
  }
  revalidatePath(`/sprint/${sprintId}`);
  return { data: task };
};
export const copyTask = createSafeAction(CopyTask, handler);
