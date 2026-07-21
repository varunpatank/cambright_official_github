import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getCommunityStats } from "@/lib/clerk-stats";

// Public, unauthenticated endpoint (see middleware.ts isPublicRoute) that
// backs the homepage stats bar. It calls the exact same Clerk queries as
// /api/leaderboard (via lib/clerk-stats.ts) so "Total Users" / "Active Users"
// on the homepage always match what the leaderboard page shows — no
// hardcoded numbers here.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// The homepage doesn't need the leaderboard's 5s live cadence, but repeated
// visitors hitting this on every load shouldn't each trigger a fresh Clerk
// scan — a short server-side cache smooths that out.
let cachedStats: { body: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 60000;

export async function GET() {
  if (cachedStats && Date.now() - cachedStats.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedStats.body, { headers: NO_STORE_HEADERS });
  }

  try {
    const clerk = await clerkClient();
    const { totalUsers, activeUsers } = await getCommunityStats(clerk);
    const body = { totalUsers, activeUsers, timestamp: new Date().toISOString() };
    cachedStats = { body, timestamp: Date.now() };
    return NextResponse.json(body, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Error fetching community stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch community stats" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
