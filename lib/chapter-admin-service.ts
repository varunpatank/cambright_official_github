// Chapter Admin Service
// Handles all chapter admin-related operations with role management and permissions

import { db, optimizedQueries } from '@/lib/db'
import { cache } from '@/lib/cache'
import { withQueryMonitoring } from '@/lib/query-performance-monitor'
import { trackAdminAssignment } from '@/lib/performance-metrics'
import { withAdminOperationTracking } from '@/lib/metrics-middleware'
import { ChapterAdminRole } from '@prisma/client'

const CACHE_TTL = 300 // 5 minutes
const CACHE_KEY_PREFIX = 'chapter-admin'

interface ChapterAdminWithSchool {
	id: string
	userId: string
	schoolId: string
	role: ChapterAdminRole
	assignedBy: string
	isActive: boolean
	createdAt: Date
	updatedAt: Date
	school: {
		id: string
		name: string
		description: string | null
		location: string | null
		isActive: boolean
	}
	user?: {
		id: string
		name: string
		email: string
		imageUrl: string | null
	}
}

interface SchoolWithAdmins {
	id: string
	name: string
	description: string | null
	location: string | null
	isActive: boolean
	chapterAdmins: {
		id: string
		userId: string
		role: ChapterAdminRole
		assignedBy: string
		isActive: boolean
		createdAt: Date
	}[]
}

export class ChapterAdminService {
	/**
	 * Assign a chapter admin to a school
	 */
	static async assignAdmin(
		schoolId: string,
		targetUserId: string,
		role: ChapterAdminRole,
		assignedBy: string
	): Promise<ChapterAdminWithSchool> {
		const start = Date.now()
		
		try {
			// Validate school exists
			const school = await db.school.findUnique({
				where: { id: schoolId, isActive: true }
			})

			if (!school) {
				throw new Error('School not found or inactive')
			}

			// Ensure user exists in UserModel table by fetching from Clerk
			await this.ensureUserInDatabase(targetUserId)

			// Check if admin assignment already exists
			const existingAdmin = await db.chapterAdmin.findUnique({
				where: {
					userId_schoolId: {
						userId: targetUserId,
						schoolId: schoolId
					}
				}
			})

			if (existingAdmin) {
				if (existingAdmin.isActive) {
					throw new Error('User is already an admin for this school')
				}
				
				// Reactivate existing admin with new role
				const updatedAdmin = await db.chapterAdmin.update({
					where: { id: existingAdmin.id },
					data: {
						isActive: true,
						role: role,
						assignedBy: assignedBy,
						updatedAt: new Date()
					},
					include: {
						school: {
							select: {
								id: true,
								name: true,
								description: true,
								location: true,
								isActive: true
							}
						}
					}
				})

				await this.clearUserCache(targetUserId)
				await this.clearSchoolCache(schoolId)
				
				// Track successful admin assignment
				const duration = Date.now() - start
				trackAdminAssignment(schoolId, targetUserId, assignedBy, role, true, duration)
				
				return updatedAdmin as ChapterAdminWithSchool
			}

			// Create new admin assignment
			const newAdmin = await db.chapterAdmin.create({
				data: {
					userId: targetUserId,
					schoolId: schoolId,
					role: role,
					assignedBy: assignedBy
				},
				include: {
					school: {
						select: {
							id: true,
							name: true,
							description: true,
							location: true,
							isActive: true
						}
					}
				}
			})

			await this.clearUserCache(targetUserId)
			await this.clearSchoolCache(schoolId)

			// Track successful admin assignment
			const duration = Date.now() - start
			trackAdminAssignment(schoolId, targetUserId, assignedBy, role, true, duration)

			return newAdmin as ChapterAdminWithSchool
		} catch (error) {
			// Track failed admin assignment
			const duration = Date.now() - start
			const errorMessage = error instanceof Error ? error.message : String(error)
			trackAdminAssignment(schoolId, targetUserId, assignedBy, role, false, duration, errorMessage)
			
			throw error
		}
	}

	/**
	 * Remove a chapter admin assignment
	 */
	static async removeAdmin(adminId: string, removedBy: string): Promise<void> {
		const admin = await db.chapterAdmin.findUnique({
			where: { id: adminId }
		})

		if (!admin) {
			throw new Error('Chapter admin assignment not found')
		}

		if (!admin.isActive) {
			throw new Error('Chapter admin assignment is already inactive')
		}

		await db.chapterAdmin.update({
			where: { id: adminId },
			data: {
				isActive: false,
				updatedAt: new Date()
			}
		})

		await this.clearUserCache(admin.userId)
		await this.clearSchoolCache(admin.schoolId)
	}

