// v0.0.01 salah

import { createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
import { isKnownInvalidUserId } from "./invalid-user-ids";

export const getUserIMGURL = async (userId: string | null | undefined): Promise<string | null> => {
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
    const response = await clerkClient.users.getUser(userId);
    return response.imageUrl || null;
  } catch (error) {
    console.error(`Error fetching user image for ${userId}:`, error);
    return null;
  }
};
