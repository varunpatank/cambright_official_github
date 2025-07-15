import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your db setup

export async function POST(req: Request) {
  try {
    const { userId, tagName } = await req.json();

    if (!userId || !tagName) {
      return NextResponse.json(
        { error: "Missing userId or tagName" },
        { status: 400 }
      );
    }

    // Find the tag by name (note: `findFirst` since name is not unique)
    const tag = await db.tag.findFirst({
      where: { name: tagName }, // Find the tag by name
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Disconnect the tag from the user
    await db.userModel.update({
      where: { userId }, // Find the user by userId
      data: {
        tags: {
          disconnect: { id: tag.id }, // Disconnect the tag by its id
        },
      },
    });

    // Optionally, delete the tag if it's no longer associated with any users
    const usersWithTag = await db.tag.count({
      where: { id: tag.id }, // Check how many users are still using this tag
    });

    if (usersWithTag === 0) {
      await db.tag.delete({
        where: { id: tag.id }, // Delete the tag if no users are left with it
      });
    }

    return NextResponse.json(
      { message: "Tag deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
