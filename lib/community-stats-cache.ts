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

async function getCachedSignupCount(): Promise<number | null> {
  const age = countCache ? Date.now() - countCache.timestamp : Infinity;
  if (countCache && age < COUNT_FRESH_MS) {
    return countCache.value;
  }
  if (countCache) {
    // Stale: serve immediately, refresh in the background so the next read is fresh.
    void refreshCountSingleFlight().catch(() => {});
    return countCache.value;
  }
  // Cold: wait on the shared refresh; keep last-good (none yet) on failure.
  try {
    return await refreshCountSingleFlight();
  } catch {
    return countCache ? (countCache as { value: number }).value : null;
  }
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

async function getCachedActivity(): Promise<ClerkActivity> {
  const age = activityCache ? Date.now() - activityCache.timestamp : Infinity;
  if (activityCache && age < ACTIVITY_FRESH_MS) {
    return activityCache.value;
  }
  if (activityCache) {
    void refreshActivitySingleFlight().catch(() => {});
    return activityCache.value;
  }
  try {
    return await refreshActivitySingleFlight();
  } catch {
    return activityCache?.value ?? { activeUsers: 0, newUsersToday: 0 };
  }
}

/**
 * Combined community stats, never throwing and never blocking on Clerk once an
 * initial value exists. `clerkTotalUsers` refreshes on the fast cycle; the
 * activity windows on the slow one.
 */
export async function getCachedCommunityStats(): Promise<CommunityStats> {
  const [clerkTotalUsers, activity] = await Promise.all([getCachedSignupCount(), getCachedActivity()]);
  return {
    clerkTotalUsers,
    activeUsers: activity.activeUsers,
    newUsersToday: activity.newUsersToday,
  };
}
