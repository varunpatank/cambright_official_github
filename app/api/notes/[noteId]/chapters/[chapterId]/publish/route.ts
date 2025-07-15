// v.0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const ownnote = await db.note.findUnique({
      where: { id: params.noteId, userId },
    });
    if (!ownnote) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const chapter = await db.noteChapter.findUnique({
      where: {
        id: params.chapterId,
        noteId: params.noteId,
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
    const publishedChapters = await db.noteChapter.update({
      where: {
        id: params.chapterId,
        noteId: params.noteId,
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
