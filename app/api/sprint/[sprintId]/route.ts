// app/api/sprint/[sprintId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { sprintId: string } }
) {
  const { sprintId } = params;

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      select: { orgId: true }, // Fetch the orgId associated with the sprint
    });

    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    return NextResponse.json({ orgId: sprint.orgId });
  } catch (error) {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
