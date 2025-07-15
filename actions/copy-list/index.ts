"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CopyList } from "./schema";
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
  let list;
  try {
    const listToCopy = await db.list.findUnique({
      where: { id, sprintId, sprint: { orgId } },
      include: {
        tasks: true,
      },
    });
    if (!listToCopy) {
      return { error: "List Not Found" };
    }
    const lastList = await db.list.findFirst({
      where: { sprintId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const newOrder = lastList ? lastList.order + 1 : 1;
    list = await db.list.create({
      data: {
        sprintId: listToCopy.sprintId,
        title: `${listToCopy.title} - Copy`,
        order: newOrder,
        tasks: {
          createMany: {
            data: listToCopy.tasks.map((task) => ({
              title: task.title,
              description: task.description,
              order: task.order,
            })),
          },
        },
      },
      include: {
        tasks: true,
      },
    });
    await createAuditLog({
      entityId: list.id,
      entityType: ENTITY_TYPE.LIST,
      entityTitle: list.title,
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
  return { data: list };
};
export const copyList = createSafeAction(CopyList, handler);
