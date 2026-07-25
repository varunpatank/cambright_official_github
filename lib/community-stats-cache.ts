// lib/community-stats-cache.ts
//
// Resilient caches for the site-wide user counts (Total / Active / new-today),
// read by /api/community-stats and shared so every surface reports the same
// numbers.
//
// SERVERLESS-SAFE BY DESIGN. This runs on Vercel serverless functions, where any
// work kicked off AFTER the response is sent (fire-and-forget `void refresh()`)
// is NOT reliably executed — the function suspends the moment it responds. An
// earlier version used stale-while-revalidate with a background refresh; on
// serverless that background refresh never completed, so a cold function
// instance returned null forever and the numbers never loaded / never updated in
// production. So these caches REFRESH INLINE: on a cache miss we AWAIT the Clerk
// fetch within the request and return the fresh value. A short TTL keeps them
// current; single-flight collapses concurrent refreshes on a warm instance so we
// never fire duplicate Clerk calls for the same window.
import { clerkClient } from "@clerk/nextjs/server";
import {
  getClerkSignupCount,
  getClerkActivity,
  type ClerkActivity,
  type CommunityStats,
} from "@/lib/clerk-stats";

// --- signup count (fast) ---------------------------------------------------
// getCount() is a single cheap call, so a short TTL makes Total Users track new
// signups closely (client polls every 5s).
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

async function getSignupCount(): Promise<number | null> {
  const age = countCache ? Date.now() - countCache.timestamp : Infinity;
  if (countCache && age < COUNT_FRESH_MS) {
    return countCache.value;
  }
  // Miss/stale: refresh INLINE (awaited) — see the serverless note above.
  try {
    const value = await refreshCountSingleFlight();
    return typeof value === "number" ? value : countCache?.value ?? null;
  } catch {
    return countCache?.value ?? null;
  }
}

// --- activity windows (slower) ---------------------------------------------
// Each is a paginated directory scan (~1-2s), so a slightly longer TTL. Still
// short enough that Logins Today / Active Users visibly update.
const ACTIVITY_FRESH_MS = 15_000;
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

async function getActivity(): Promise<{ activeUsers: number | null; newUsersToday: number | null }> {
  const age = activityCache ? Date.now() - activityCache.timestamp : Infinity;
  if (activityCache && age < ACTIVITY_FRESH_MS) {
    return activityCache.value;
  }
  // Miss/stale: refresh INLINE (awaited).
  try {
    return await refreshActivitySingleFlight();
  } catch {
    return activityCache?.value ?? { activeUsers: null, newUsersToday: null };
  }
}

/**
 * Combined community stats, fetched from Clerk within the request (serverless-
 * safe). `clerkTotalUsers` is Clerk's getCount() verbatim; the activity windows
 * come from directory scans. Any field is null only if that Clerk call has never
 * succeeded — the UI renders a loading spinner for null, never a 0.
 */
export async function getCachedCommunityStats(): Promise<CommunityStats> {
  const [clerkTotalUsers, activity] = await Promise.all([getSignupCount(), getActivity()]);
  return {
    clerkTotalUsers,
    activeUsers: activity.activeUsers,
    newUsersToday: activity.newUsersToday,
  };
}
