// app/api/leaderboard/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path if necessary

// Export the GET method
export async function GET() {
  try {
    // Fetch the leaderboard data sorted by XP, including followers and following counts
    const leaderboard = await db.userModel.findMany({
      orderBy: {
        XP: "desc", // Sort by XP in descending order
      },
      select: {
        id: true,
        userId: true,
        name: true,
        imageUrl: true,
        email: true,
        followers: true, // Followers count
        following: true, // Following count
        biog: true,
        XP: true, // XP count
      },
    });

    // Map the data to match the expected format (if needed)
    const formattedLeaderboard = leaderboard.map((user) => ({
      id: user.id,
      userId: user.userId,
      name: user.name,
      imageUrl: user.imageUrl,
      email: user.email,
      followers: user.followers,
      following: user.following,
      biog: user.biog,
      XP: user.XP,
    }));

    // Return the leaderboard data in the response
    return NextResponse.json(formattedLeaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
