// v0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { isSuperAdmin } from '@/lib/admin';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const course = await db.course.findUnique({
      where: { id: params.courseId, userId: userId },
      include: {
        chapters: {
          include: {
            cloudinaryData: true,
          },
        },
      },
    });
    if (!course) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    for (const chapter of course.chapters) {
      if (chapter.videoUrl) {
        const existingCloudinaryData = await db.cloudinaryData.findFirst({
          where: { chapterId: chapter.id },
        });
        if (existingCloudinaryData) {
          await cloudinary.v2.uploader.destroy(existingCloudinaryData.publicId);
          await db.cloudinaryData.delete({
            where: { id: existingCloudinaryData.id },
          });
        }
      }
    }
    const deletedCourse = await db.course.delete({
      where: {
        id: params.courseId,
      },
    });
    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.error("Course deletion ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse('Unauthorized!', { status: 401 });
    }
    // Allow update if user is owner or super admin
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return new NextResponse('Course not found!', { status: 404 });
    }
    if (course.userId !== userId && !isSuperAdmin(userId)) {
      return new NextResponse('Unauthorized!', { status: 401 });
    }

    // If imageAssetId is provided, verify it exists in the database
    if (values.imageAssetId) {
      const imageAsset = await db.assets.findUnique({
        where: { id: values.imageAssetId }
      });
      if (!imageAsset) {
        return new NextResponse(`Image asset not found: ${values.imageAssetId}`, { status: 400 });
      }
    }

    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: { ...values },
    });
    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error editing course:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
