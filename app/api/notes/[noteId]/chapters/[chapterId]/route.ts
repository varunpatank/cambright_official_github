// v.0.0.01 salah

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
  { params }: { params: { noteId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const ownnote = await db.note.findUnique({
      where: { id: params.noteId, userId: userId },
    });
    if (!ownnote) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    const chapter = await db.noteChapter.findUnique({
      where: {
        id: params.chapterId,
        noteId: params.noteId,
      },
    });
    if (!chapter) {
      return new NextResponse("not found!", { status: 404 });
    }
    if (chapter.videoUrl) {
      const existingCloudinaryData = await db.noteCloudinaryData.findFirst({
        where: { notechapterId: params.chapterId },
      });
      if (existingCloudinaryData) {
        await cloudinary.v2.uploader.destroy(existingCloudinaryData.publicId);
        await db.noteCloudinaryData.delete({
          where: { id: existingCloudinaryData.id },
        });
      }
    }

    const deletedChapter = await db.noteChapter.delete({
      where: {
        id: params.chapterId,
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
        data: { isPublished: false },
      });
    }
    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.error("Chapter deletion ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { isPublished, ...values } = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const ownnote = await db.note.findUnique({
      where: { id: params.noteId, userId: userId },
    });
    if (!ownnote) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    const chapter = await db.noteChapter.update({
      where: {
        id: params.chapterId,
        noteId: params.noteId,
      },
      data: {
        ...values,
      },
    });
    if (values.videoUrl) {
      const existingCloudinaryData = await db.noteCloudinaryData.findFirst({
        where: { notechapterId: params.chapterId },
      });

      if (existingCloudinaryData) {
        await cloudinary.v2.uploader.destroy(existingCloudinaryData.publicId);
        await db.noteCloudinaryData.delete({
          where: { id: existingCloudinaryData.id },
        });
      }

      const result = await cloudinary.v2.uploader.upload(values.videoUrl, {
        resource_type: "video",
        public_id: `chapter_${params.chapterId}_video`,
      });

      await db.noteCloudinaryData.create({
        data: {
          notechapterId: params.chapterId,
          publicId: result.public_id,
          videoUrl: result.secure_url,
          assetId: result.asset_id,
        },
      });
    }
    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Chapter title ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
