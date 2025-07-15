// v0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      where: { id: params.noteId, userId: userId },
      include: {
        notechapters: {
          include: {
            cloudinaryData: true,
          },
        },
      },
    });
    if (!note) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    for (const noteChapter of note.notechapters) {
      if (noteChapter.videoUrl) {
        const existingCloudinaryData = await db.noteCloudinaryData.findFirst({
          where: { notechapterId: noteChapter.id },
        });
        if (existingCloudinaryData) {
          await cloudinary.v2.uploader.destroy(existingCloudinaryData.publicId);
          await db.noteCloudinaryData.delete({
            where: { id: existingCloudinaryData.id },
          });
        }
      }
    }
    const deletedNote = await db.note.delete({
      where: {
        id: params.noteId,
      },
    });
    return NextResponse.json(deletedNote);
  } catch (error) {
    console.error("note deletion ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();
    const { noteId } = params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const note = await db.note.update({
      where: { id: noteId, userId },
      data: { ...values },
    });
    return NextResponse.json(note);
  } catch (error) {
    console.error("Error editing note:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
