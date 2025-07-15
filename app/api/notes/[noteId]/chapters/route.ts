// v0.0.01 salah

import { db } from "@/lib/db";
import { isTutor } from "@/lib/tutor";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();
    const { noteId } = params;
    const { title } = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const noteOwner = await db.note.findUnique({
      where: { id: params.noteId, userId: userId },
    });
    if (!noteOwner) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    const lastChapter = await db.noteChapter.findFirst({
      where: {
        noteId: params.noteId,
      },
      orderBy: {
        position: "desc",
      },
    });
    const newPosition = lastChapter ? lastChapter.position + 1 : 1;
    const chapter = await db.noteChapter.create({
      data: {
        title,
        noteId: params.noteId,
        position: newPosition,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Chapters creation ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
