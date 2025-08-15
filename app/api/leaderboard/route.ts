// app/api/leaderboard/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

// Export the GET method
export async function GET() {
  try {
    // Fetch the leaderboard data sorted by XP
    const leaderboard = await db.userModel.findMany({
      orderBy: {
        XP: "desc",
      },
      select: {
        id: true,
        userId: true,
        name: true,
        imageUrl: true,
        email: true,
        followers: true,
        following: true,
        biog: true,
        XP: true,
      },
    });

    // Get Clerk user data for all users to ensure we have latest info
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (user) => {
        try {
          // Get latest user data from Clerk
          const clerkUser = await clerkClient.users.getUser(user.userId);
          
          return {
            id: user.id,
            userId: user.userId,
            name: user.name || clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.username || 'Anonymous',
            imageUrl: user.imageUrl || clerkUser.imageUrl,
            email: user.email || clerkUser.emailAddresses[0]?.emailAddress,
            followers: user.followers,
            following: user.following,
            biog: user.biog,
            XP: user.XP,
            // Additional Clerk data
            clerkData: {
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              username: clerkUser.username,
              profileImageUrl: clerkUser.imageUrl,
              lastSignInAt: clerkUser.lastSignInAt,
              createdAt: clerkUser.createdAt,
            }
          };
        } catch (clerkError) {
          console.warn(`Could not fetch Clerk data for user ${user.userId}:`, clerkError);
          // Return user data without Clerk enrichment
          return {
            id: user.id,
            userId: user.userId,
            name: user.name || 'Anonymous',
            imageUrl: user.imageUrl,
            email: user.email,
            followers: user.followers,
            following: user.following,
            biog: user.biog,
            XP: user.XP,
            clerkData: null
          };
        }
      })
    );

    // Get additional Clerk users who might not be in our database yet
    try {
      // First get total count to know how many users exist
      const userCount = await clerkClient.users.getCount();
      console.log(`Total Clerk users: ${userCount}`);
      
      // Fetch all users in batches (Clerk API limit is usually 500 per request)
      const allClerkUsers = [];
      let offset = 0;
      const limit = 500;
      
      while (offset < userCount) {
        const batch = await clerkClient.users.getUserList({
          limit: limit,
          offset: offset,
          orderBy: '-created_at'
        });
        
        allClerkUsers.push(...batch.data);
        offset += limit;
        
        console.log(`Fetched ${allClerkUsers.length} of ${userCount} Clerk users`);
        
        // Break if we've got all users or if this batch was smaller than limit
        if (batch.data.length < limit) {
          break;
        }
      }

      console.log(`Successfully fetched all ${allClerkUsers.length} Clerk users`);

      // Find users who are in Clerk but not in our leaderboard
      const existingUserIds = new Set(leaderboard.map(u => u.userId));
      const newUsers = allClerkUsers.filter(clerkUser => !existingUserIds.has(clerkUser.id));

      console.log(`Found ${newUsers.length} new users not in database`);

      // Add new users with 0 XP
      const newUserEntries = newUsers.map(clerkUser => ({
        id: `new-${clerkUser.id}`, // Temporary ID for new users
        userId: clerkUser.id,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.username || 'Anonymous',
        imageUrl: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        followers: 0,
        following: 0,
        biog: '',
        XP: 0,
        clerkData: {
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          username: clerkUser.username,
          profileImageUrl: clerkUser.imageUrl,
          lastSignInAt: clerkUser.lastSignInAt,
          createdAt: clerkUser.createdAt,
        }
      }));

      // Combine and sort all users by XP
      const completeLeaderboard = [...enrichedLeaderboard, ...newUserEntries]
        .sort((a, b) => b.XP - a.XP);

      return NextResponse.json({
        leaderboard: completeLeaderboard,
        total: completeLeaderboard.length,
        clerkUserCount: allClerkUsers.length,
        databaseUserCount: leaderboard.length,
        newUserCount: newUsers.length,
        timestamp: new Date().toISOString()
      });

    } catch (clerkListError) {
      console.warn('Could not fetch additional Clerk users:', clerkListError);
      // Return just the enriched existing leaderboard
      return NextResponse.json({
        leaderboard: enrichedLeaderboard,
        total: enrichedLeaderboard.length,
        clerkUserCount: 'Error fetching',
        databaseUserCount: leaderboard.length,
        newUserCount: 0,
        error: 'Could not fetch all Clerk users',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
