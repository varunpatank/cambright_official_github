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

    const unpublishednote = await db.note.update({
      where: {
        id: params.noteId,
        userId,
      },
      data: {
        isPublished: false,
      },
    });
    return NextResponse.json(unpublishednote);
  } catch (error) {
    console.error("note unpublishing ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
