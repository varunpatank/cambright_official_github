import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getInitialSessionSeconds, getInitialXp } from "@/lib/session-time";
import {
  getCachedLeaderboard,
  getLastLeaderboard,
  type LeaderboardBody,
  type LeaderboardRow,
} from "@/lib/leaderboard-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// Make sure the requesting user has a DB row so they appear on the board, and
// return a minimal row for them if the (single-flighted, possibly-just-stale)
// cached leaderboard predates their creation — so a brand-new account sees
// itself immediately instead of waiting for the next refresh. This does at most
// ONE Clerk call (currentUser) and only on the first request after signup;
// every later request finds the row and skips it.
async function ensureRequestingUserRow(userId: string): Promise<LeaderboardRow | null> {
  const existing = await db.userModel.findUnique({
    where: { userId },
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
      websiteSeconds: true,
      createdAt: true,
    },
  });
  if (existing) {
    return {
      ...existing,
      name: existing.name || "Anonymous",
      imageUrl: existing.imageUrl || "/default-avatar.png",
      email: existing.email || "",
      XP: Math.max(
        existing.XP,
        Math.floor((existing.websiteSeconds ?? 0) / 60),
        getInitialXp(existing.userId)
      ),
      websiteSeconds: existing.websiteSeconds ?? 0,
      createdAt: existing.createdAt.getTime(),
      clerkData: null,
    };
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const name = clerkUser.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
    : clerkUser.username || "Anonymous";
  const imageUrl = clerkUser.imageUrl || "";
  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const websiteSeconds = getInitialSessionSeconds(clerkUser.id);
  const XP = getInitialXp(clerkUser.id);

  try {
    const created = await db.userModel.create({
      data: {
        userId: clerkUser.id,
        name,
        imageUrl,
        email,
        followers: 0,
        following: 0,
        biog: "",
        websiteSeconds,
        XP,
      },
      select: { id: true, createdAt: true },
    });
    return {
      id: created.id,
      userId: clerkUser.id,
      name: name || "Anonymous",
      imageUrl: imageUrl || "/default-avatar.png",
      email,
      followers: 0,
      following: 0,
      biog: "",
      XP,
      websiteSeconds,
      createdAt: created.createdAt.getTime(),
      clerkData: null,
    };
  } catch {
    // Row was created concurrently (e.g. by a session-time heartbeat). It
    // exists now; the next cache refresh will include it.
    return null;
  }
}

// Insert the requesting user's row into the cached body if the cache doesn't
// already contain it, keeping the XP-desc ordering. Returns a new body object;
// never mutates the shared cached one.
function withUser(body: LeaderboardBody, row: LeaderboardRow): LeaderboardBody {
  if (body.leaderboard.some((u) => u.userId === row.userId)) return body;
  const leaderboard = [...body.leaderboard, row].sort((a, b) => {
    if (b.XP !== a.XP) return b.XP - a.XP;
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.name.localeCompare(b.name);
  });
  return {
    ...body,
    leaderboard,
    databaseUserCount: leaderboard.length,
  };
}

export async function GET() {
  try {
    const { userId } = auth();

    // Ensure the requester's row exists (cheap) in parallel with reading the
    // cached board. A failure here must not fail the whole request.
    const [row, cached] = await Promise.all([
      userId
        ? ensureRequestingUserRow(userId).catch((err) => {
            console.warn("ensureRequestingUserRow failed:", err);
            return null;
          })
        : Promise.resolve(null),
      getCachedLeaderboard(),
    ]);

    const body = row ? withUser(cached, row) : cached;
    return NextResponse.json(body, { headers: NO_STORE_HEADERS });
  } catch (error) {
    // Absolute last resort: never 500 the leaderboard. Serve the last known
    // good body if we have one, otherwise an empty-but-valid payload the client
    // can render (it'll fill in on the next successful poll).
    console.error("Error fetching leaderboard:", error);
    const fallback = getLastLeaderboard();
    if (fallback) {
      return NextResponse.json(fallback, { headers: NO_STORE_HEADERS });
    }
    return NextResponse.json(
      {
        leaderboard: [],
        total: 0,
        clerkUserCount: 0,
        databaseUserCount: 0,
        newUsersTodayCount: 0,
        activeUsersCount: 0,
        timestamp: new Date().toISOString(),
      },
      { headers: NO_STORE_HEADERS }
    );
  }
}
