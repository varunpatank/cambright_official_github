"use server";

import { InputType, ReturnType } from "@/actions/update-list/types";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateList } from "@/actions/update-list/schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { orgId, userId } = auth();

  if (!orgId || !userId) {
    return {
      error: "Unauthorized",
    };
  }
  const { title, id, sprintId } = data;
  let list;
  try {
    list = await db.list.update({
      where: { id, sprintId, sprint: { orgId } },
      data: { title },
    });
    await createAuditLog({
      entityId: list.id,
      entityType: ENTITY_TYPE.LIST,
      entityTitle: list.title,
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
  if (!data && !list) {
    return {
      error: "Something went wrong",
    };
  }
  return { data: list };
};
export const updateList = createSafeAction(UpdateList, handler);
