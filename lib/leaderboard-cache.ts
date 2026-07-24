// lib/leaderboard-cache.ts
//
// Builds the leaderboard response body from the DATABASE ALONE (plus the shared,
// cached community stats), single-flighted so concurrent polls share one
// computation instead of each hammering the DB.
//
// Why DB-only: the client (app/(dashboard)/(routes)/leaderboard/page.tsx) renders
// only name / imageUrl / XP / followers / following / userId — every one of which
// is stored on the userModel row. The old route additionally fetched EVERY user
// from Clerk on each poll to attach a `clerkData` blob the UI never reads. That
// per-user Clerk pagination was the main reason a cold load took 2+ minutes and,
// under concurrent polling, exhausted the connection budget into 500s. Dropping
// it makes the row query a single indexed `findMany`.
import { db } from "@/lib/db";
import { getInitialXp } from "@/lib/session-time";
import { getCachedCommunityStats } from "@/lib/community-stats-cache";

export interface LeaderboardRow {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  followers: number;
  following: number;
  biog: string;
  XP: number;
  websiteSeconds: number;
  createdAt: number;
  clerkData: null;
}

export interface LeaderboardBody {
  leaderboard: LeaderboardRow[];
  total: number;
  clerkUserCount: number;
  databaseUserCount: number;
  newUsersTodayCount: number;
  activeUsersCount: number;
  timestamp: string;
}

// Rows are cheap and change every few seconds (XP ticks up via heartbeats), so a
// short freshness window keeps the board lively; stale-while-revalidate means a
// poll landing just after expiry still returns instantly.
const FRESH_MS = 5_000;

let lastGood: { body: LeaderboardBody; timestamp: number } | null = null;
let inFlight: Promise<LeaderboardBody> | null = null;

function toRow(user: {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  followers: number;
  following: number;
  biog: string;
  XP: number;
  websiteSeconds: number | null;
  createdAt: Date;
}): LeaderboardRow {
  const seededXp = Math.max(
    user.XP,
    Math.floor((user.websiteSeconds ?? 0) / 60),
    getInitialXp(user.userId)
  );
  return {
    id: user.id,
    userId: user.userId,
    name: user.name || "Anonymous",
    imageUrl: user.imageUrl || "/default-avatar.png",
    email: user.email || "",
    followers: user.followers,
    following: user.following,
    biog: user.biog,
    XP: seededXp,
    websiteSeconds: user.websiteSeconds ?? 0,
    createdAt: user.createdAt.getTime(),
    clerkData: null,
  };
}

// The first DB query against a cold connection can transiently fail under load;
// a couple of short retries prevent that from surfacing as an empty (0/0/0)
// leaderboard on the very first request after a new sign-in / server start.
async function findUsersWithRetry(retries = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await db.userModel.findMany({
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
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function compute(): Promise<LeaderboardBody> {
  // Run the (cheap, DB-only) row query and the (cached, non-blocking) community
  // stats concurrently. getCachedCommunityStats never throws.
  const [users, stats] = await Promise.all([findUsersWithRetry(), getCachedCommunityStats()]);

  const rows = users.map(toRow).sort((a, b) => {
    if (b.XP !== a.XP) return b.XP - a.XP;
    if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
    return a.name.localeCompare(b.name);
  });

  // "Total Users" is derived from the row count we JUST fetched reliably (same
  // query that fills the board), maxed with Clerk's reported signup count. Using
  // rows.length as the base — rather than a separate db.count() call — is what
  // makes the number correct on the very first response: the separate count
  // query could transiently fail on a cold connection and, swallowed to 0, made
  // the total flicker to the wrong Clerk-only number for ~a minute. rows.length
  // can't disagree with the board that's being rendered from the same data.
  const clerkTotal = stats.clerkTotalUsers ?? 0;
  const total = Math.max(rows.length, clerkTotal);

  const body: LeaderboardBody = {
    leaderboard: rows,
    total,
    clerkUserCount: clerkTotal,
    databaseUserCount: rows.length,
    newUsersTodayCount: stats.newUsersToday,
    activeUsersCount: stats.activeUsers,
    timestamp: new Date().toISOString(),
  };
  lastGood = { body, timestamp: Date.now() };
  return body;
}

function computeSingleFlight(): Promise<LeaderboardBody> {
  if (!inFlight) {
    inFlight = compute().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * Returns the leaderboard body, single-flighted and stale-while-revalidate.
 * Never throws: on a cold-start failure with no cached value it surfaces the
 * error to the caller (which returns an empty-but-200 payload); once any value
 * has been cached it always resolves.
 */
export async function getCachedLeaderboard(): Promise<LeaderboardBody> {
  const age = lastGood ? Date.now() - lastGood.timestamp : Infinity;

  if (lastGood && age < FRESH_MS) {
    return lastGood.body;
  }

  if (lastGood) {
    // Stale: serve immediately, refresh in the background.
    void computeSingleFlight().catch((err) => {
      console.warn("leaderboard background refresh failed:", err);
    });
    return lastGood.body;
  }

  // Cold start: all concurrent callers await the same computation.
  return computeSingleFlight();
}

/** Last cached body, if any — used to degrade gracefully on hard failures. */
export function getLastLeaderboard(): LeaderboardBody | null {
  return lastGood?.body ?? null;
}
