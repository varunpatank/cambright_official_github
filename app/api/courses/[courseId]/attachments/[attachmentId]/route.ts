// v.0.0.01 salah

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getFile, BUCKET_NAME } from '@/lib/minio'

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });
    if (!courseOwner) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const attachment = await db.attachment.delete({
      where: {
        courseId: params.courseId,
        id: params.attachmentId,
      },
    });
    return NextResponse.json(attachment);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized!', { status: 401 });
    }
    // Check enrollment
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });
    if (!enrollment) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    // Get attachment
    const attachment = await db.attachment.findUnique({
      where: { id: params.attachmentId },
    });
    if (!attachment) {
      return new NextResponse('Not found', { status: 404 });
    }
    // Stream file from cambright
    const key = attachment.url.replace(/^.*uploads\//, 'uploads/'); // ensure only path
    const stream = await getFile(BUCKET_NAME, key);
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${attachment.name}"`,
      },
    });
  } catch (error) {
    console.error('Attachment download error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
