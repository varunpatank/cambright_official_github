// lib/clerk-stats.ts
//
// Single source of truth for the site-wide user counts shown on both the
// leaderboard page and the homepage stats bar. Both surfaces must report the
// exact same numbers, so both call into this module instead of each running
// their own Clerk queries.
import type { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type Clerk = Awaited<ReturnType<typeof clerkClient>>;

// Counts how many Clerk users have `field` >= `sinceMs`, without walking the
// whole directory: users are fetched sorted newest-`field`-first and we stop
// as soon as one falls before the cutoff (everything after is even older).
// Bounded by (matching users / 100) + 1 API calls, not total user count.
async function countUsersSince(
  clerk: Clerk,
  field: "created_at" | "last_active_at",
  sinceMs: number,
  getTimestamp: (u: { createdAt: number; lastActiveAt: number | null }) => number | null
): Promise<number> {
  const limit = 100;
  const maxPages = 10; // safety cap — 1000 users scanned is plenty for a daily/30-day window
  let count = 0;
  let offset = 0;

  for (let page = 0; page < maxPages; page++) {
    const batch = await clerk.users.getUserList({ limit, offset, orderBy: `-${field}` });
    if (batch.data.length === 0) break;

    let crossedBoundary = false;
    for (const u of batch.data) {
      const ts = getTimestamp(u);
      if (ts !== null && ts >= sinceMs) {
        count += 1;
      } else {
        crossedBoundary = true;
        break;
      }
    }
    if (crossedBoundary || batch.data.length < limit) break;
    offset += limit;
  }

  return count;
}

export interface CommunityStats {
  /** Total Clerk signups — clerk.users.getCount(), the authoritative total. */
  totalUsers: number;
  /** Users with last_active_at within the past 30 days. */
  activeUsers: number;
  /** Users with created_at within the past 24 hours. */
  newUsersToday: number;
}

// Shared by /api/leaderboard and /api/community-stats — keep any changes to
// the underlying queries here so the two surfaces can never drift apart.
//
// Each of the three counts is fetched independently and, on failure, falls back
// to the corresponding `previous` value (or 0). This matters because the counts
// have different reliability: `getCount()` is a single cheap call and almost
// always succeeds, whereas the `last_active_at`-ordered scan is more fragile. We
// must never let a failure in one count (e.g. the active-users scan) reject the
// whole thing and wipe out the authoritative total — that drift was why "Total
// Users" could show a completely wrong number.
export async function getCommunityStats(
  clerk: Clerk,
  previous?: CommunityStats
): Promise<CommunityStats> {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * oneDayMs;

  const [clerkTotal, dbUserCount, newUsersToday, activeUsers] = await Promise.all([
    clerk.users.getCount().catch((error) => {
      console.warn("clerk.users.getCount() failed:", error);
      return previous?.totalUsers ?? 0;
    }),
    // Every real, authenticated user gets a userModel row (created on their
    // first leaderboard/heartbeat request), so this is a reliable floor on the
    // real user base. We take the MAX of it and Clerk's count as "Total Users"
    // because the two can legitimately diverge — most sharply when the app is
    // pointed at a Clerk *test* instance (few users) while the database holds
    // the real/production user rows. In that case Clerk's getCount() reports a
    // tiny number (this was the "total user count is completely wrong" bug);
    // the DB count reflects reality. In a normal live deployment the two track
    // each other and the max is simply whichever is momentarily ahead.
    db.userModel.count().catch((error) => {
      console.warn("db.userModel.count() failed:", error);
      return 0;
    }),
    countUsersSince(clerk, "created_at", now - oneDayMs, (u) => u.createdAt).catch((error) => {
      console.warn("new-users-today count failed:", error);
      return previous?.newUsersToday ?? 0;
    }),
    countUsersSince(clerk, "last_active_at", now - thirtyDaysMs, (u) => u.lastActiveAt).catch(
      (error) => {
        console.warn("active-users count failed:", error);
        return previous?.activeUsers ?? 0;
      }
    ),
  ]);

  const totalUsers = Math.max(clerkTotal, dbUserCount);

  return { totalUsers, activeUsers, newUsersToday };
}
