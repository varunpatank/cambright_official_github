"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { DeleteSprint } from "./schema";
import { redirect } from "next/navigation";
import { InputType, ReturnType } from "@/actions/delete-sprint/types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { orgId, userId } = auth();
  //   const isPro = await checkSubscription();
  if (!orgId || !userId) {
    return {
      error: "Unauthorized",
    };
  }
  const { id } = data;

  try {
    const sprint = await db.sprint.delete({
      where: { id, orgId },
    });

    await createAuditLog({
      entityId: sprint.id,
      entityType: ENTITY_TYPE.SPRINT,
      entityTitle: sprint.title,
      action: ACTION.DELETE,
    });
  } catch (e) {
    if (e instanceof Error) {
      return {
        error: `${e.message}: Failed to delete`,
      };
    }
    return {
      error: ` Failed to update`,
    };
  }
  revalidatePath(`/tracker/group/${orgId}`);
  redirect(`/tracker/group/${orgId}`);
};
export const deleteSprint = createSafeAction(DeleteSprint, handler);
