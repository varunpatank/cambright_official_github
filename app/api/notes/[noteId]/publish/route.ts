// v0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const note = await db.note.findUnique({
      where: { id: params.noteId, userId },
      include: {
        notechapters: {
          include: {
            cloudinaryData: true,
          },
        },
      },
    });
    if (!note) {
      return new NextResponse("not found!", { status: 401 });
    }
    if (
      !note.title ||
      !note.description ||
      !note.imageUrl ||
      !note.notesubjectId
    ) {
      return new NextResponse("Please fill all required fields", {
        status: 401,
      });
    }
    const publishednote = await db.note.update({
      where: {
        id: params.noteId,
        userId,
      },
      data: {
        isPublished: true,
      },
    });
    // const hasPublishedChapter = note.chapters.some(
    //   (chapter) => chapter.isPublished
    // );
    // console.log("After update:", publishednote); // Log the updated note

    return NextResponse.json(publishednote);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
