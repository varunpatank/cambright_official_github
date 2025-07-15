// v.0.0.01 salah

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
    const { url } = await req.json();
    if (!userId || !isTutor(userId)) {
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
    const attachment = await db.noteAttachment.create({
      data: {
        url,
        name: url.split("/").pop(),
        noteId: params.noteId,
      },
    });
    return NextResponse.json(attachment);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
