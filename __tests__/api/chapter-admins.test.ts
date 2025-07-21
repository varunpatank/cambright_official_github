import { NextRequest } from 'next/server'
import { ChapterAdminRole } from '@prisma/client'

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}))

jest.mock('@/lib/admin', () => ({
  hasAdminAccess: jest.fn()
}))

jest.mock('@/lib/chapter-admin-service', () => ({
  ChapterAdminService: {
    getAdminsBySchool: jest.fn(),
    getSchoolsByUser: jest.fn(),
    getAllSchoolsWithAdmins: jest.fn(),
    assignAdmin: jest.fn(),
    removeAdmin: jest.fn(),
    getAdminById: jest.fn(),
    hasPermission: jest.fn(),
    validateSchoolExists: jest.fn()
  }
}))

describe('Chapter Admins API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/chapter-admins', () => {
    it('should get admins by school for system admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      hasAdminAccess.mockReturnValue(true)
      
      const mockAdmins = [
        {
          id: 'admin-1',
          userId: 'user-1',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_ADMIN,
          school: { id: 'school-1', name: 'Test School' }
        }
      ]
      
      ChapterAdminService.getAdminsBySchool.mockResolvedValue(mockAdmins)

      const url = new URL('http://localhost/api/chapter-admins?schoolId=school-1')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/chapter-admins/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.admins).toEqual(mockAdmins)
      expect(ChapterAdminService.getAdminsBySchool).toHaveBeenCalledWith('school-1')
    })

    it('should get schools by user for authenticated user', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'user-123' })
      hasAdminAccess.mockReturnValue(false)
      
      const mockAssignments = [
        {
          id: 'admin-1',
          userId: 'user-123',
          schoolId: 'school-1',
          role: ChapterAdminRole.CHAPTER_ADMIN,
          school: { id: 'school-1', name: 'Test School' }
        }
      ]
      
      ChapterAdminService.getSchoolsByUser.mockResolvedValue(mockAssignments)

      const url = new URL('http://localhost/api/chapter-admins?userId=user-123')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/chapter-admins/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.admins).toEqual(mockAssignments)
      expect(ChapterAdminService.getSchoolsByUser).toHaveBeenCalledWith('user-123')
    })

    it('should return 403 when non-admin tries to query other users', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      
      auth.mockResolvedValue({ userId: 'user-123' })
      hasAdminAccess.mockReturnValue(false)

      const url = new URL('http://localhost/api/chapter-admins?userId=other-user')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/chapter-admins/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should get all schools with admins for system admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      hasAdminAccess.mockReturnValue(true)
      
      const mockSchools = [
        {
          id: 'school-1',
          name: 'Test School',
          chapterAdmins: [
            { id: 'admin-1', userId: 'user-1', role: ChapterAdminRole.CHAPTER_ADMIN }
          ]
        }
      ]
      
      ChapterAdminService.getAllSchoolsWithAdmins.mockResolvedValue(mockSchools)

      const url = new URL('http://localhost/api/chapter-admins')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/chapter-admins/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schools).toEqual(mockSchools)
      expect(ChapterAdminService.getAllSchoolsWithAdmins).toHaveBeenCalled()
    })

    it('should return 401 for unauthenticated requests', async () => {
      const { auth } = require('@clerk/nextjs/server')
      
      auth.mockResolvedValue({ userId: null })

      const url = new URL('http://localhost/api/chapter-admins')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/chapter-admins/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('POST /api/chapter-admins', () => {
    it('should assign chapter admin successfully by system admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      hasAdminAccess.mockReturnValue(true)
      ChapterAdminService.hasPermission.mockResolvedValue(false)
      ChapterAdminService.validateSchoolExists.mockResolvedValue(true)
      
      const mockAdmin = {
        id: 'admin-1',
        userId: 'user-123',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN,
        assignedBy: 'admin-123',
        isActive: true,
        createdAt: new Date(),
        school: { id: 'school-1', name: 'Test School' }
      }
      
      ChapterAdminService.assignAdmin.mockResolvedValue(mockAdmin)

      const request = {
        json: () => Promise.resolve({
          schoolId: 'school-1',
          targetUserId: 'user-123',
          role: 'CHAPTER_ADMIN'
        })
      } as any

      const { POST } = await import('@/app/api/chapter-admins/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.admin.id).toBe('admin-1')
      expect(ChapterAdminService.assignAdmin).toHaveBeenCalledWith(
        'school-1',
        'user-123',
        'CHAPTER_ADMIN',
        'admin-123'
      )
    })

    it('should assign chapter admin by chapter super admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'super-admin-123' })
      hasAdminAccess.mockReturnValue(false)
      ChapterAdminService.hasPermission.mockResolvedValue(true)
      ChapterAdminService.validateSchoolExists.mockResolvedValue(true)
      
      const mockAdmin = {
        id: 'admin-1',
        userId: 'user-123',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN,
        assignedBy: 'super-admin-123',
        isActive: true,
        createdAt: new Date(),
        school: { id: 'school-1', name: 'Test School' }
      }
      
      ChapterAdminService.assignAdmin.mockResolvedValue(mockAdmin)

      const request = {
        json: () => Promise.resolve({
          schoolId: 'school-1',
          targetUserId: 'user-123',
          role: 'CHAPTER_ADMIN'
        })
      } as any

      const { POST } = await import('@/app/api/chapter-admins/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.admin.id).toBe('admin-1')
    })

    it('should prevent non-system admin from assigning chapter super admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'super-admin-123' })
      hasAdminAccess.mockReturnValue(false)
      ChapterAdminService.hasPermission.mockResolvedValue(true)
      ChapterAdminService.validateSchoolExists.mockResolvedValue(true)

      const request = {
        json: () => Promise.resolve({
          schoolId: 'school-1',
          targetUserId: 'user-123',
          role: 'CHAPTER_SUPER_ADMIN'
        })
      } as any

      const { POST } = await import('@/app/api/chapter-admins/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Only system administrators can assign chapter super admin role')
    })

    it('should return 403 for insufficient permissions', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'user-123' })
      hasAdminAccess.mockReturnValue(false)
      ChapterAdminService.hasPermission.mockResolvedValue(false)

      const request = {
        json: () => Promise.resolve({
          schoolId: 'school-1',
          targetUserId: 'user-456',
          role: 'CHAPTER_ADMIN'
        })
      } as any

      const { POST } = await import('@/app/api/chapter-admins/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Insufficient permissions')
    })

    it('should return 404 for non-existent school', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      hasAdminAccess.mockReturnValue(true)
      ChapterAdminService.hasPermission.mockResolvedValue(false)
      ChapterAdminService.validateSchoolExists.mockResolvedValue(false)

      const request = {
        json: () => Promise.resolve({
          schoolId: 'nonexistent-school',
          targetUserId: 'user-123',
          role: 'CHAPTER_ADMIN'
        })
      } as any

      const { POST } = await import('@/app/api/chapter-admins/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('School not found or inactive')
    })

    it('should return 400 for validation errors', async () => {
      const { auth } = require('@clerk/nextjs/server')
      
      auth.mockResolvedValue({ userId: 'admin-123' })

      const request = {
        json: () => Promise.resolve({
          schoolId: 'invalid-uuid',
          targetUserId: '',
          role: 'INVALID_ROLE'
        })
      } as any

      const { POST } = await import('@/app/api/chapter-admins/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.details).toBeDefined()
    })

    it('should handle service errors gracefully', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      hasAdminAccess.mockReturnValue(true)
      ChapterAdminService.hasPermission.mockResolvedValue(false)
      ChapterAdminService.validateSchoolExists.mockResolvedValue(true)
      ChapterAdminService.assignAdmin.mockRejectedValue(new Error('User is already an admin for this school'))

      const request = {
        json: () => Promise.resolve({
          schoolId: 'school-1',
          targetUserId: 'user-123',
          role: 'CHAPTER_ADMIN'
        })
      } as any

      const { POST } = await import('@/app/api/chapter-admins/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User is already an admin for this school')
    })
  })

  describe('DELETE /api/chapter-admins', () => {
    it('should remove admin successfully by system admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      hasAdminAccess.mockReturnValue(true)
      
      const mockAdmin = {
        id: 'admin-1',
        userId: 'user-123',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN
      }
      
      ChapterAdminService.getAdminById.mockResolvedValue(mockAdmin)
      ChapterAdminService.hasPermission.mockResolvedValue(false)
      ChapterAdminService.removeAdmin.mockResolvedValue(undefined)

      const url = new URL('http://localhost/api/chapter-admins?adminId=admin-1')
      const request = { url: url.toString() } as NextRequest

      const { DELETE } = await import('@/app/api/chapter-admins/route')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Chapter admin assignment removed successfully')
      expect(ChapterAdminService.removeAdmin).toHaveBeenCalledWith('admin-1', 'admin-123')
    })

    it('should remove admin successfully by chapter super admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'super-admin-123' })
      hasAdminAccess.mockReturnValue(false)
      
      const mockAdmin = {
        id: 'admin-1',
        userId: 'user-123',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN
      }
      
      ChapterAdminService.getAdminById.mockResolvedValue(mockAdmin)
      ChapterAdminService.hasPermission.mockResolvedValue(true)
      ChapterAdminService.removeAdmin.mockResolvedValue(undefined)

      const url = new URL('http://localhost/api/chapter-admins?adminId=admin-1')
      const request = { url: url.toString() } as NextRequest

      const { DELETE } = await import('@/app/api/chapter-admins/route')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should return 400 for missing adminId', async () => {
      const { auth } = require('@clerk/nextjs/server')
      
      auth.mockResolvedValue({ userId: 'admin-123' })

      const url = new URL('http://localhost/api/chapter-admins')
      const request = { url: url.toString() } as NextRequest

      const { DELETE } = await import('@/app/api/chapter-admins/route')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required parameter: adminId')
    })

    it('should return 404 for non-existent admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      hasAdminAccess.mockReturnValue(true)
      ChapterAdminService.getAdminById.mockResolvedValue(null)

      const url = new URL('http://localhost/api/chapter-admins?adminId=nonexistent')
      const request = { url: url.toString() } as NextRequest

      const { DELETE } = await import('@/app/api/chapter-admins/route')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Chapter admin assignment not found')
    })

    it('should return 403 for insufficient permissions', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'user-123' })
      hasAdminAccess.mockReturnValue(false)
      
      const mockAdmin = {
        id: 'admin-1',
        userId: 'user-456',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN
      }
      
      ChapterAdminService.getAdminById.mockResolvedValue(mockAdmin)
      ChapterAdminService.hasPermission.mockResolvedValue(false)

      const url = new URL('http://localhost/api/chapter-admins?adminId=admin-1')
      const request = { url: url.toString() } as NextRequest

      const { DELETE } = await import('@/app/api/chapter-admins/route')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Insufficient permissions')
    })
  })

  describe('DELETE /api/chapter-admins/[id]', () => {
    it('should remove admin by ID successfully', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { ChapterAdminService } = require('@/lib/chapter-admin-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      hasAdminAccess.mockReturnValue(true)
      
      const mockAdmin = {
        id: 'admin-1',
        userId: 'user-123',
        schoolId: 'school-1',
        role: ChapterAdminRole.CHAPTER_ADMIN
      }
      
      ChapterAdminService.getAdminById.mockResolvedValue(mockAdmin)
      ChapterAdminService.hasPermission.mockResolvedValue(false)
      ChapterAdminService.removeAdmin.mockResolvedValue(undefined)

      const { DELETE } = await import('@/app/api/chapter-admins/[id]/route')
      const response = await DELETE({} as NextRequest, { params: { id: 'admin-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Chapter admin assignment removed successfully')
      expect(ChapterAdminService.removeAdmin).toHaveBeenCalledWith('admin-1', 'admin-123')
    })

    it('should return 400 for missing admin ID', async () => {
      const { auth } = require('@clerk/nextjs/server')
      
      auth.mockResolvedValue({ userId: 'admin-123' })

      const { DELETE } = await import('@/app/api/chapter-admins/[id]/route')
      const response = await DELETE({} as NextRequest, { params: { id: '' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Admin ID is required')
    })
  })
})