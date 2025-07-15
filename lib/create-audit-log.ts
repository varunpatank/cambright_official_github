import { auth, currentUser } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { db } from "./db";

interface CreateAuditLogProps {
  entityId: string;
  entityType: ENTITY_TYPE;
  entityTitle: string;
  action: ACTION;
}
export const createAuditLog = async ({
  entityId,
  entityType,
  entityTitle,
  action,
}: CreateAuditLogProps) => {
  try {
    const { orgId } = auth();
    const user = await currentUser();
    if (!user || !orgId) {
      throw new Error("User Not Found");
    }
    await db.auditLog.create({
      data: {
        orgId,
        entityType,
        entityId,
        action,
        entityTitle,
        userId: user.id,
        userName: user?.firstName + " " + user?.lastName,
        userImage: user?.imageUrl,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.error("[AUDIT_LOG_ERROR]", e.message);
    }
  }
};
