// v0.0.01 salah

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

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
      where: { id: params.courseId, isPublished: true },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    if (!existingEnrollment) {
      return NextResponse.json(
        { message: "Not enrolled in this course" },
        { status: 400 }
      );
    }

    await db.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    return NextResponse.json(
      { message: "Unenrollment successful" },
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
