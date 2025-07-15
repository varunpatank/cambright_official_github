import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path if necessary
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// Export the GET method
export async function GET(req: Request) {
  try {
    // Get the logged-in user from the request headers (Clerk authentication in this case)
    const { userId } = auth(); // This will give the user ID based on Clerk session

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch the list of all users sorted by XP in descending order
    const allUsers = await db.userModel.findMany({
      orderBy: {
        XP: "desc", // Sort by XP in descending order
      },
    });

    // Find the rank of the current user
    const userRank = allUsers.findIndex((u) => u.userId === userId) + 1; // Rank starts from 1

    if (userRank === 0) {
      return NextResponse.json(
        { error: "User not found in the leaderboard" },
        { status: 404 }
      );
    }

    // Determine the rank color based on the rank
    let rankColor = "text-purple-400"; // Default color
    if (userRank <= 3) {
      rankColor = "text-yellow-400"; // Gold for rank <= 3
    } else if (userRank <= 10) {
      rankColor = "text-green-400"; // Green for rank 3-10
    }

    // Return rank and rank color to the client
    return NextResponse.json({ userRank, rankColor });
  } catch (error) {
    console.error("Error fetching account data:", error);
    return NextResponse.json(
      { error: "Failed to fetch account data" },
      { status: 500 }
    );
  }
}
