import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Export the GET method
export async function GET() {
  try {
    const clerk = await clerkClient();
    // Fetch existing leaderboard users from DB
    const leaderboard = await db.userModel.findMany({
      orderBy: {
        XP: "desc",
      },
      select: {
        id: true,
        userId: true,
        name: true,
        imageUrl: true,
        email: true,
        followers: true,
        following: true,
        biog: true,
        XP: true,
      },
    });

    // Get all Clerk users in batches to avoid per-user API calls and rate limits.
    try {
      const userCount = await clerk.users.getCount();
      const limit = 500;
      const allClerkUsers = [];
      let offset = 0;
      const maxBatches = 20;
      let batchesFetched = 0;
      
      while (offset < userCount && batchesFetched < maxBatches) {
        const batch = await clerk.users.getUserList({
          limit,
          offset,
          orderBy: "-created_at",
        });
        
        allClerkUsers.push(...batch.data);
        offset += limit;
        batchesFetched += 1;
        
        if (batch.data.length < limit) {
          break;
        }
      }

      const clerkUsersById = new Map(allClerkUsers.map((u) => [u.id, u]));

      const enrichedLeaderboard = leaderboard.map((user) => {
        const clerkUser = clerkUsersById.get(user.userId);
        const derivedName = clerkUser?.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : clerkUser?.username || "Anonymous";

        return {
          id: user.id,
          userId: user.userId,
          name: user.name || derivedName,
          imageUrl: user.imageUrl || clerkUser?.imageUrl || "/default-avatar.png",
          email: user.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "",
          followers: user.followers,
          following: user.following,
          biog: user.biog,
          XP: user.XP,
          clerkData: clerkUser
            ? {
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                username: clerkUser.username,
                profileImageUrl: clerkUser.imageUrl,
                lastSignInAt: clerkUser.lastSignInAt,
                createdAt: clerkUser.createdAt,
              }
            : null,
        };
      });

      const existingUserIds = new Set(leaderboard.map((u) => u.userId));
      const newUsers = allClerkUsers.filter((clerkUser) => !existingUserIds.has(clerkUser.id));

      const newUserEntries = newUsers.map((clerkUser) => ({
        id: `new-${clerkUser.id}`, // Temporary ID for new users
        userId: clerkUser.id,
        name: clerkUser.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : clerkUser.username || "Anonymous",
        imageUrl: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        followers: 0,
        following: 0,
        biog: "",
        XP: 0,
        clerkData: {
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          username: clerkUser.username,
          profileImageUrl: clerkUser.imageUrl,
          lastSignInAt: clerkUser.lastSignInAt,
          createdAt: clerkUser.createdAt,
        }
      }));

      const completeLeaderboard = [...enrichedLeaderboard, ...newUserEntries].sort((a, b) => b.XP - a.XP);

      return NextResponse.json(
        {
          leaderboard: completeLeaderboard,
          total: userCount,
          clerkUserCount: userCount,
          databaseUserCount: leaderboard.length,
          newUserCount: newUsers.length,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

    } catch (clerkListError) {
      console.warn("Could not fetch Clerk users list:", clerkListError);
      return NextResponse.json(
        {
          leaderboard,
          total: leaderboard.length,
          clerkUserCount: "Error fetching",
          databaseUserCount: leaderboard.length,
          newUserCount: 0,
          error: "Could not fetch all Clerk users",
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
