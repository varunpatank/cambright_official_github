import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { getInitialSessionSeconds, getInitialXp } from "@/lib/session-time";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// The client polls this endpoint every 5s from every open tab. Cache the
// computed result briefly so concurrent/rapid polls reuse it instead of
// each re-querying the DB and re-fetching Clerk data for every row.
let cachedLeaderboard: { body: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 15000;

// Export the GET method
export async function GET() {
  // A brand-new user has no row yet, so they'd otherwise only show up via
  // the "newUsers" fallback below, which depends on Clerk's user-list
  // endpoint — that has replication lag for just-created accounts, which is
  // why new signups could wait a minute+ to see themselves. Ensure their row
  // exists up front so they're picked up by the fast, direct DB path, and
  // skip the cache this one time so it shows up immediately.
  let justCreatedUser = false;
  const { userId: requestingUserId } = auth();
  if (requestingUserId) {
    const existing = await db.userModel.findUnique({
      where: { userId: requestingUserId },
      select: { id: true },
    });
    if (!existing) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        try {
          await db.userModel.create({
            data: {
              userId: clerkUser.id,
              name: clerkUser.firstName
                ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
                : clerkUser.username || "Anonymous",
              imageUrl: clerkUser.imageUrl || "",
              email: clerkUser.emailAddresses[0]?.emailAddress || "",
              followers: 0,
              following: 0,
              biog: "",
              websiteSeconds: getInitialSessionSeconds(clerkUser.id),
              XP: getInitialXp(clerkUser.id),
            },
          });
          justCreatedUser = true;
        } catch {
          // Row was likely created concurrently by another request (e.g. a
          // session-time heartbeat) — it exists now either way, fine.
        }
      }
    }
  }

  if (!justCreatedUser && cachedLeaderboard && Date.now() - cachedLeaderboard.timestamp < CACHE_TTL_MS) {
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

    // Only fetch Clerk data for the users we already have DB rows for — every
    // real user gets a row created on their first authenticated request (see
    // above, and lib/initial-account.ts / session-time/heartbeat), so there's
    // no need to walk Clerk's *entire* directory just to find new signups.
    // That full-directory pagination was the single biggest source of
    // latency here, and its cost scaled with total user count.
    try {
      const userIds = leaderboard.map((u) => u.userId);
      const allClerkUsers = [];
      const idBatchSize = 100;
      for (let i = 0; i < userIds.length; i += idBatchSize) {
        const idBatch = userIds.slice(i, i + idBatchSize);
        const batch = await clerk.users.getUserList({
          userId: idBatch,
          limit: idBatchSize,
        });
        allClerkUsers.push(...batch.data);
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

      const completeLeaderboard = enrichedLeaderboard.sort((a, b) => {
        if (b.XP !== a.XP) return b.XP - a.XP;
        if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
        return a.name.localeCompare(b.name);
      });

      const responseBody = {
        leaderboard: completeLeaderboard,
        total: leaderboard.length,
        clerkUserCount: allClerkUsers.length,
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
