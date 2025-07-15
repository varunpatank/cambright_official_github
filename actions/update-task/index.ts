"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { UpdateTask } from "./schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { orgId, userId } = auth();

  if (!orgId || !userId) {
    return {
      error: "Unauthorized",
    };
  }
  const { id, sprintId, ...values } = data;
  let task;
  try {
    task = await db.task.update({
      where: {
        id,
        list: {
          sprint: {
            orgId,
          },
        },
      },
      data: { ...values },
    });
    await createAuditLog({
      entityId: task.id,
      entityType: ENTITY_TYPE.TASK,
      entityTitle: task.title,
      action: ACTION.UPDATE,
    });
  } catch (e) {
    if (e instanceof Error) {
      return {
        error: `${e.message}: Failed to update`,
      };
    }
    return {
      error: ` Failed to update`,
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
export const updateTask = createSafeAction(UpdateTask, handler);
