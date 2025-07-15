// v0.0.01 salah

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isTutor } from "@/lib/tutor";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { title } = await req.json();
    if (!userId || !(await isTutor(userId))) {
      return new NextResponse("Unauthorized!");
    }
    const note = await db.note.create({
      data: {
        userId,
        title,
      },
    });
    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
