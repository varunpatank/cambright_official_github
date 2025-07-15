// v.0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const ownCourse = await db.course.findUnique({
      where: { id: params.courseId, userId },
    });
    if (!ownCourse) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });

    if (!chapter || !chapter.title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (!chapter.videoUrl && !chapter.sessionlink) {
      return new NextResponse("Either videoUrl or sessionlink is required", {
        status: 400,
      });
    }
    const publishedChapters = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        isPublished: true,
      },
    });
    return NextResponse.json(publishedChapters);
  } catch (error) {
    console.error("Chapter publishing ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
