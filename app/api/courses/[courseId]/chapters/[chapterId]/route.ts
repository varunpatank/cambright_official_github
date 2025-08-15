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
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const ownCourse = await db.course.findUnique({
      where: { id: params.courseId, userId: userId },
    });
    if (!ownCourse) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });
    if (!chapter) {
      return new NextResponse("not found!", { status: 404 });
    }
    if (chapter.videoUrl) {
      const existingCloudinaryData = await db.cloudinaryData.findFirst({
        where: { chapterId: params.chapterId },
      });
      if (existingCloudinaryData) {
        await cloudinary.v2.uploader.destroy(existingCloudinaryData.publicId);
        await db.cloudinaryData.delete({
          where: { id: existingCloudinaryData.id },
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId,
      },
    });
    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      },
    });
    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
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
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { isPublished, videoAssetKey, ...values } = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const ownCourse = await db.course.findUnique({
      where: { id: params.courseId, userId: userId },
    });
    if (!ownCourse) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    // Prepare the update data
    const updateData: any = { ...values };
    
    // Handle video asset key for MinIO videos
    if (videoAssetKey) {
      updateData.videoAssetKey = videoAssetKey;
    }

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: updateData,
    });

    // Only process Cloudinary uploads if videoUrl is provided and it's NOT a MinIO URL
    if (values.videoUrl && !values.videoUrl.includes('minio') && !values.videoUrl.includes('cambright')) {
      const existingCloudinaryData = await db.cloudinaryData.findFirst({
        where: { chapterId: params.chapterId },
      });

      if (existingCloudinaryData) {
        await cloudinary.v2.uploader.destroy(existingCloudinaryData.publicId);
        await db.cloudinaryData.delete({
          where: { id: existingCloudinaryData.id },
        });
      }

      const result = await cloudinary.v2.uploader.upload(values.videoUrl, {
        resource_type: "video",
        public_id: `chapter_${params.chapterId}_video`,
      });

      await db.cloudinaryData.create({
        data: {
          chapterId: params.chapterId,
          publicId: result.public_id,
          videoUrl: result.secure_url,
          assetId: result.asset_id,
        },
      });
    }
    // For MinIO videos, we don't need to create Cloudinary data since the URL is already stored
    
    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Chapter update ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
