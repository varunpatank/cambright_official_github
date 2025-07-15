/**
 * List of known invalid user IDs that no longer exist in Clerk
 * These IDs will be checked before making API calls to prevent errors
 */
export const KNOWN_INVALID_USER_IDS = new Set([
	'user_2z7tEArTRVj0A3XgFac0MI47CVq',
	'user_2s1Pwh7D6AUSuWCbe0k8onsUT0s', 
	'user_2qXGBWKiLjLZXhTkJ89JCRiVMlm',
	'user_2lFzt9TAlxAqaiWPbYNCDmQv8kL',
	'user_2yPb762LolupW3vUSgMovES8Jd5',
	'user_2qXGTYWOdGsxWOiCDcXTIYwReTm',
	'user_2z8O7ZOID4S2QeED7btyePBCnQY',
	'user_2yP50WnHSqlRHPFmS4MYSz92KsS',
])

/**
 * Check if a user ID is known to be invalid
 */
export const isKnownInvalidUserId = (userId: string | null | undefined): boolean => {
	if (!userId) return false
	return KNOWN_INVALID_USER_IDS.has(userId)
}

/**
 * Add a user ID to the invalid list (for future optimization)
 */
export const addInvalidUserId = (userId: string): void => {
	KNOWN_INVALID_USER_IDS.add(userId)
} 