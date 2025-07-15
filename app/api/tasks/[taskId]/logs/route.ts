import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// @ts-ignore
import { db } from "@/lib/db";
import { ENTITY_TYPE } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const auditLogs = await db.auditLog.findMany({
      where: {
        orgId,
        entityId: params.taskId,
        entityType: ENTITY_TYPE.TASK,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });
    return NextResponse.json(auditLogs);
  } catch (e) {
    if (e instanceof Error) {
      console.error("[GET LOGS]: ", e.message);
      return new NextResponse(e.message, { status: 500 });
    }
  }
}
