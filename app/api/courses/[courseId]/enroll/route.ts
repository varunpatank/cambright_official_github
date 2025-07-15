// v0.0.01 salah

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(
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

    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { message: "Already enrolled" },
        { status: 400 }
      );
    }
    if (!course) {
      return NextResponse.json(
        { message: "course not found" },
        { status: 401 }
      );
    }

    await db.enrollment.create({
      data: {
        userId,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(
      { message: "Enrollment successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error enrolling user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
