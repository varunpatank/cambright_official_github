// v.0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { noteId: string; attachmentId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const noteOwner = await db.note.findUnique({
      where: {
        id: params.noteId,
        userId: userId,
      },
    });
    if (!noteOwner) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const attachment = await db.noteAttachment.delete({
      where: {
        noteId: params.noteId,
        id: params.attachmentId,
      },
    });
    return NextResponse.json(attachment);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
