import { db } from "@/lib/db"; // Ensure you're importing your DB setup
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Get the current user from Clerk
  const user = auth();
  if (!user || !user.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the request body
  const { userId, xpAmount } = await req.json();

  // Check if the xpAmount is valid
  if (typeof xpAmount !== "number" || xpAmount <= 0) {
    return NextResponse.json({ error: "Invalid XP amount" }, { status: 400 });
  }

  try {
    // Find the target user to update their XP
    const targetUser = await db.userModel.findUnique({
      where: { userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the current user to check if they have enough XP
    const currentUser = await db.userModel.findUnique({
      where: { userId: user.userId }, // Ensure the currentUser's `userId` is non-null and valid
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 404 }
      );
    }

    // Ensure the current user has enough XP
    if (currentUser.XP < xpAmount) {
      return NextResponse.json({ error: "Not enough XP" }, { status: 400 });
    }

    // Subtract XP from the current user and add it to the target user
    const updatedCurrentUser = await db.userModel.update({
      where: { userId: user.userId },
      data: {
        XP: currentUser.XP - xpAmount, // Subtract XP from the current user
      },
    });

    const updatedTargetUser = await db.userModel.update({
      where: { userId },
      data: {
        XP: targetUser.XP + xpAmount, // Increase XP for the target user
      },
    });

    // Optionally log this XP action in an audit log or something similar

    // Return the updated XP for both users
    return NextResponse.json(
      {
        currentUserXP: updatedCurrentUser.XP,
        targetUserXP: updatedTargetUser.XP,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error giving XP:", error);
    return NextResponse.json({ error: "Failed to give XP" }, { status: 500 });
  }
}
