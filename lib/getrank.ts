// lib/leaderboard.ts
import { db } from "@/lib/db";

// This function fetches the top users sorted by XP
export const getLeaderboard = async (profileId: string) => {
  const allUsers = await db.userModel.findMany({
    orderBy: {
      XP: "desc", // Sort by XP in descending order
    },
  });
  const userRank = allUsers.findIndex((u) => u.userId === profileId) + 1; // Rank starts from 1
  let rankColor = "text-purple-400"; // Default color
  if (userRank <= 3) {
    rankColor = "text-yellow-400"; // Gold for rank <= 3
  } else if (userRank <= 10) {
    rankColor = "text-green-400"; // Green for rank 3-10
  }
};
