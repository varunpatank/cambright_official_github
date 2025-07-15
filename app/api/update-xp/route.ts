import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Make sure to import your database client

// API route to handle XP increment
export async function POST(request: Request) {
  try {
    const { userId } = await request.json(); // Get userId from the request body

    // Update the user's XP by adding 5
    const updatedUser = await db.userModel.update({
      where: { userId }, // Assuming `userId` is the unique identifier for users
      data: {
        XP: {
          increment: 5, // Increment XP by 5
        },
      },
    });

    // Return the updated user with their new XP
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating XP:", error);
    return NextResponse.json({ error: "Failed to update XP" }, { status: 500 });
  }
}
