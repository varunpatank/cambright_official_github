// v0.0.01 salah

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(
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

    const existingadded = await db.added.findUnique({
      where: {
        userId_noteId: {
          userId,
          noteId: params.noteId,
        },
      },
    });

    if (existingadded) {
      return NextResponse.json(
        { message: "Already enrolled" },
        { status: 400 }
      );
    }
    if (!note) {
      return NextResponse.json({ message: "note not found" }, { status: 401 });
    }

    await db.added.create({
      data: {
        userId,
        noteId: params.noteId,
      },
    });

    return NextResponse.json({ message: "added successful" }, { status: 201 });
  } catch (error) {
    console.error("Error enrolling user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
