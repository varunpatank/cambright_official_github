"use server";

import { InputType, ReturnType } from "@/actions/update-sprint/types";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateSprint } from "@/actions/update-sprint/schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { orgId, userId } = auth();

  if (!orgId || !userId) {
    return {
      error: "Unauthorized",
    };
  }
  const { title, id } = data;
  let sprint;
  try {
    sprint = await db.sprint.update({
      where: { id, orgId },
      data: { title },
    });
    await createAuditLog({
      entityId: sprint.id,
      entityType: ENTITY_TYPE.SPRINT,
      entityTitle: sprint.title,
      action: ACTION.UPDATE,
    });
  } catch (e) {
    if (e instanceof Error) {
      return {
        error: `Failed to update`,
      };
    }
    return {
      error: ` Failed to update`,
    };
  }
  revalidatePath(`/tracker/board/${id}`);
  if (!data && !sprint) {
    return {
      error: "Something went wrong",
    };
  }
  return { data: sprint };
};
export const updateSprint = createSafeAction(UpdateSprint, handler);