	/**
	 * Get all admins for a specific school
	 */
	static async getAdminsBySchool(schoolId: string): Promise<ChapterAdminWithSchool[]> {
		const cacheKey = `${CACHE_KEY_PREFIX}:school:${schoolId}`
		const cached = await cache.get(cacheKey)
		
		if (cached) {
			return JSON.parse(cached)
		}

		const admins = await withQueryMonitoring(
			`getAdminsBySchool:${schoolId}`,
			() => db.chapterAdmin.findMany({
				where: {
					schoolId: schoolId,
					isActive: true
				},
				include: {
					school: {
						select: {
							id: true,
							name: true,
							description: true,
							location: true,
							isActive: true
						}
					}
				},
				orderBy: [
					{ role: 'desc' }, // Super admins first
					{ createdAt: 'asc' }
				]
			})
		)

		// Manually fetch user information for each admin
		const adminsWithUserInfo = await Promise.all(
			admins.map(async (admin) => {
				try {
					const user = await db.userModel.findUnique({
						where: { userId: admin.userId },
						select: {
							id: true,
							userId: true,
							name: true,
							email: true,
							imageUrl: true
						}
					})
					return {
						...admin,
						user: user ? {
							id: user.userId,
							name: user.name,
							email: user.email,
							imageUrl: user.imageUrl
						} : undefined
					}
				} catch (error) {
					console.error(`Error fetching user ${admin.userId}:`, error)
					return admin
				}
			})
		)

		await cache.setex(cacheKey, CACHE_TTL, JSON.stringify(adminsWithUserInfo))
		return adminsWithUserInfo as ChapterAdminWithSchool[]
	}

	/**
	 * Get all schools where a user has admin privileges
	 */
	static async getSchoolsByUser(userId: string): Promise<ChapterAdminWithSchool[]> {
		const cacheKey = `${CACHE_KEY_PREFIX}:user:${userId}`
		const cached = await cache.get(cacheKey)
		
		if (cached) {
			return JSON.parse(cached)
		}

		const adminAssignments = await withQueryMonitoring(
			`getSchoolsByUser:${userId}`,
			() => optimizedQueries.getChapterAdminPermissions(userId)
		)

		// Convert to expected format
		const formattedAssignments = adminAssignments.map(assignment => ({
			id: assignment.schoolId,
			userId: userId,
			schoolId: assignment.schoolId,
			role: assignment.role,
			assignedBy: '',
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			school: assignment.school
		}))

		await cache.setex(cacheKey, CACHE_TTL, JSON.stringify(formattedAssignments))
		return formattedAssignments as ChapterAdminWithSchool[]
	}

	/**
	 * Check if a user has permission for a specific school
	 */
	static async hasPermission(
		userId: string,
		schoolId: string,
		requiredRole?: ChapterAdminRole
	): Promise<boolean> {
		if (!userId || !schoolId) return false

		const admin = await db.chapterAdmin.findUnique({
			where: {
				userId_schoolId: {
					userId: userId,
					schoolId: schoolId
				},
				isActive: true
			}
		})

		if (!admin) return false

		// If no specific role required, any admin role is sufficient
		if (!requiredRole) return true

		// Check role hierarchy: CHAPTER_SUPER_ADMIN > CHAPTER_ADMIN
		if (requiredRole === ChapterAdminRole.CHAPTER_ADMIN) {
			return admin.role === ChapterAdminRole.CHAPTER_ADMIN || 
				   admin.role === ChapterAdminRole.CHAPTER_SUPER_ADMIN
		}

		if (requiredRole === ChapterAdminRole.CHAPTER_SUPER_ADMIN) {
			return admin.role === ChapterAdminRole.CHAPTER_SUPER_ADMIN
		}

		return false
	}

	/**
	 * Validate that a school exists and is active
	 */
	static async validateSchoolExists(schoolId: string): Promise<boolean> {
		const school = await db.school.findUnique({
			where: { id: schoolId, isActive: true },
			select: { id: true }
		})

		return !!school
	}

	/**
	 * Get a specific admin assignment by ID
	 */
	static async getAdminById(adminId: string): Promise<ChapterAdminWithSchool | null> {
		const admin = await db.chapterAdmin.findUnique({
			where: { id: adminId },
			include: {
				school: {
					select: {
						id: true,
						name: true,
						description: true,
						location: true,
						isActive: true
					}
				}
			}
		})

		return admin as ChapterAdminWithSchool | null
	}

	/**
	 * Get all schools with their admin assignments
	 */
	static async getAllSchoolsWithAdmins(): Promise<SchoolWithAdmins[]> {
		const schools = await db.school.findMany({
			where: { isActive: true },
			include: {
				chapterAdmins: {
					where: { isActive: true },
					select: {
						id: true,
						userId: true,
						role: true,
						assignedBy: true,
						isActive: true,
						createdAt: true
					},
					orderBy: [
						{ role: 'desc' },
						{ createdAt: 'asc' }
					]
				}
			},
			orderBy: { name: 'asc' }
		})

		return schools as SchoolWithAdmins[]
	}

