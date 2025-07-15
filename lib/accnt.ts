// lib/leaderboard.ts
import { db } from "@/lib/db";

// This function fetches the top users sorted by XP
export const getLeaderboard = async () => {
  const account = await db.userModel.findMany({
    orderBy: {
      XP: "desc",
    },
    take: 50,
  });

  return account;
};
