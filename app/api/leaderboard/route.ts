import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { getInitialSessionSeconds, getInitialXp } from "@/lib/session-time";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// The client polls this endpoint every 5s from every open tab. Recomputing
// it fully means paginating Clerk's *entire* user directory each time
// (getCount + repeated getUserList calls) just to find newly-registered
// users — that's the source of multi-second latency under load. Cache the
// computed result briefly so concurrent/rapid polls reuse it instead of
// each re-walking the whole Clerk directory.
let cachedLeaderboard: { body: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 15000;

// Export the GET method
export async function GET() {
  if (cachedLeaderboard && Date.now() - cachedLeaderboard.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedLeaderboard.body, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }

  try {
    const clerk = await clerkClient();
    // Fetch existing leaderboard users from DB
    const leaderboard = await db.userModel.findMany({
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
        createdAt: true,
        updatedAt: true,
        websiteSeconds: true,
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
        const seededXp = Math.max(
          user.XP,
          Math.floor((user.websiteSeconds ?? 0) / 60),
          getInitialXp(user.userId)
        );

        return {
          id: user.id,
          userId: user.userId,
          name: user.name || derivedName,
          imageUrl: user.imageUrl || clerkUser?.imageUrl || "/default-avatar.png",
          email: user.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "",
          followers: user.followers,
          following: user.following,
          biog: user.biog,
          XP: seededXp,
          websiteSeconds: user.websiteSeconds ?? 0,
          createdAt: user.createdAt.getTime(),
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
        XP: getInitialXp(clerkUser.id),
        websiteSeconds: getInitialSessionSeconds(clerkUser.id),
        createdAt: clerkUser.createdAt,
        clerkData: {
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          username: clerkUser.username,
          profileImageUrl: clerkUser.imageUrl,
          lastSignInAt: clerkUser.lastSignInAt,
          createdAt: clerkUser.createdAt,
        }
      }));

      const completeLeaderboard = [...enrichedLeaderboard, ...newUserEntries].sort((a, b) => {
        if (b.XP !== a.XP) return b.XP - a.XP;
        const aCreated = a.createdAt ?? 0;
        const bCreated = b.createdAt ?? 0;
        if (aCreated !== bCreated) return aCreated - bCreated;
        return a.name.localeCompare(b.name);
      });

      const responseBody = {
        leaderboard: completeLeaderboard,
        total: userCount,
        clerkUserCount: userCount,
        databaseUserCount: leaderboard.length,
        timestamp: new Date().toISOString(),
      };
      cachedLeaderboard = { body: responseBody, timestamp: Date.now() };

      return NextResponse.json(responseBody, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

    } catch (clerkListError) {
      console.warn("Could not fetch Clerk users list:", clerkListError);
      return NextResponse.json(
        {
          leaderboard,
          total: leaderboard.length,
          clerkUserCount: "Error fetching",
          databaseUserCount: leaderboard.length,
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
