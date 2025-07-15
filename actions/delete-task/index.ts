"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { DeleteTask } from "./schema";
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
    task = await db.task.delete({
      where: {
        id,
        list: {
          sprint: { orgId },
          sprintId,
        },
      },
    });
    await createAuditLog({
      entityId: task.id,
      entityType: ENTITY_TYPE.TASK,
      entityTitle: task.title,
      action: ACTION.DELETE,
    });
  } catch (e) {
    if (e instanceof Error) {
      return {
        error: `${e.message}: Failed to delete`,
      };
    }
  }
  revalidatePath(`/sprint/${sprintId}`);
  return { data: task };
};
export const deleteTask = createSafeAction(DeleteTask, handler);
