// v0.0.01 salah

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    const note = await db.note.findUnique({
      where: { id: params.noteId, isPublished: true },
    });

    if (!note) {
      return NextResponse.json({ message: "note not found" }, { status: 404 });
    }

    const existingadded = await db.added.findUnique({
      where: {
        userId_noteId: {
          userId,
          noteId: params.noteId,
        },
      },
    });

    if (!existingadded) {
      return NextResponse.json(
        { message: "Not enrolled in this note" },
        { status: 400 }
      );
    }

    await db.added.delete({
      where: {
        userId_noteId: {
          userId,
          noteId: params.noteId,
        },
      },
    });

    return NextResponse.json(
      { message: "Unadded successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unenrolling user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
