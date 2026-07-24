// lib/community-stats-cache.ts
//
// Resilient caches for the site-wide user counts, read by both /api/leaderboard
// and /api/community-stats so the two surfaces never drift. Split into two
// independent single-flight caches with DIFFERENT refresh rates:
//
//   • Signup count — clerk.users.getCount(), one cheap call. Refreshed on a
//     short cycle so "Total Users" tracks new Clerk signups in near-real-time.
//   • Activity (active-in-30d / new-today) — each a paginated directory scan, so
//     comparatively expensive. Refreshed on a longer cycle.
//
// Both use the same pattern: single-flight (concurrent callers share one fetch),
// stale-while-revalidate (never block on Clerk once a value exists), and
// last-known-good retention (a transient Clerk failure keeps serving the last
// real value instead of a wrong one).
import { clerkClient } from "@clerk/nextjs/server";
import {
  getClerkSignupCount,
  getClerkActivity,
  type ClerkActivity,
  type CommunityStats,
} from "@/lib/clerk-stats";

// --- signup count (fast cycle) ---------------------------------------------
// Matched to the leaderboard client's 5s poll so Total Users reflects a new
// Clerk signup within a poll or two. getCount() is a single cheap call and
// single-flighted here, so even at this cadence only one runs per window
// regardless of how many tabs/users are polling — negligible Clerk load.
const COUNT_FRESH_MS = 5_000;
let countCache: { value: number; timestamp: number } | null = null;
let countInFlight: Promise<number | null> | null = null;

async function refreshCount(): Promise<number | null> {
  const clerk = await clerkClient();
  const value = await getClerkSignupCount(clerk);
  if (typeof value === "number") {
    countCache = { value, timestamp: Date.now() };
  }
  return value;
}

function refreshCountSingleFlight(): Promise<number | null> {
  if (!countInFlight) {
    countInFlight = refreshCount().finally(() => {
      countInFlight = null;
    });
  }
  return countInFlight;
}

function getCachedSignupCount(): number | null {
  const age = countCache ? Date.now() - countCache.timestamp : Infinity;
  if (countCache && age < COUNT_FRESH_MS) {
    return countCache.value;
  }
  // Cold OR stale: kick off a refresh but NEVER block the caller on Clerk — a
  // rate-limited live instance can make getCount()/the scans take a long time,
  // and the leaderboard must not wait on that. Return the last-good value, or
  // null if we've never fetched (the leaderboard then uses its own DB row count
  // for the total, so the page still shows an accurate number instantly). The
  // background refresh populates the cache for the next poll.
  void refreshCountSingleFlight().catch(() => {});
  return countCache?.value ?? null;
}

// --- activity windows (slow cycle) -----------------------------------------
const ACTIVITY_FRESH_MS = 60_000;
let activityCache: { value: ClerkActivity; timestamp: number } | null = null;
let activityInFlight: Promise<ClerkActivity> | null = null;

async function refreshActivity(): Promise<ClerkActivity> {
  const clerk = await clerkClient();
  const value = await getClerkActivity(clerk, activityCache?.value);
  activityCache = { value, timestamp: Date.now() };
  return value;
}

function refreshActivitySingleFlight(): Promise<ClerkActivity> {
  if (!activityInFlight) {
    activityInFlight = refreshActivity().finally(() => {
      activityInFlight = null;
    });
  }
  return activityInFlight;
}

function getCachedActivity(): { activeUsers: number | null; newUsersToday: number | null } {
  const age = activityCache ? Date.now() - activityCache.timestamp : Infinity;
  if (activityCache && age < ACTIVITY_FRESH_MS) {
    return activityCache.value;
  }
  // Same non-blocking policy as the signup count: never make a request wait on
  // the (expensive, paginated) activity scans. Serve last-good now; the
  // background refresh fills them in for subsequent polls. Before the first scan
  // completes there's no value yet, so return null (not 0) — the UI shows a
  // loading indicator for null rather than a misleading "0".
  void refreshActivitySingleFlight().catch(() => {});
  return activityCache?.value ?? { activeUsers: null, newUsersToday: null };
}

/**
 * Combined community stats. Fully non-blocking: it NEVER awaits a Clerk call,
 * so callers (the leaderboard) render instantly from whatever is cached and the
 * numbers refresh in the background. `clerkTotalUsers` refreshes on the fast
 * cycle; the activity windows on the slow one.
 */
export function getCachedCommunityStats(): CommunityStats {
  const clerkTotalUsers = getCachedSignupCount();
  const activity = getCachedActivity();
  return {
    clerkTotalUsers,
    activeUsers: activity.activeUsers,
    newUsersToday: activity.newUsersToday,
  };
}
