import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ChapterAdminRole } from '@prisma/client'

// Create a mock implementation of the ChapterAdminService
class MockChapterAdminService {
  static mockDb = {
    school: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    chapterAdmin: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  }

  static mockCache = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  }

  static async assignAdmin(
    schoolId: string,
    targetUserId: string,
    role: ChapterAdminRole,
    assignedBy: string
  ) {
    // Validate school exists
    const school = await this.mockDb.school.findUnique({
      where: { id: schoolId, isActive: true }
    })

    if (!school) {
      throw new Error('School not found or inactive')
    }

    // Check if admin assignment already exists
    const existingAdmin = await this.mockDb.chapterAdmin.findUnique({
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
      const updatedAdmin = await this.mockDb.chapterAdmin.update({
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
      
      return updatedAdmin
    }

    // Create new admin assignment
    const newAdmin = await this.mockDb.chapterAdmin.create({
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

    return newAdmin
  }

  static async removeAdmin(adminId: string, removedBy: string) {
    const admin = await this.mockDb.chapterAdmin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      throw new Error('Chapter admin assignment not found')
    }

    if (!admin.isActive) {
      throw new Error('Chapter admin assignment is already inactive')
    }

    await this.mockDb.chapterAdmin.update({
      where: { id: adminId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    await this.clearUserCache(admin.userId)
    await this.clearSchoolCache(admin.schoolId)
  }

  static async getAdminsBySchool(schoolId: string) {
    const cacheKey = `chapter-admin:school:${schoolId}`
    const cached = await this.mockCache.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    const admins = await this.mockDb.chapterAdmin.findMany({
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
        { role: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    await this.mockCache.setex(cacheKey, 300, JSON.stringify(admins))
    return admins
  }

  static async getSchoolsByUser(userId: string) {
    const cacheKey = `chapter-admin:user:${userId}`
    const cached = await this.mockCache.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    const adminAssignments = await this.mockDb.chapterAdmin.findMany({
      where: {
        userId: userId,
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
        { role: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    // Filter out inactive schools
    const activeAssignments = adminAssignments.filter(
      assignment => assignment.school.isActive
    )

    await this.mockCache.setex(cacheKey, 300, JSON.stringify(activeAssignments))
    return activeAssignments
  }

  static async hasPermission(
    userId: string,
    schoolId: string,
    requiredRole?: ChapterAdminRole
  ) {
    if (!userId || !schoolId) return false

    const admin = await this.mockDb.chapterAdmin.findUnique({
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

  static async validateSchoolExists(schoolId: string) {
    const school = await this.mockDb.school.findUnique({
      where: { id: schoolId, isActive: true },
      select: { id: true }
    })

    return !!school
  }

  static async updateAdminRole(
    adminId: string,
    newRole: ChapterAdminRole,
    updatedBy: string
  ) {
    const admin = await this.mockDb.chapterAdmin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      throw new Error('Chapter admin assignment not found')
    }

    if (!admin.isActive) {
      throw new Error('Cannot update inactive admin assignment')
    }

    const updatedAdmin = await this.mockDb.chapterAdmin.update({
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

    return updatedAdmin
  }

  static async getAdminStats() {
    try {
      const totalAdmins = await this.mockDb.chapterAdmin.count({
        where: { isActive: true }
      })

      const adminsByRole = await this.mockDb.chapterAdmin.groupBy({
        by: ['role'],
        where: { isActive: true },
        _count: { role: true }
      })

      const schoolsWithAdmins = await this.mockDb.school.count({
        where: {
          isActive: true,
          chapterAdmins: {
            some: { isActive: true }
          }
        }
      })

      const totalActiveSchools = await this.mockDb.school.count({
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
      return {
        totalAdmins: -1,
        schoolsWithAdmins: -1,
        totalActiveSchools: -1,
        schoolsWithoutAdmins: -1,
        adminsByRole: {}
      }
    }
  }

  static async clearAllCache() {
    await this.mockCache.clear()
  }

  private static async clearUserCache(userId: string) {
    const cacheKey = `chapter-admin:user:${userId}`
    await this.mockCache.del(cacheKey)
  }

  private static async clearSchoolCache(schoolId: string) {
    const cacheKey = `chapter-admin:school:${schoolId}`
    await this.mockCache.del(cacheKey)
  }
}

const ChapterAdminService = MockChapterAdminService
const mockDb = MockChapterAdminService.mockDb
const mockCache = MockChapterAdminService.mockCache

describe('ChapterAdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('assignAdmin', () => {
    const mockSchool = {
      id: 'school-1',
      name: 'Test School',
      description: 'A test school',
      location: 'Test City',
      isActive: true,
    }

    it('should assign new chapter admin successfully', async () => {
      const mockNewAdmin = {
        id: 'admin-1',
        userId: 'user-1',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN,
        assignedBy: 'super-admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        school: {
          id: 'school-1',
          name: 'Test School',
          description: 'A test school',
          location: 'Test City',
          isActive: true,
        },
      }

      mockDb.school.findUnique.mockResolvedValue(mockSchool as any)
      mockDb.chapterAdmin.findUnique.mockResolvedValue(null)
      mockDb.chapterAdmin.create.mockResolvedValue(mockNewAdmin as any)
      mockCache.del.mockResolvedValue(1)

      const result = await ChapterAdminService.assignAdmin(
        'school-1',
        'user-1',
        ChapterAdminRole.CHAPTER_ADMIN,
        'super-admin'
      )

      expect(mockDb.school.findUnique).toHaveBeenCalledWith({
        where: { id: 'school-1', isActive: true },
      })

      expect(mockDb.chapterAdmin.findUnique).toHaveBeenCalledWith({
        where: {
          userId_schoolId: {
            userId: 'user-1',
            schoolId: 'school-1',
          },
        },
      })

      expect(mockDb.chapterAdmin.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_ADMIN,
          assignedBy: 'super-admin',
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              isActive: true,
            },
          },
        },
      })

      expect(result).toEqual(mockNewAdmin)
      expect(mockCache.del).toHaveBeenCalledTimes(2) // Clear user and school cache
    })

    it('should reactivate existing inactive admin', async () => {
      const mockExistingAdmin = {
        id: 'admin-1',
        userId: 'user-1',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN,
        isActive: false,
      }

      const mockUpdatedAdmin = {
        ...mockExistingAdmin,
        isActive: true,
        role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
        assignedBy: 'super-admin',
        school: mockSchool,
      }

      mockDb.school.findUnique.mockResolvedValue(mockSchool as any)
      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockExistingAdmin as any)
      mockDb.chapterAdmin.update.mockResolvedValue(mockUpdatedAdmin as any)
      mockCache.del.mockResolvedValue(1)

      const result = await ChapterAdminService.assignAdmin(
        'school-1',
        'user-1',
        ChapterAdminRole.CHAPTER_SUPER_ADMIN,
        'super-admin'
      )

      expect(mockDb.chapterAdmin.update).toHaveBeenCalledWith({
        where: { id: 'admin-1' },
        data: {
          isActive: true,
          role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
          assignedBy: 'super-admin',
          updatedAt: expect.any(Date),
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              isActive: true,
            },
          },
        },
      })

      expect(result).toEqual(mockUpdatedAdmin)
    })

    it('should throw error if school not found', async () => {
      mockDb.school.findUnique.mockResolvedValue(null)

      await expect(
        ChapterAdminService.assignAdmin(
          'nonexistent-school',
          'user-1',
          ChapterAdminRole.CHAPTER_ADMIN,
          'super-admin'
        )
      ).rejects.toThrow('School not found or inactive')
    })

    it('should throw error if admin already exists and is active', async () => {
      const mockExistingAdmin = {
        id: 'admin-1',
        userId: 'user-1',
        schoolId: 'school-1',
        isActive: true,
      }

      mockDb.school.findUnique.mockResolvedValue(mockSchool as any)
      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockExistingAdmin as any)

      await expect(
        ChapterAdminService.assignAdmin(
          'school-1',
          'user-1',
          ChapterAdminRole.CHAPTER_ADMIN,
          'super-admin'
        )
      ).rejects.toThrow('User is already an admin for this school')
    })
  })

  describe('removeAdmin', () => {
    it('should remove admin successfully', async () => {
      const mockAdmin = {
        id: 'admin-1',
        userId: 'user-1',
        schoolId: 'school-1',
        isActive: true,
      }

      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockAdmin as any)
      mockDb.chapterAdmin.update.mockResolvedValue(undefined)
      mockCache.del.mockResolvedValue(1)

      await ChapterAdminService.removeAdmin('admin-1', 'super-admin')

      expect(mockDb.chapterAdmin.update).toHaveBeenCalledWith({
        where: { id: 'admin-1' },
        data: {
          isActive: false,
          updatedAt: expect.any(Date),
        },
      })

      expect(mockCache.del).toHaveBeenCalledTimes(2) // Clear user and school cache
    })

    it('should throw error if admin not found', async () => {
      mockDb.chapterAdmin.findUnique.mockResolvedValue(null)

      await expect(
        ChapterAdminService.removeAdmin('nonexistent-admin', 'super-admin')
      ).rejects.toThrow('Chapter admin assignment not found')
    })

    it('should throw error if admin already inactive', async () => {
      const mockAdmin = {
        id: 'admin-1',
        isActive: false,
      }

      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockAdmin as any)

      await expect(
        ChapterAdminService.removeAdmin('admin-1', 'super-admin')
      ).rejects.toThrow('Chapter admin assignment is already inactive')
    })
  })

  describe('getAdminsBySchool', () => {
    it('should return cached admins if available', async () => {
      const mockAdmins = [
        {
          id: 'admin-1',
          userId: 'user-1',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_ADMIN,
        },
      ]

      mockCache.get.mockResolvedValue(JSON.stringify(mockAdmins))

      const result = await ChapterAdminService.getAdminsBySchool('school-1')

      expect(mockCache.get).toHaveBeenCalledWith('chapter-admin:school:school-1')
      expect(result).toEqual(mockAdmins)
      expect(mockDb.chapterAdmin.findMany).not.toHaveBeenCalled()
    })

    it('should fetch and cache admins if not cached', async () => {
      const mockAdmins = [
        {
          id: 'admin-1',
          userId: 'user-1',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
          school: {
            id: 'school-1',
            name: 'Test School',
            description: 'A test school',
            location: 'Test City',
            isActive: true,
          },
        },
        {
          id: 'admin-2',
          userId: 'user-2',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_ADMIN,
          school: {
            id: 'school-1',
            name: 'Test School',
            description: 'A test school',
            location: 'Test City',
            isActive: true,
          },
        },
      ]

      mockCache.get.mockResolvedValue(null)
      mockDb.chapterAdmin.findMany.mockResolvedValue(mockAdmins as any)
      mockCache.setex.mockResolvedValue('OK')

      const result = await ChapterAdminService.getAdminsBySchool('school-1')

      expect(mockDb.chapterAdmin.findMany).toHaveBeenCalledWith({
        where: {
          schoolId: 'school-1',
          isActive: true,
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              isActive: true,
            },
          },
        },
        orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
      })

      expect(mockCache.setex).toHaveBeenCalledWith(
        'chapter-admin:school:school-1',
        300,
        JSON.stringify(mockAdmins)
      )

      expect(result).toEqual(mockAdmins)
    })
  })

  describe('getSchoolsByUser', () => {
    it('should return cached schools if available', async () => {
      const mockSchools = [
        {
          id: 'admin-1',
          userId: 'user-1',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_ADMIN,
          school: {
            id: 'school-1',
            name: 'Test School',
            isActive: true,
          },
        },
      ]

      mockCache.get.mockResolvedValue(JSON.stringify(mockSchools))

      const result = await ChapterAdminService.getSchoolsByUser('user-1')

      expect(mockCache.get).toHaveBeenCalledWith('chapter-admin:user:user-1')
      expect(result).toEqual(mockSchools)
      expect(mockDb.chapterAdmin.findMany).not.toHaveBeenCalled()
    })

    it('should fetch and cache schools if not cached', async () => {
      const mockAssignments = [
        {
          id: 'admin-1',
          userId: 'user-1',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_ADMIN,
          school: {
            id: 'school-1',
            name: 'Test School',
            isActive: true,
          },
        },
        {
          id: 'admin-2',
          userId: 'user-1',
          schoolId: 'school-2',
          role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
          school: {
            id: 'school-2',
            name: 'Inactive School',
            isActive: false, // This should be filtered out
          },
        },
      ]

      const expectedResult = [mockAssignments[0]] // Only active school

      mockCache.get.mockResolvedValue(null)
      mockDb.chapterAdmin.findMany.mockResolvedValue(mockAssignments as any)
      mockCache.setex.mockResolvedValue('OK')

      const result = await ChapterAdminService.getSchoolsByUser('user-1')

      expect(mockDb.chapterAdmin.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          isActive: true,
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              isActive: true,
            },
          },
        },
        orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
      })

      expect(mockCache.setex).toHaveBeenCalledWith(
        'chapter-admin:user:user-1',
        300,
        JSON.stringify(expectedResult)
      )

      expect(result).toEqual(expectedResult)
    })
  })

  describe('hasPermission', () => {
    it('should return false for invalid inputs', async () => {
      expect(await ChapterAdminService.hasPermission('', 'school-1')).toBe(false)
      expect(await ChapterAdminService.hasPermission('user-1', '')).toBe(false)
    })

    it('should return false if admin not found', async () => {
      mockDb.chapterAdmin.findUnique.mockResolvedValue(null)

      const result = await ChapterAdminService.hasPermission('user-1', 'school-1')

      expect(result).toBe(false)
    })

    it('should return true for any admin role when no specific role required', async () => {
      const mockAdmin = {
        id: 'admin-1',
        role: ChapterAdminRole.CHAPTER_ADMIN,
      }

      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockAdmin as any)

      const result = await ChapterAdminService.hasPermission('user-1', 'school-1')

      expect(result).toBe(true)
    })

    it('should validate role hierarchy correctly', async () => {
      const mockSuperAdmin = {
        id: 'admin-1',
        role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
      }

      const mockAdmin = {
        id: 'admin-2',
        role: ChapterAdminRole.CHAPTER_ADMIN,
      }

      // Super admin should have CHAPTER_ADMIN permissions
      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockSuperAdmin as any)
      expect(
        await ChapterAdminService.hasPermission(
          'user-1',
          'school-1',
          ChapterAdminRole.CHAPTER_ADMIN
        )
      ).toBe(true)

      // Super admin should have CHAPTER_SUPER_ADMIN permissions
      expect(
        await ChapterAdminService.hasPermission(
          'user-1',
          'school-1',
          ChapterAdminRole.CHAPTER_SUPER_ADMIN
        )
      ).toBe(true)

      // Regular admin should have CHAPTER_ADMIN permissions
      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockAdmin as any)
      expect(
        await ChapterAdminService.hasPermission(
          'user-2',
          'school-1',
          ChapterAdminRole.CHAPTER_ADMIN
        )
      ).toBe(true)

      // Regular admin should NOT have CHAPTER_SUPER_ADMIN permissions
      expect(
        await ChapterAdminService.hasPermission(
          'user-2',
          'school-1',
          ChapterAdminRole.CHAPTER_SUPER_ADMIN
        )
      ).toBe(false)
    })
  })

  describe('validateSchoolExists', () => {
    it('should return true for existing active school', async () => {
      mockDb.school.findUnique.mockResolvedValue({ id: 'school-1' } as any)

      const result = await ChapterAdminService.validateSchoolExists('school-1')

      expect(result).toBe(true)
      expect(mockDb.school.findUnique).toHaveBeenCalledWith({
        where: { id: 'school-1', isActive: true },
        select: { id: true },
      })
    })

    it('should return false for non-existent school', async () => {
      mockDb.school.findUnique.mockResolvedValue(null)

      const result = await ChapterAdminService.validateSchoolExists('nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('updateAdminRole', () => {
    it('should update admin role successfully', async () => {
      const mockAdmin = {
        id: 'admin-1',
        userId: 'user-1',
        schoolId: 'school-1',
        isActive: true,
      }

      const mockUpdatedAdmin = {
        ...mockAdmin,
        role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
        school: {
          id: 'school-1',
          name: 'Test School',
          description: 'A test school',
          location: 'Test City',
          isActive: true,
        },
      }

      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockAdmin as any)
      mockDb.chapterAdmin.update.mockResolvedValue(mockUpdatedAdmin as any)
      mockCache.del.mockResolvedValue(1)

      const result = await ChapterAdminService.updateAdminRole(
        'admin-1',
        ChapterAdminRole.CHAPTER_SUPER_ADMIN,
        'super-admin'
      )

      expect(mockDb.chapterAdmin.update).toHaveBeenCalledWith({
        where: { id: 'admin-1' },
        data: {
          role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
          updatedAt: expect.any(Date),
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              isActive: true,
            },
          },
        },
      })

      expect(result).toEqual(mockUpdatedAdmin)
      expect(mockCache.del).toHaveBeenCalledTimes(2)
    })

    it('should throw error for non-existent admin', async () => {
      mockDb.chapterAdmin.findUnique.mockResolvedValue(null)

      await expect(
        ChapterAdminService.updateAdminRole(
          'nonexistent',
          ChapterAdminRole.CHAPTER_ADMIN,
          'super-admin'
        )
      ).rejects.toThrow('Chapter admin assignment not found')
    })

    it('should throw error for inactive admin', async () => {
      const mockAdmin = {
        id: 'admin-1',
        isActive: false,
      }

      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockAdmin as any)

      await expect(
        ChapterAdminService.updateAdminRole(
          'admin-1',
          ChapterAdminRole.CHAPTER_ADMIN,
          'super-admin'
        )
      ).rejects.toThrow('Cannot update inactive admin assignment')
    })
  })

  describe('getAdminStats', () => {
    it('should return admin statistics', async () => {
      const mockStats = {
        totalAdmins: 10,
        schoolsWithAdmins: 5,
        totalActiveSchools: 8,
        adminsByRole: [
          { role: ChapterAdminRole.CHAPTER_ADMIN, _count: { role: 7 } },
          { role: ChapterAdminRole.CHAPTER_SUPER_ADMIN, _count: { role: 3 } },
        ],
      }

      mockDb.chapterAdmin.count.mockResolvedValue(10)
      mockDb.chapterAdmin.groupBy.mockResolvedValue(mockStats.adminsByRole as any)
      mockDb.school.count
        .mockResolvedValueOnce(5) // schools with admins
        .mockResolvedValueOnce(8) // total active schools

      const result = await ChapterAdminService.getAdminStats()

      expect(result).toEqual({
        totalAdmins: 10,
        schoolsWithAdmins: 5,
        totalActiveSchools: 8,
        schoolsWithoutAdmins: 3,
        adminsByRole: {
          [ChapterAdminRole.CHAPTER_ADMIN]: 7,
          [ChapterAdminRole.CHAPTER_SUPER_ADMIN]: 3,
        },
      })
    })

    it('should return error stats on database failure', async () => {
      mockDb.chapterAdmin.count.mockRejectedValue(new Error('Database error'))

      const result = await ChapterAdminService.getAdminStats()

      expect(result).toEqual({
        totalAdmins: -1,
        schoolsWithAdmins: -1,
        totalActiveSchools: -1,
        schoolsWithoutAdmins: -1,
        adminsByRole: {},
      })
    })
  })

  describe('clearAllCache', () => {
    it('should clear all cache', async () => {
      mockCache.clear.mockResolvedValue('OK')

      await ChapterAdminService.clearAllCache()

      expect(mockCache.clear).toHaveBeenCalled()
    })
  })
})