import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  getUserRoleForSchool,
  hasChapterAdminAccess,
  canAssignRole,
  canRemoveAdmin,
  canEditSchoolStats,
  canCreateSchoolPost,
  canDeleteSchoolPost,
  canAccessSchoolAdminPanel,
  canEditSchoolInfo,
  getUserAdminSchools,
  requireChapterAdminAccess,
  requireSystemAdmin,
  getUserPermissionSummary,
  CHAPTER_ADMIN_PERMISSIONS,
} from '@/lib/chapter-admin-permissions'
import { ChapterAdminRole } from '@prisma/client'
import { ChapterAdminService } from '@/lib/chapter-admin-service'
import { hasAdminAccess } from '@/lib/admin'

// Create mock implementations
const mockChapterAdminService = {
  hasPermission: jest.fn(),
  getAdminById: jest.fn(),
  getSchoolsByUser: jest.fn(),
}

const mockHasAdminAccess = jest.fn()

// Mock dependencies
jest.mock('@/lib/chapter-admin-service', () => ({
  ChapterAdminService: mockChapterAdminService,
}))

jest.mock('@/lib/admin', () => ({
  hasAdminAccess: mockHasAdminAccess,
}))

describe('ChapterAdminPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserRoleForSchool', () => {
    it('should return SYSTEM_ADMIN for system admin users', async () => {
      mockHasAdminAccess.mockReturnValue(true)

      const result = await getUserRoleForSchool('system-admin-user', 'school-1')

      expect(result).toBe('SYSTEM_ADMIN')
      expect(mockHasAdminAccess).toHaveBeenCalledWith('system-admin-user')
    })

    it('should return USER when no school specified', async () => {
      mockHasAdminAccess.mockReturnValue(false)

      const result = await getUserRoleForSchool('regular-user')

      expect(result).toBe('USER')
    })

    it('should return CHAPTER_SUPER_ADMIN for chapter super admin', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(true) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(false) // CHAPTER_ADMIN check (not called)

      const result = await getUserRoleForSchool('chapter-super-admin', 'school-1')

      expect(result).toBe('CHAPTER_SUPER_ADMIN')
      expect(mockChapterAdminService.hasPermission).toHaveBeenCalledWith(
        'chapter-super-admin',
        'school-1',
        ChapterAdminRole.CHAPTER_SUPER_ADMIN
      )
    })

    it('should return CHAPTER_ADMIN for chapter admin', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(true) // CHAPTER_ADMIN check

      const result = await getUserRoleForSchool('chapter-admin', 'school-1')

      expect(result).toBe('CHAPTER_ADMIN')
      expect(mockChapterAdminService.hasPermission).toHaveBeenCalledWith(
        'chapter-admin',
        'school-1',
        ChapterAdminRole.CHAPTER_ADMIN
      )
    })

    it('should return USER for regular users', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(false) // CHAPTER_ADMIN check

      const result = await getUserRoleForSchool('regular-user', 'school-1')

      expect(result).toBe('USER')
    })
  })

  describe('hasChapterAdminAccess', () => {
    it('should return false for empty userId', async () => {
      const result = await hasChapterAdminAccess('', 'CREATE_SCHOOLS')

      expect(result).toBe(false)
    })

    it('should return true when user has required role', async () => {
      mockHasAdminAccess.mockReturnValue(true) // System admin

      const result = await hasChapterAdminAccess('system-admin', 'CREATE_SCHOOLS', 'school-1')

      expect(result).toBe(true)
    })

    it('should return false when user lacks required role', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(true) // CHAPTER_ADMIN check

      const result = await hasChapterAdminAccess('chapter-admin', 'CREATE_SCHOOLS', 'school-1')

      expect(result).toBe(false) // CREATE_SCHOOLS requires SYSTEM_ADMIN
    })

    it('should check permissions correctly for different roles', async () => {
      // Test CHAPTER_ADMIN permission
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(true) // CHAPTER_ADMIN check

      const result = await hasChapterAdminAccess('chapter-admin', 'EDIT_ACTIVE_MEMBERS', 'school-1')

      expect(result).toBe(true) // EDIT_ACTIVE_MEMBERS allows CHAPTER_ADMIN
    })
  })

  describe('canAssignRole', () => {
    it('should return false for invalid inputs', async () => {
      expect(await canAssignRole('', ChapterAdminRole.CHAPTER_ADMIN, 'school-1')).toBe(false)
      expect(await canAssignRole('user-1', ChapterAdminRole.CHAPTER_ADMIN, '')).toBe(false)
    })

    it('should allow system admin to assign CHAPTER_SUPER_ADMIN', async () => {
      mockHasAdminAccess.mockReturnValue(true)

      const result = await canAssignRole('system-admin', ChapterAdminRole.CHAPTER_SUPER_ADMIN, 'school-1')

      expect(result).toBe(true)
    })

    it('should not allow chapter super admin to assign CHAPTER_SUPER_ADMIN', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission.mockResolvedValue(true)

      const result = await canAssignRole('chapter-super-admin', ChapterAdminRole.CHAPTER_SUPER_ADMIN, 'school-1')

      expect(result).toBe(false)
    })

    it('should allow chapter super admin to assign CHAPTER_ADMIN', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(true) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(false) // CHAPTER_ADMIN check (not called)

      const result = await canAssignRole('chapter-super-admin', ChapterAdminRole.CHAPTER_ADMIN, 'school-1')

      expect(result).toBe(true)
    })

    it('should not allow regular chapter admin to assign roles', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(true) // CHAPTER_ADMIN check

      const result = await canAssignRole('chapter-admin', ChapterAdminRole.CHAPTER_ADMIN, 'school-1')

      expect(result).toBe(false)
    })
  })

  describe('canRemoveAdmin', () => {
    it('should return false for invalid inputs', async () => {
      expect(await canRemoveAdmin('', 'admin-1')).toBe(false)
      expect(await canRemoveAdmin('user-1', '')).toBe(false)
    })

    it('should return false if target admin not found', async () => {
      mockChapterAdminService.getAdminById.mockResolvedValue(null)

      const result = await canRemoveAdmin('user-1', 'nonexistent-admin')

      expect(result).toBe(false)
    })

    it('should allow system admin to remove anyone', async () => {
      const mockTargetAdmin = {
        id: 'admin-1',
        userId: 'target-user',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
        assignedBy: 'system-admin',
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

      mockChapterAdminService.getAdminById.mockResolvedValue(mockTargetAdmin)
      mockHasAdminAccess.mockReturnValue(true)

      const result = await canRemoveAdmin('system-admin', 'admin-1')

      expect(result).toBe(true)
    })

    it('should allow chapter super admin to remove chapter admin', async () => {
      const mockTargetAdmin = {
        id: 'admin-1',
        userId: 'target-user',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN,
        assignedBy: 'chapter-super-admin',
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

      mockChapterAdminService.getAdminById.mockResolvedValue(mockTargetAdmin)
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(true) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(false) // CHAPTER_ADMIN check (not called)

      const result = await canRemoveAdmin('chapter-super-admin', 'admin-1')

      expect(result).toBe(true)
    })

    it('should not allow chapter super admin to remove another chapter super admin', async () => {
      const mockTargetAdmin = {
        id: 'admin-1',
        userId: 'target-user',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
        assignedBy: 'system-admin',
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

      mockChapterAdminService.getAdminById.mockResolvedValue(mockTargetAdmin)
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(true) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(false) // CHAPTER_ADMIN check (not called)

      const result = await canRemoveAdmin('chapter-super-admin', 'admin-1')

      expect(result).toBe(false)
    })
  })

  describe('canEditSchoolStats', () => {
    it('should return false for invalid inputs', async () => {
      expect(await canEditSchoolStats('', 'school-1', 'volunteerHours')).toBe(false)
      expect(await canEditSchoolStats('user-1', '', 'volunteerHours')).toBe(false)
    })

    it('should check volunteer hours permission correctly', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(true) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(false) // CHAPTER_ADMIN check (not called)

      const result = await canEditSchoolStats('chapter-super-admin', 'school-1', 'volunteerHours')

      expect(result).toBe(true)
    })

    it('should check active members permission correctly', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(true) // CHAPTER_ADMIN check

      const result = await canEditSchoolStats('chapter-admin', 'school-1', 'activeMembers')

      expect(result).toBe(true)
    })
  })

  describe('canCreateSchoolPost', () => {
    it('should check post creation permission', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(true) // CHAPTER_ADMIN check

      const result = await canCreateSchoolPost('chapter-admin', 'school-1')

      expect(result).toBe(true)
    })
  })

  describe('canDeleteSchoolPost', () => {
    it('should check post deletion permission', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(true) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(false) // CHAPTER_ADMIN check (not called)

      const result = await canDeleteSchoolPost('chapter-super-admin', 'school-1')

      expect(result).toBe(true)
    })

    it('should deny post deletion for regular chapter admin', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(true) // CHAPTER_ADMIN check

      const result = await canDeleteSchoolPost('chapter-admin', 'school-1')

      expect(result).toBe(false)
    })
  })

  describe('getUserAdminSchools', () => {
    it('should return empty array for empty userId', async () => {
      const result = await getUserAdminSchools('')

      expect(result).toEqual([])
    })

    it('should return empty array for system admin', async () => {
      mockHasAdminAccess.mockReturnValue(true)

      const result = await getUserAdminSchools('system-admin')

      expect(result).toEqual([])
    })

    it('should return schools with permissions for chapter admin', async () => {
      const mockAssignments = [
        {
          id: 'admin-1',
          userId: 'user-1',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
          assignedBy: 'system-admin',
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
        },
        {
          id: 'admin-2',
          userId: 'user-1',
          schoolId: 'school-2',
          role: ChapterAdminRole.CHAPTER_ADMIN,
          assignedBy: 'chapter-super-admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          school: {
            id: 'school-2',
            name: 'Another School',
            description: 'Another test school',
            location: 'Another City',
            isActive: true,
          },
        },
      ]

      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.getSchoolsByUser.mockResolvedValue(mockAssignments)

      const result = await getUserAdminSchools('user-1')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        schoolId: 'school-1',
        role: 'CHAPTER_SUPER_ADMIN',
        permissions: expect.arrayContaining([
          'ASSIGN_CHAPTER_ADMIN',
          'REMOVE_CHAPTER_ADMIN',
          'EDIT_VOLUNTEER_HOURS',
          'EDIT_ACTIVE_MEMBERS',
          'CREATE_SCHOOL_POSTS',
          'DELETE_SCHOOL_POSTS',
          'EDIT_SCHOOL_INFO',
          'VIEW_SCHOOL_ADMIN_PANEL',
        ]),
      })
      expect(result[1]).toEqual({
        schoolId: 'school-2',
        role: 'CHAPTER_ADMIN',
        permissions: expect.arrayContaining([
          'EDIT_ACTIVE_MEMBERS',
          'CREATE_SCHOOL_POSTS',
          'VIEW_SCHOOL_ADMIN_PANEL',
        ]),
      })
    })
  })

  describe('requireChapterAdminAccess', () => {
    it('should not throw for users with access', async () => {
      mockHasAdminAccess.mockReturnValue(true)

      await expect(
        requireChapterAdminAccess('system-admin', 'CREATE_SCHOOLS', 'school-1')
      ).resolves.not.toThrow()
    })

    it('should throw for users without access', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValueOnce(false) // CHAPTER_SUPER_ADMIN check
        .mockResolvedValueOnce(true) // CHAPTER_ADMIN check

      await expect(
        requireChapterAdminAccess('chapter-admin', 'CREATE_SCHOOLS', 'school-1')
      ).rejects.toThrow('Access denied. Required role: SYSTEM_ADMIN')
    })
  })

  describe('requireSystemAdmin', () => {
    it('should not throw for system admin', () => {
      mockHasAdminAccess.mockReturnValue(true)

      expect(() => requireSystemAdmin('system-admin')).not.toThrow()
    })

    it('should throw for non-system admin', () => {
      mockHasAdminAccess.mockReturnValue(false)

      expect(() => requireSystemAdmin('regular-user')).toThrow(
        'System administrator access required'
      )
    })
  })

  describe('getUserPermissionSummary', () => {
    it('should return comprehensive permission summary', async () => {
      mockHasAdminAccess.mockReturnValue(false)
      mockChapterAdminService.hasPermission
        .mockResolvedValue(true) // All permission checks return true for simplicity

      const result = await getUserPermissionSummary('chapter-super-admin', 'school-1')

      expect(result).toEqual({
        userId: 'chapter-super-admin',
        schoolId: 'school-1',
        role: 'CHAPTER_SUPER_ADMIN',
        permissions: expect.arrayContaining([
          'ASSIGN_CHAPTER_ADMIN',
          'REMOVE_CHAPTER_ADMIN',
          'EDIT_VOLUNTEER_HOURS',
          'EDIT_ACTIVE_MEMBERS',
          'CREATE_SCHOOL_POSTS',
          'DELETE_SCHOOL_POSTS',
          'EDIT_SCHOOL_INFO',
          'VIEW_SCHOOL_ADMIN_PANEL',
        ]),
        canAssignChapterAdmin: true,
        canAssignChapterSuperAdmin: false, // Only system admin can assign super admin
        canEditVolunteerHours: true,
        canEditActiveMembers: true,
        canCreatePosts: true,
        canDeletePosts: true,
        canEditSchoolInfo: true,
      })
    })
  })

  describe('CHAPTER_ADMIN_PERMISSIONS', () => {
    it('should have correct permission matrix', () => {
      expect(CHAPTER_ADMIN_PERMISSIONS.CREATE_SCHOOLS).toEqual(['SYSTEM_ADMIN'])
      expect(CHAPTER_ADMIN_PERMISSIONS.ASSIGN_CHAPTER_ADMIN).toEqual(['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN'])
      expect(CHAPTER_ADMIN_PERMISSIONS.EDIT_ACTIVE_MEMBERS).toEqual(['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN', 'CHAPTER_ADMIN'])
      expect(CHAPTER_ADMIN_PERMISSIONS.CREATE_SCHOOL_POSTS).toEqual(['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN', 'CHAPTER_ADMIN'])
    })
  })
})