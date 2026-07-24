import { NextResponse } from "next/server";
import { getCachedCommunityStats } from "@/lib/community-stats-cache";

// Public, unauthenticated endpoint (see middleware.ts isPublicRoute) that
// backs the homepage stats bar. It reads the SAME shared, single-flighted stats
// cache as /api/leaderboard (lib/community-stats-cache.ts), so "Total Users" /
// "Active Users" on the homepage always match the leaderboard page, the two
// surfaces never both trigger a Clerk scan at once, and a transient Clerk error
// serves the last known-good numbers instead of failing. No hardcoded numbers.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  const { totalUsers, activeUsers } = await getCachedCommunityStats();
  return NextResponse.json(
    { totalUsers, activeUsers, timestamp: new Date().toISOString() },
    { headers: NO_STORE_HEADERS }
  );
}
