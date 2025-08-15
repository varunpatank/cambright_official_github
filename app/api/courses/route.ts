// v0.0.01 salah

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isTutor } from "@/lib/tutor";
import { isSuperAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { title, authorId } = await req.json();
    
    if (!userId) {
      return new NextResponse("Unauthorized!");
    }

    // Determine the actual course author
    let courseAuthorId = userId; // Default to current user
    
    // If authorId is provided, check if current user is superadmin
    if (authorId && authorId !== userId) {
      if (!isSuperAdmin(userId)) {
        return new NextResponse("Only super admins can assign courses to other users", { status: 403 });
      }
      
      // Note: Removed tutor check - all users can now be assigned courses
      courseAuthorId = authorId;
    }

    const course = await db.course.create({
      data: {
        userId: courseAuthorId,
        title,
      },
    });
    
    console.log(`Course created by ${userId} for author ${courseAuthorId}:`, {
      courseId: course.id,
      title: course.title,
      isCustomAuthor: courseAuthorId !== userId
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
