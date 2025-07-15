import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function POST(req: Request) {
  try {
    const { userId, tagName } = await req.json();

    if (!userId || !tagName) {
      return NextResponse.json(
        { error: "Missing userId or tagName" },
        { status: 400 }
      );
    }

    // Find the tag by name (we can't use `name` directly in `where` for `upsert`)
    let tag = await db.tag.findFirst({
      where: { name: tagName }, // Find the tag by name
    });

    if (!tag) {
      // If tag doesn't exist, create a new one
      tag = await db.tag.create({
        data: { name: tagName },
      });
    }

    // Now connect the tag to the user
    await db.userModel.update({
      where: { userId }, // Find the user by userId
      data: {
        tags: {
          connect: { id: tag.id }, // Connect the tag to the user using the tag's `id`
        },
      },
    });

    return NextResponse.json(
      { message: "Tag added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding tag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