	/**
	 * Update admin role
	 */
	static async updateAdminRole(
		adminId: string,
		newRole: ChapterAdminRole,
		updatedBy: string
	): Promise<ChapterAdminWithSchool> {
		const admin = await db.chapterAdmin.findUnique({
			where: { id: adminId }
		})

		if (!admin) {
			throw new Error('Chapter admin assignment not found')
		}

		if (!admin.isActive) {
			throw new Error('Cannot update inactive admin assignment')
		}

		const updatedAdmin = await db.chapterAdmin.update({
			where: { id: adminId },
			data: {
				role: newRole,
				updatedAt: new Date()
			},
			include: {
				school: {
					select: {
						id: true,
						name: true,
						description: true,
						location: true,
						isActive: true
					}
				}
			}
		})

		await this.clearUserCache(admin.userId)
		await this.clearSchoolCache(admin.schoolId)

		return updatedAdmin as ChapterAdminWithSchool
	}

	/**
	 * Clear cache for a specific user
	 */
	private static async clearUserCache(userId: string): Promise<void> {
		const cacheKey = `${CACHE_KEY_PREFIX}:user:${userId}`
		await cache.del(cacheKey)
	}

	/**
	 * Clear cache for a specific school
	 */
	private static async clearSchoolCache(schoolId: string): Promise<void> {
		const cacheKey = `${CACHE_KEY_PREFIX}:school:${schoolId}`
		await cache.del(cacheKey)
	}

	/**
	 * Clear all chapter admin related cache
	 */
	static async clearAllCache(): Promise<void> {
		// Note: This is a simple implementation that clears the entire cache
		// In production, you might want to use cache patterns or tags for more efficient cache invalidation
		await cache.clear()
	}

	/**
	 * Get chapter admin statistics
	 */
	static async getAdminStats() {
		try {
			const totalAdmins = await db.chapterAdmin.count({
				where: { isActive: true }
			})

			const adminsByRole = await db.chapterAdmin.groupBy({
				by: ['role'],
				where: { isActive: true },
				_count: { role: true }
			})

			const schoolsWithAdmins = await db.school.count({
				where: {
					isActive: true,
					chapterAdmins: {
						some: { isActive: true }
					}
				}
			})

			const totalActiveSchools = await db.school.count({
				where: { isActive: true }
			})

			const stats = {
				totalAdmins,
				schoolsWithAdmins,
				totalActiveSchools,
				schoolsWithoutAdmins: totalActiveSchools - schoolsWithAdmins,
				adminsByRole: adminsByRole.reduce((acc, item) => {
					acc[item.role] = item._count.role
					return acc
				}, {} as Record<ChapterAdminRole, number>)
			}

			return stats
		} catch (error) {
			console.error('Database connection failed - unable to get chapter admin stats:', error)
			return {
				totalAdmins: -1,
				schoolsWithAdmins: -1,
				totalActiveSchools: -1,
				schoolsWithoutAdmins: -1,
				adminsByRole: {}
			}
		}
	}

	/**
	 * Ensure user exists in UserModel table by fetching from Clerk if needed
	 */
	private static async ensureUserInDatabase(userId: string): Promise<void> {
		try {
			// Check if user already exists in UserModel
			const existingUser = await db.userModel.findUnique({
				where: { userId: userId }
			})

			if (existingUser) {
				return // User already exists
			}

			// Fetch user from Clerk
			const { clerkClient } = await import('@clerk/nextjs/server')
			const clerkUser = await clerkClient.users.getUser(userId)

			if (!clerkUser) {
				throw new Error(`User ${userId} not found in Clerk`)
			}

			// Create user in UserModel table
			await db.userModel.create({
				data: {
					userId: clerkUser.id,
					name: clerkUser.firstName && clerkUser.lastName 
						? `${clerkUser.firstName} ${clerkUser.lastName}` 
						: clerkUser.username || 'Unknown User',
					email: clerkUser.emailAddresses[0]?.emailAddress || 'unknown@example.com',
					imageUrl: clerkUser.imageUrl || '',
					biog: `User profile for ${clerkUser.firstName || clerkUser.username || 'Unknown'}`
				}
			})

			console.log(`Created UserModel entry for user ${userId}`)
		} catch (error) {
			console.error(`Error ensuring user ${userId} exists in database:`, error)
			throw new Error(`Failed to ensure user exists in database: ${error}`)
		}
	}
}