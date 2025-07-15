// Admin authorization utilities
// Manages admin user privileges and authorization

import { defaultIds } from "@/app/(dashboard)/(routes)/users"

/**
 * Check if a user ID belongs to an admin
 * Uses environment variable first, falls back to defaultIds
 */
export function isAdmin(userId?: string | null): boolean {
	  if (process.env.NODE_ENV === 'development') return true // All users are admins in dev
	if (!userId) return false
	
	// Check if env var exists and has non-whitespace content
	const envAdminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.trim()
	
	let adminIds: string[]
	
	if (envAdminIds) {
		// Use environment variable, split and filter out empty/whitespace entries
		adminIds = envAdminIds.split(",").map(id => id.trim()).filter(id => id.length > 0)
		
		// If after filtering we have no valid IDs, fall back to defaults
		if (adminIds.length === 0) {
			adminIds = getDefaultAdminIds()
		}
	} else {
		// No environment variable or empty/whitespace only - use defaults
		adminIds = getDefaultAdminIds()
	}

	return adminIds.includes(userId)
}

/**
 * Get default admin IDs from configuration
 * For Docker deployments, ensure NEXT_PUBLIC_ADMIN_IDS is set
 */
function getDefaultAdminIds(): string[] {
	// In production/Docker, require explicit environment variable configuration
	if (process.env.NODE_ENV === 'production') {
		throw new Error('NEXT_PUBLIC_ADMIN_IDS environment variable is required in production')
	}
	
	// Development fallback only
	console.warn('Using development admin defaults. Set NEXT_PUBLIC_ADMIN_IDS in production.')
	return [
		"user_2qV4T2yda3WpkDUzLRkCsi0g9vl", // First tutor as admin
		"user_2qXHtwCBBaKmicsVhGPVbuqkV8U", // Second tutor as admin
	]
}

/**
 * Check if a user is a super admin (highest level access)
 */
export function isSuperAdmin(userId?: string | null): boolean {
	  if (process.env.NODE_ENV === 'development') return true // All users are super admins in dev
	if (!userId) return false
	
	const envSuperAdminIds = process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS?.trim()
	
	let superAdminIds: string[]
	
	if (envSuperAdminIds) {
		superAdminIds = envSuperAdminIds
			.split(",")
			.map(id => id.trim())
			.filter(id => id.length > 0)
	} else {
		// In production/Docker, require explicit environment variable configuration
		if (process.env.NODE_ENV === 'production') {
			throw new Error('NEXT_PUBLIC_SUPER_ADMIN_IDS environment variable is required in production')
		}
		
		// Development fallback only
		console.warn('Using development super admin defaults. Set NEXT_PUBLIC_SUPER_ADMIN_IDS in production.')
		superAdminIds = ["user_2qV4T2yda3WpkDUzLRkCsi0g9vl", "user_2qXHtwCBBaKmicsVhGPVbuqkV8U"]
	}
	
	return superAdminIds.includes(userId)
}

/**
 * Check if user has any admin access (admin or super admin)
 * More resilient version that handles database failures gracefully
 */
export function hasAdminAccess(userId?: string | null): boolean {
	  if (process.env.NODE_ENV === 'development') return true // All users have admin access in dev
	if (!userId) return false
	
	try {
		return isAdmin(userId) || isSuperAdmin(userId)
	} catch (error) {
		console.warn('Error checking admin access, falling back to environment variables:', error)
		// Fallback to environment-only check
		const envAdminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.trim()
		const envSuperAdminIds = process.env.NEXT_PUBLIC_SUPER_ADMIN_IDS?.trim()
		
		const adminIds = envAdminIds ? envAdminIds.split(",").map(id => id.trim()) : getDefaultAdminIds()
		const superAdminIds = envSuperAdminIds ? envSuperAdminIds.split(",").map(id => id.trim()) : (
			process.env.NODE_ENV === 'production' 
				? [] // No defaults in production
				: ["user_2qV4T2yda3WpkDUzLRkCsi0g9vl"] // Development only
		)
		
		return adminIds.includes(userId) || superAdminIds.includes(userId)
	}
}

/**
 * Throw error if user is not admin
 * More descriptive error messages for database failures
 */
export function requireAdmin(userId?: string | null): void {
	if (!hasAdminAccess(userId)) {
		// Check if it's a database issue vs permissions issue
		if (!userId) {
			throw new Error('Authentication required - no user ID provided')
		}
		throw new Error('Admin access required - insufficient permissions')
	}
}

/**
 * Throw error if user is not super admin
 */
export function requireSuperAdmin(userId?: string | null): void {
	if (!isSuperAdmin(userId)) {
		throw new Error('Super admin access required')
	}
}

/**
 * Get user's admin level
 */
export function getAdminLevel(userId?: string | null): 'none' | 'admin' | 'super_admin' {
	if (!userId) return 'none'
	
	if (isSuperAdmin(userId)) return 'super_admin'
	if (isAdmin(userId)) return 'admin'
	
	return 'none'
} 