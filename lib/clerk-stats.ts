// lib/clerk-stats.ts
//
// Single source of truth for the site-wide user counts shown on both the
// leaderboard page and the homepage stats bar. Both surfaces must report the
// exact same numbers, so both call into this module instead of each running
// their own Clerk queries.
import type { clerkClient } from "@clerk/nextjs/server";

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
export async function getCommunityStats(clerk: Clerk): Promise<CommunityStats> {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * oneDayMs;

  const [totalUsers, newUsersToday, activeUsers] = await Promise.all([
    clerk.users.getCount(),
    countUsersSince(clerk, "created_at", now - oneDayMs, (u) => u.createdAt),
    countUsersSince(clerk, "last_active_at", now - thirtyDaysMs, (u) => u.lastActiveAt),
  ]);

  return { totalUsers, activeUsers, newUsersToday };
}
