import { db } from '@/lib/db'

/**
 * Get the database username for profile links from a Clerk user ID
 * Returns null if user not found or invalid ID
 */
export const getDatabaseUsername = async (
	clerkUserId: string | null | undefined
): Promise<string | null> => {
	if (!clerkUserId || typeof clerkUserId !== 'string') {
		return null
	}

	// Handle special system users gracefully
	if (clerkUserId === 'system' || clerkUserId === 'drive' || clerkUserId === 'admin' || clerkUserId === 'anonymous') {
		return null
	}
	
	// Skip invalid user IDs that are clearly not Clerk IDs
	if (!clerkUserId.startsWith('user_') && clerkUserId.length < 10) {
		console.warn(`Invalid user ID format: ${clerkUserId}`)
		return null
	}

	try {
		const user = await db.userModel.findUnique({
			where: { userId: clerkUserId },
			select: { name: true }
		})

		return user?.name || null
	} catch (error) {
		console.error(`Failed to get database username for ${clerkUserId}:`, error)
		return null
	}
}

/**
 * Get complete user data from database (name and image)
 */
export const getDatabaseUserData = async (
	clerkUserId: string | null | undefined
): Promise<{ name: string | null; imageUrl: string | null }> => {
	if (!clerkUserId || typeof clerkUserId !== 'string') {
		return { name: null, imageUrl: null }
	}

	// Handle special system users gracefully
	if (clerkUserId === 'system' || clerkUserId === 'drive' || clerkUserId === 'admin' || clerkUserId === 'anonymous') {
		return { name: null, imageUrl: null }
	}
	
	// Skip invalid user IDs that are clearly not Clerk IDs
	if (!clerkUserId.startsWith('user_') && clerkUserId.length < 10) {
		console.warn(`Invalid user ID format: ${clerkUserId}`)
		return { name: null, imageUrl: null }
	}

	try {
		const user = await db.userModel.findUnique({
			where: { userId: clerkUserId },
			select: { 
				name: true,
				imageUrl: true
			}
		})

		return {
			name: user?.name || null,
			imageUrl: user?.imageUrl || null
		}
	} catch (error) {
		console.error(`Failed to get database user data for ${clerkUserId}:`, error)
		return { name: null, imageUrl: null }
	}
}

/**
 * Get multiple database usernames at once for better performance
 */
export const getDatabaseUsernames = async (
	clerkUserIds: (string | null | undefined)[]
): Promise<Record<string, string | null>> => {
	const validIds = clerkUserIds.filter(
		(id): id is string => 
			!!id && 
			typeof id === 'string' && 
			(id.startsWith('user_') || id.length >= 10)
	)

	if (validIds.length === 0) {
		return {}
	}

	try {
		const users = await db.userModel.findMany({
			where: { 
				userId: { in: validIds }
			},
			select: { 
				userId: true,
				name: true 
			}
		})

		const result: Record<string, string | null> = {}
		
		// Initialize all IDs as null
		validIds.forEach(id => {
			result[id] = null
		})
		
		// Update with found usernames
		users.forEach(user => {
			result[user.userId] = user.name
		})

		return result
	} catch (error) {
		console.error('Failed to get database usernames:', error)
		
		// Return all nulls on error
		const result: Record<string, string | null> = {}
		validIds.forEach(id => {
			result[id] = null
		})
		return result
	}
} 