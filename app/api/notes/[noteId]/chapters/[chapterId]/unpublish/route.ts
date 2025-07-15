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

    const unpublishedChapter = await db.noteChapter.update({
      where: {
        id: params.chapterId,
        noteId: params.noteId,
      },
      data: {
        isPublished: false,
      },
    });
    const publishedChaptersInnote = await db.noteChapter.findMany({
      where: {
        noteId: params.noteId,
        isPublished: true,
      },
    });
    if (!publishedChaptersInnote.length) {
      await db.note.update({
        where: {
          id: params.noteId,
        },
        data: {
          isPublished: false,
        },
      });
    }
    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.error("Chapter unpublishing ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
