// Enhanced tutor check with database support and fallback
// Provides backward compatibility while using the new database system

import { defaultIds } from "@/app/(dashboard)/(routes)/users"
import { TutorService } from "@/lib/tutor-service"

/**
 * Check if a user is a tutor
 * Uses database first, falls back to environment variables/defaults for compatibility
 */
export async function isTutor(userId?: string | null): Promise<boolean> {
	if (!userId) return false
	
	try {
		// Try database first (new system)
		return await TutorService.isTutor(userId)
	} catch (error) {
		console.warn('Database tutor check failed, falling back to legacy system:', error)
		
		// Fallback to legacy environment variable/default system
		return isTutorLegacy(userId)
	}
}

/**
 * Legacy tutor check using environment variables and defaults
 * Kept for backward compatibility and fallback scenarios
 */
export function isTutorLegacy(userId?: string | null): boolean {
	if (!userId) return false
	
	// Check if env var exists and has non-whitespace content
	const envTutorIds = process.env.NEXT_PUBLIC_TUTOR_IDS?.trim()
	
	let tutorIds: string[]
	
	if (envTutorIds) {
		// Use environment variable, split and filter out empty/whitespace entries
		tutorIds = envTutorIds.split(",").map(id => id.trim()).filter(id => id.length > 0)
		
		// If after filtering we have no valid IDs, fall back to defaults
		if (tutorIds.length === 0) {
			console.warn('NEXT_PUBLIC_TUTOR_IDS is empty, using defaults')
			tutorIds = defaultIds.tutorIds
		}
	} else {
		// No environment variable - use defaults (this is just a fallback when DB fails)
		console.warn('No NEXT_PUBLIC_TUTOR_IDS found, using legacy defaults (database should be primary)')
		tutorIds = defaultIds.tutorIds
	}

	return tutorIds.includes(userId)
}

/**
 * Synchronous version for cases where async is not possible
 * Only uses legacy system - should be migrated to async version when possible
 */
export function isTutorSync(userId?: string | null): boolean {
	return isTutorLegacy(userId)
}
