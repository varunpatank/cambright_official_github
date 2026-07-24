// lib/community-stats-cache.ts
//
// Shared, resilient cache for the site-wide user counts (total / active today
// / new today). Both /api/leaderboard and /api/community-stats read through
// THIS module rather than each running their own Clerk scan, which gives us
// three properties that fixed the leaderboard's 500s and its wrong "Total
// Users" number:
//
//   1. Single-flight — no matter how many tabs poll /api/leaderboard every 5s,
//      at most ONE Clerk scan runs at a time. Concurrent callers await the same
//      in-flight promise instead of each launching their own (the old code had
//      no such guard, so a cold cache let a dozen concurrent polls each kick off
//      a full Clerk directory walk, exhausting the DB/Clerk connection budget).
//   2. Stale-while-revalidate — once we have any numbers, callers get them
//      instantly while a refresh happens in the background. Nobody ever waits on
//      Clerk on the hot path.
//   3. Last-known-good retention — if Clerk momentarily fails, we keep serving
//      the previous good numbers instead of dropping to a wrong fallback. This
//      was the cause of "Total Users is completely wrong": a transient Clerk
//      error made the old code fall back to the DB row count.
import { clerkClient } from "@clerk/nextjs/server";
import { getCommunityStats, type CommunityStats } from "@/lib/clerk-stats";

// Serve cached numbers without refreshing while younger than this.
const FRESH_MS = 60_000;
// Past this age we still serve the stale value but trigger a background refresh.
// (There is no hard "block and wait" ceiling — we always prefer returning a
// real, if old, number over making the caller wait on Clerk.)
const STALE_REFRESH_MS = 60_000;

let lastGood: { stats: CommunityStats; timestamp: number } | null = null;
let inFlight: Promise<CommunityStats> | null = null;

async function refresh(): Promise<CommunityStats> {
  const clerk = await clerkClient();
  // Pass the last-good stats so per-count failures inside getCommunityStats
  // fall back to the previous real value rather than 0.
  const stats = await getCommunityStats(clerk, lastGood?.stats);
  lastGood = { stats, timestamp: Date.now() };
  return stats;
}

function refreshSingleFlight(): Promise<CommunityStats> {
  if (!inFlight) {
    inFlight = refresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * Returns the site-wide community stats, never throwing and never blocking on
 * Clerk once an initial value exists. Safe to call on every request.
 */
export async function getCachedCommunityStats(): Promise<CommunityStats> {
  const age = lastGood ? Date.now() - lastGood.timestamp : Infinity;

  if (lastGood && age < FRESH_MS) {
    return lastGood.stats;
  }

  if (lastGood && age >= STALE_REFRESH_MS) {
    // Kick off a background refresh but don't wait on it — serve the stale value.
    void refreshSingleFlight().catch((err) => {
      console.warn("community-stats background refresh failed:", err);
    });
    return lastGood.stats;
  }

  // Cold start — no numbers yet. Wait on the shared refresh (all concurrent
  // callers share this one promise), and if even that fails, degrade to zeros
  // rather than throwing.
  try {
    return await refreshSingleFlight();
  } catch (err) {
    console.warn("community-stats initial fetch failed:", err);
    return lastGood?.stats ?? { totalUsers: 0, activeUsers: 0, newUsersToday: 0 };
  }
}
