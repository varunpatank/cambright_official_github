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
  /**
   * Clerk's reported signup count (clerk.users.getCount()), or null if that
   * call failed this round. This is only ONE input to the displayed "Total
   * Users": the leaderboard combines it with its own reliable DB row count
   * (see lib/leaderboard-cache.ts), because getCount() can undercount or point
   * at a different (e.g. test) Clerk instance than the one that owns the rows.
   */
  clerkTotalUsers: number | null;
  /** Users with last_active_at within the past 30 days. */
  activeUsers: number;
  /** Users with created_at within the past 24 hours. */
  newUsersToday: number;
}

// Clerk's live total signup count — a single, cheap Backend API call. This is
// the number that must update in near-real-time as people sign up, so it's
// cached on a short cycle of its own (see lib/community-stats-cache.ts), apart
// from the far more expensive activity scans below. Returns null on failure so
// the caller can keep its last-good value rather than showing a wrong number.
export async function getClerkSignupCount(clerk: Clerk): Promise<number | null> {
  try {
    return await clerk.users.getCount();
  } catch (error) {
    console.warn("clerk.users.getCount() failed:", error);
    return null;
  }
}

export interface ClerkActivity {
  activeUsers: number;
  newUsersToday: number;
}

// The activity windows (active in last 30 days, new in last 24h) each require a
// paginated scan of Clerk's directory, so they're comparatively expensive and
// cached on a longer cycle than the signup count. Each degrades to `previous`
// on failure so one scan failing can't zero out the other.
export async function getClerkActivity(
  clerk: Clerk,
  previous?: ClerkActivity
): Promise<ClerkActivity> {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * oneDayMs;

  const [newUsersToday, activeUsers] = await Promise.all([
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

  return { activeUsers, newUsersToday };
}
