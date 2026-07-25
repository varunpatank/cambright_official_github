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
  const { clerkTotalUsers, activeUsers, newUsersToday } = await getCachedCommunityStats();
  // totalUsers is Clerk's live getCount() verbatim (null while the first fetch
  // is still in flight) so the UI matches Clerk exactly and shows a loading
  // state rather than a misleading 0. Never coerce null → 0 here.
  return NextResponse.json(
    {
      totalUsers: clerkTotalUsers,
      activeUsers,
      newUsersToday,
      timestamp: new Date().toISOString(),
    },
    { headers: NO_STORE_HEADERS }
  );
}
