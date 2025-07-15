// v0.0.01 salah

import { createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
import { isKnownInvalidUserId } from "./invalid-user-ids";

export const getUserFirstName = async (
  userId: string | null | undefined
): Promise<string | null> => {
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  // Handle special system users gracefully
  if (userId === 'system' || userId === 'drive' || userId === 'admin' || userId === 'anonymous') {
    return null;
  }
  
  // Skip known invalid user IDs to prevent API errors
  if (isKnownInvalidUserId(userId)) {
    return null;
  }
  
  // Skip invalid user IDs that are clearly not Clerk IDs
  if (!userId.startsWith('user_') && userId.length < 10) {
    console.warn(`Invalid user ID format: ${userId}`);
    return null;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    // Prioritize firstName, then fullName, then username as fallback
    return user.firstName || user.fullName || user.username || null;
  } catch (error) {
    console.error(`Error fetching user data for ${userId}:`, error);
    return null;
  }
};

interface UserDetails {
  fullname: string | null;
  username: string | null;
  imageUrl: string | null;
  email: string | null;
  lastActiveAt: Date | null;
}

export const getUsersFirstNames = async (
  userIds: string[]
): Promise<Record<string, UserDetails | null>> => {
  try {
    const users = await Promise.all(
      userIds.map((userId) => clerkClient.users.getUser(userId))
    );

    const userMap: Record<string, UserDetails | null> = {};

    users.forEach((user) => {
      userMap[user.id] = {
        fullname: user.fullName || null,
        username: user.username || null,
        imageUrl: user.imageUrl || null,
        email: user.emailAddresses[0]?.emailAddress || null,
        lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt) : null,
      };
    });

    return userMap;
  } catch (error) {
    console.error("Error fetching users data:", error);

    return userIds.reduce((acc, userId) => {
      acc[userId] = {
        fullname: null,
        username: null,
        imageUrl: null,
        email: null,
        lastActiveAt: null,
      };
      return acc;
    }, {} as Record<string, UserDetails | null>);
  }
};
