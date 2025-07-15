// Enhanced Tutor Service with caching and audit logging
// Handles all tutor-related operations with performance optimization

import { db } from '@/lib/db'
import { cache } from '@/lib/cache'
import { TutorRole } from '@prisma/client'

const CACHE_TTL = 300 // 5 minutes
const CACHE_KEY = 'active-tutors'
const CACHE_KEY_ALL = 'all-tutors'

interface TutorWithAudit {
	id: string
	userId: string
	isActive: boolean
	role: TutorRole
	addedBy: string
	createdAt: Date
	updatedAt: Date
	auditLogs?: {
		id: string
		action: string
		performedBy: string
		details: any
		createdAt: Date
	}[]
}

export class TutorService {
	/**
	 * Get list of active tutor user IDs (cached)
	 */
	private static async getActiveTutorIds(): Promise<string[]> {
		// Try cache first
		const cached = await cache.get(CACHE_KEY)
		if (cached) {
			return JSON.parse(cached)
		}

		// Query database
		const tutors = await db.tutor.findMany({
			where: { isActive: true },
			select: { userId: true },
		})

		const tutorIds = tutors.map(t => t.userId)
		
		// Cache the result
		await cache.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(tutorIds))
		
		return tutorIds
	}

	/**
	 * Check if a user ID belongs to an active tutor
	 */
	static async isTutor(userId?: string | null): Promise<boolean> {
		if (!userId) return false
		
		const activeTutorIds = await this.getActiveTutorIds()
		return activeTutorIds.includes(userId)
	}

	/**
	 * Get all tutors with audit logs (cached)
	 * Also populates the active tutors cache for better coordination
	 */
	static async getAllTutors(): Promise<TutorWithAudit[]> {
		const cached = await cache.get(CACHE_KEY_ALL)
		if (cached) {
			return JSON.parse(cached)
		}

		const tutors = await db.tutor.findMany({
			include: {
				auditLogs: {
					orderBy: { createdAt: 'desc' },
					take: 5
				}
			}
		})

		// Cache all tutors
		await cache.setex(CACHE_KEY_ALL, CACHE_TTL, JSON.stringify(tutors))
		
		// Also populate the active tutors cache for coordination
		const activeTutorIds = tutors
			.filter(t => t.isActive)
			.map(t => t.userId)
		await cache.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(activeTutorIds))
		
		return tutors as TutorWithAudit[]
	}

	/**
	 * Get a specific tutor by user ID
	 */
	static async getTutorByUserId(userId: string): Promise<TutorWithAudit | null> {
		const tutor = await db.tutor.findUnique({
			where: { userId },
			include: {
				auditLogs: {
					orderBy: { createdAt: 'desc' },
					take: 10
				}
			}
		})

		return tutor as TutorWithAudit | null
	}

	/**
	 * Add a new tutor
	 */
	static async addTutor(
		userId: string, 
		addedBy: string, 
		role: TutorRole = TutorRole.TUTOR
	): Promise<TutorWithAudit> {
		// Check if tutor already exists
		const existingTutor = await db.tutor.findUnique({
			where: { userId }
		})

		if (existingTutor) {
			if (existingTutor.isActive) {
				throw new Error('User is already an active tutor')
			}
			
			// Reactivate existing tutor
			const updatedTutor = await db.tutor.update({
				where: { userId },
				data: { 
					isActive: true,
					role,
					updatedAt: new Date(),
				},
				include: {
					auditLogs: {
						orderBy: { createdAt: 'desc' },
						take: 5
					}
				}
			})

			// Add audit log
			await db.tutorAuditLog.create({
				data: {
					tutorId: updatedTutor.id,
					action: 'REACTIVATED',
					performedBy: addedBy,
					details: { role, previousRole: existingTutor.role }
				}
			})

			await this.clearCache()
			return updatedTutor as TutorWithAudit
		}

		// Create new tutor
		const newTutor = await db.tutor.create({
			data: {
				userId,
				addedBy,
				role,
				auditLogs: {
					create: {
						action: 'ADDED',
						performedBy: addedBy,
						details: { role }
					}
				}
			},
			include: {
				auditLogs: {
					orderBy: { createdAt: 'desc' },
					take: 5
				}
			}
		})
		
		await this.clearCache()
		return newTutor as TutorWithAudit
	}

	/**
	 * Remove/deactivate a tutor
	 */
	static async removeTutor(userId: string, removedBy: string): Promise<void> {
		const tutor = await db.tutor.findUnique({
			where: { userId }
		})

		if (!tutor) {
			throw new Error('Tutor not found')
		}

		if (!tutor.isActive) {
			throw new Error('Tutor is already inactive')
		}

		await db.tutor.update({
			where: { userId },
			data: { 
				isActive: false,
				updatedAt: new Date(),
			}
		})

		// Add audit log
		await db.tutorAuditLog.create({
			data: {
				tutorId: tutor.id,
				action: 'DEACTIVATED',
				performedBy: removedBy,
				details: { reason: 'Manual removal' }
			}
		})
		
		await this.clearCache()
	}

	/**
	 * Update tutor role
	 */
	static async updateTutorRole(
		userId: string, 
		newRole: TutorRole, 
		updatedBy: string
	): Promise<TutorWithAudit> {
		const tutor = await db.tutor.findUnique({
			where: { userId }
		})

		if (!tutor) {
			throw new Error('Tutor not found')
		}

		const oldRole = tutor.role

		const updatedTutor = await db.tutor.update({
			where: { userId },
			data: { 
				role: newRole,
				updatedAt: new Date(),
			},
			include: {
				auditLogs: {
					orderBy: { createdAt: 'desc' },
					take: 5
				}
			}
		})

		// Add audit log
		await db.tutorAuditLog.create({
			data: {
				tutorId: tutor.id,
				action: 'ROLE_UPDATED',
				performedBy: updatedBy,
				details: { oldRole, newRole }
			}
		})

		await this.clearCache()
		return updatedTutor as TutorWithAudit
	}

	/**
	 * Get audit history for a specific tutor
	 */
	static async getTutorAuditHistory(userId: string, limit = 50) {
		const tutor = await db.tutor.findUnique({
			where: { userId },
			include: {
				auditLogs: {
					orderBy: { createdAt: 'desc' },
					take: limit
				}
			}
		})

		return tutor?.auditLogs || []
	}

	/**
	 * Clear all tutor-related cache
	 */
	static async clearCache(): Promise<void> {
		await Promise.all([
			cache.del(CACHE_KEY),
			cache.del(CACHE_KEY_ALL)
		])
	}

	/**
	 * Get tutor statistics
	 */
	static async getTutorStats() {
		try {
			const tutors = await this.getAllTutors()
			
			const stats = {
				total: tutors.length,
				active: tutors.filter(t => t.isActive).length,
				inactive: tutors.filter(t => !t.isActive).length,
				adminTutors: tutors.filter(t => t.role === TutorRole.ADMIN_TUTOR).length,
				seniorTutors: tutors.filter(t => t.role === TutorRole.SENIOR_TUTOR).length,
				regularTutors: tutors.filter(t => t.role === TutorRole.TUTOR).length
			}

			return stats
		} catch (error) {
			console.error('Database connection failed - unable to get tutor stats:', error)
			// Return fallback stats indicating database connection issue
			return {
				total: -1, // Negative values indicate database connection issue
				active: -1,
				inactive: -1,
				adminTutors: -1,
				seniorTutors: -1,
				regularTutors: -1
			}
		}
	}

	/**
	 * Migrate existing tutors from environment variable/defaults
	 */
	static async migrateExistingTutors(existingTutorIds: string[], migratedBy: string) {
		const results = {
			successful: [] as string[],
			failed: [] as { userId: string; error: string }[],
			skipped: [] as string[]
		}

		for (const userId of existingTutorIds) {
			try {
				// Check if already exists
				const existing = await db.tutor.findUnique({
					where: { userId }
				})

				if (existing) {
					results.skipped.push(userId)
					continue
				}

				// Add as tutor
				await this.addTutor(userId, migratedBy, TutorRole.TUTOR)
				results.successful.push(userId)
			} catch (error) {
				results.failed.push({
					userId,
					error: error instanceof Error ? error.message : 'Unknown error'
				})
			}
		}

		return results
	}

	/**
	 * Warm up the cache by pre-loading active tutors
	 * This can be called on app startup or periodically
	 */
	static async warmCache(): Promise<void> {
		try {
			// Pre-load both caches
			await this.getActiveTutorIds()
			await this.getAllTutors()
		} catch (error) {
			console.warn('Failed to warm tutor cache:', error)
		}
	}
}

export const addTutor = TutorService.addTutor
export const removeTutor = TutorService.removeTutor 