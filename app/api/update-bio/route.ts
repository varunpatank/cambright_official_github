import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path if necessary
import { auth } from "@clerk/nextjs/server";

// Export the POST method
export async function POST(req: Request) {
  try {
    // Get the logged-in user from Clerk (or use other authentication methods)
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get the incoming request data
    const { newBio } = await req.json();

    // Check if newBio is provided
    if (!newBio || typeof newBio !== "string") {
      return NextResponse.json({ error: "Invalid bio data" }, { status: 400 });
    }

    // Update the user's bio in the database
    const updatedUser = await db.userModel.update({
      where: { userId: userId }, // Update the user with the matching userId
      data: { biog: newBio }, // Set the new bio
    });

    // Return a success response with the updated user data (including the new bio)
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating bio:", error);
    return NextResponse.json(
      { error: "Failed to update bio" },
      { status: 500 }
    );
  }
}
