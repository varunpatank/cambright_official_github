// v.0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { noteId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isCompleted } = await req.json();
    if (typeof isCompleted !== "boolean") {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const userProgress = await db.noteUserProgress.upsert({
      where: {
        userId_notechapterId: { userId, notechapterId: params.chapterId },
      },
      update: {
        isCompleted,
      },
      create: { userId, notechapterId: params.chapterId, isCompleted },
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error("Error updating user progress:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
