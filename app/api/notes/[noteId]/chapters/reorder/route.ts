// v0.0.01 salah
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();
    const { list } = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const noteOwner = await db.note.findUnique({
      where: { id: params.noteId, userId: userId },
    });
    if (!noteOwner) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    for (let item of list) {
      await db.noteChapter.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }
    return NextResponse.json("Success", { status: 200 });
  } catch (error) {
    console.error("Chapters reordering ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
