// Enhanced tutor check with database support and fallback
// Provides backward compatibility while using the new database system

import { defaultIds } from "@/app/(dashboard)/(routes)/users"
import { TutorService } from "@/lib/tutor-service"

/**
 * Check if a user is a tutor
 * NOTE: Modified to allow all users access to tutor features
 */
export async function isTutor(userId?: string | null): Promise<boolean> {
	if (!userId) return false
	
	// Allow all authenticated users to access tutor features
	return true
}

/**
 * Legacy tutor check using environment variables and defaults
 * NOTE: Modified to allow all users access to tutor features
 */
export function isTutorLegacy(userId?: string | null): boolean {
	if (!userId) return false
	
	// Allow all authenticated users to access tutor features
	return true
}

/**
 * Synchronous version for cases where async is not possible
 * NOTE: Modified to allow all users access to tutor features
 */
export function isTutorSync(userId?: string | null): boolean {
	if (!userId) return false
	
	// Allow all authenticated users to access tutor features
	return true
}
