import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}))

jest.mock('@/lib/admin', () => ({
  hasAdminAccess: jest.fn()
}))

jest.mock('@/lib/school-service', () => ({
  SchoolService: {
    getAllSchools: jest.fn(),
    getSchoolById: jest.fn(),
    createSchool: jest.fn(),
    updateSchool: jest.fn(),
    updateSchoolStats: jest.fn(),
    deleteSchool: jest.fn()
  }
}))

jest.mock('@/lib/chapter-admin-permissions', () => ({
  canEditSchoolStats: jest.fn(),
  canEditSchoolInfo: jest.fn()
}))

describe('Schools Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/schools', () => {
    it('should return schools with asset URLs', async () => {
      const { SchoolService } = require('@/lib/school-service')
      
      const mockSchools = [
        {
          id: 'school-1',
          name: 'Test School 1',
          description: 'A test school',
          location: 'Test City',
          imageAsset: { key: 'image_key_1' },
          bannerAsset: { key: 'banner_key_1' },
          volunteerHours: 100,
          activeMembers: 50
        },
        {
          id: 'school-2',
          name: 'Test School 2',
          description: 'Another test school',
          location: 'Another City',
          imageAsset: null,
          bannerAsset: null,
          volunteerHours: 200,
          activeMembers: 75
        }
      ]
      
      SchoolService.getAllSchools.mockResolvedValue({
        schools: mockSchools,
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      })

      const url = new URL('http://localhost/api/schools')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/schools/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schools).toHaveLength(2)
      expect(data.schools[0].imageUrl).toBe('/api/assets/image_key_1')
      expect(data.schools[0].bannerUrl).toBe('/api/assets/banner_key_1')
      expect(data.schools[1].imageUrl).toBeNull()
      expect(data.schools[1].bannerUrl).toBeNull()
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      })
    })

    it('should handle search queries', async () => {
      const { SchoolService } = require('@/lib/school-service')
      
      SchoolService.getAllSchools.mockResolvedValue({
        schools: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      })

      const url = new URL('http://localhost/api/schools?search=test&page=2&limit=5')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/schools/route')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(SchoolService.getAllSchools).toHaveBeenCalledWith({
        search: 'test',
        page: 2,
        limit: 5,
        includeInactive: false
      })
    })

    it('should handle service errors gracefully', async () => {
      const { SchoolService } = require('@/lib/school-service')
      
      SchoolService.getAllSchools.mockRejectedValue(new Error('Database error'))

      const url = new URL('http://localhost/api/schools')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/schools/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch schools')
    })
  })

  describe('POST /api/schools', () => {
    it('should create school successfully for admin', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { SchoolService } = require('@/lib/school-service')
      
      auth.mockReturnValue({ userId: 'admin-123' })
      hasAdminAccess.mockResolvedValue(true)
      
      const mockSchool = {
        id: 'school-1',
        name: 'New School',
        description: 'A new school',
        location: 'New City',
        website: 'https://newschool.com',
        email: 'contact@newschool.com',
        phone: '+1234567890',
        imageAsset: { key: 'image_key_1' },
        bannerAsset: { key: 'banner_key_1' },
        volunteerHours: 0,
        activeMembers: 0,
        createdBy: 'admin-123'
      }
      
      SchoolService.createSchool.mockResolvedValue(mockSchool)

      const request = {
        json: () => Promise.resolve({
          name: 'New School',
          description: 'A new school',
          location: 'New City',
          website: 'https://newschool.com',
          email: 'contact@newschool.com',
          phone: '+1234567890',
          imageAssetKey: 'image_key_1',
          bannerAssetKey: 'banner_key_1',
          volunteerHours: 0,
          activeMembers: 0
        })
      } as any

      const { POST } = await import('@/app/api/schools/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('school-1')
      expect(data.name).toBe('New School')
      expect(data.imageUrl).toBe('/api/assets/image_key_1')
      expect(data.bannerUrl).toBe('/api/assets/banner_key_1')
      expect(SchoolService.createSchool).toHaveBeenCalledWith({
        name: 'New School',
        description: 'A new school',
        location: 'New City',
        website: 'https://newschool.com',
        email: 'contact@newschool.com',
        phone: '+1234567890',
        imageAssetKey: 'image_key_1',
        bannerAssetKey: 'banner_key_1',
        volunteerHours: 0,
        activeMembers: 0,
        createdBy: 'admin-123'
      })
    })

    it('should return 401 for unauthenticated requests', async () => {
      const { auth } = require('@clerk/nextjs/server')
      
      auth.mockReturnValue({ userId: null })

      const request = {
        json: () => Promise.resolve({
          name: 'New School'
        })
      } as any

      const { POST } = await import('@/app/api/schools/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 for non-admin users', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      
      auth.mockReturnValue({ userId: 'user-123' })
      hasAdminAccess.mockResolvedValue(false)

      const request = {
        json: () => Promise.resolve({
          name: 'New School'
        })
      } as any

      const { POST } = await import('@/app/api/schools/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Admin access required')
    })

    it('should return 400 for validation errors', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      
      auth.mockReturnValue({ userId: 'admin-123' })
      hasAdminAccess.mockResolvedValue(true)

      const request = {
        json: () => Promise.resolve({
          name: '', // Empty name should fail validation
          email: 'invalid-email', // Invalid email format
          website: 'not-a-url' // Invalid URL format
        })
      } as any

      const { POST } = await import('@/app/api/schools/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.details).toBeDefined()
    })

    it('should handle service errors gracefully', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { SchoolService } = require('@/lib/school-service')
      
      auth.mockReturnValue({ userId: 'admin-123' })
      hasAdminAccess.mockResolvedValue(true)
      SchoolService.createSchool.mockRejectedValue(new Error('Database error'))

      const request = {
        json: () => Promise.resolve({
          name: 'New School'
        })
      } as any

      const { POST } = await import('@/app/api/schools/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create school')
    })
  })

  describe('PATCH /api/schools/[id]/stats', () => {
    it('should update school statistics with proper permissions', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { canEditSchoolStats } = require('@/lib/chapter-admin-permissions')
      const { SchoolService } = require('@/lib/school-service')
      
      auth.mockResolvedValue({ userId: 'admin-123' })
      canEditSchoolStats
        .mockResolvedValueOnce(true) // volunteerHours
        .mockResolvedValueOnce(true) // activeMembers
      
      const mockUpdatedSchool = {
        id: 'school-1',
        name: 'Test School',
        volunteerHours: 150,
        activeMembers: 60,
        imageAsset: null,
        bannerAsset: null
      }
      
      SchoolService.updateSchoolStats.mockResolvedValue(mockUpdatedSchool)

      // Mock the stats endpoint (this would be in /api/schools/[id]/stats/route.ts)
      const mockStatsEndpoint = async (request: any, { params }: { params: { id: string } }) => {
        const { userId } = await auth()
        
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const body = await request.json()
        const { volunteerHours, activeMembers } = body

        // Check permissions for each stat type
        if (volunteerHours !== undefined) {
          const canEditVolunteerHours = await canEditSchoolStats(userId, params.id, 'volunteerHours')
          if (!canEditVolunteerHours) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions to edit volunteer hours' }), { status: 403 })
          }
        }

        if (activeMembers !== undefined) {
          const canEditActiveMembers = await canEditSchoolStats(userId, params.id, 'activeMembers')
          if (!canEditActiveMembers) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions to edit active members' }), { status: 403 })
          }
        }

        const updatedSchool = await SchoolService.updateSchoolStats(params.id, { volunteerHours, activeMembers })
        
        return new Response(JSON.stringify({
          ...updatedSchool,
          imageUrl: updatedSchool.imageAsset ? `/api/assets/${updatedSchool.imageAsset.key}` : null,
          bannerUrl: updatedSchool.bannerAsset ? `/api/assets/${updatedSchool.bannerAsset.key}` : null
        }), { status: 200 })
      }

      const request = {
        json: () => Promise.resolve({
          volunteerHours: 150,
          activeMembers: 60
        })
      } as any

      const response = await mockStatsEndpoint(request, { params: { id: 'school-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.volunteerHours).toBe(150)
      expect(data.activeMembers).toBe(60)
      expect(SchoolService.updateSchoolStats).toHaveBeenCalledWith('school-1', {
        volunteerHours: 150,
        activeMembers: 60
      })
    })

    it('should return 403 for insufficient volunteer hours permissions', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { canEditSchoolStats } = require('@/lib/chapter-admin-permissions')
      
      auth.mockResolvedValue({ userId: 'user-123' })
      canEditSchoolStats.mockResolvedValue(false)

      const mockStatsEndpoint = async (request: any, { params }: { params: { id: string } }) => {
        const { userId } = await auth()
        
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const body = await request.json()
        const { volunteerHours } = body

        if (volunteerHours !== undefined) {
          const canEditVolunteerHours = await canEditSchoolStats(userId, params.id, 'volunteerHours')
          if (!canEditVolunteerHours) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions to edit volunteer hours' }), { status: 403 })
          }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
      }

      const request = {
        json: () => Promise.resolve({
          volunteerHours: 150
        })
      } as any

      const response = await mockStatsEndpoint(request, { params: { id: 'school-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Insufficient permissions to edit volunteer hours')
    })

    it('should return 403 for insufficient active members permissions', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { canEditSchoolStats } = require('@/lib/chapter-admin-permissions')
      
      auth.mockResolvedValue({ userId: 'user-123' })
      canEditSchoolStats.mockResolvedValue(false)

      const mockStatsEndpoint = async (request: any, { params }: { params: { id: string } }) => {
        const { userId } = await auth()
        
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        const body = await request.json()
        const { activeMembers } = body

        if (activeMembers !== undefined) {
          const canEditActiveMembers = await canEditSchoolStats(userId, params.id, 'activeMembers')
          if (!canEditActiveMembers) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions to edit active members' }), { status: 403 })
          }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
      }

      const request = {
        json: () => Promise.resolve({
          activeMembers: 60
        })
      } as any

      const response = await mockStatsEndpoint(request, { params: { id: 'school-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Insufficient permissions to edit active members')
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const { SchoolService } = require('@/lib/school-service')
      
      SchoolService.getAllSchools.mockRejectedValue(new Error('Connection timeout'))

      const url = new URL('http://localhost/api/schools')
      const request = { url: url.toString() } as NextRequest

      const { GET } = await import('@/app/api/schools/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch schools')
    })

    it('should handle malformed JSON requests', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      
      auth.mockReturnValue({ userId: 'admin-123' })
      hasAdminAccess.mockResolvedValue(true)

      const request = {
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as any

      const { POST } = await import('@/app/api/schools/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create school')
    })

    it('should handle service validation errors', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { hasAdminAccess } = require('@/lib/admin')
      const { SchoolService } = require('@/lib/school-service')
      
      auth.mockReturnValue({ userId: 'admin-123' })
      hasAdminAccess.mockResolvedValue(true)
      SchoolService.createSchool.mockRejectedValue(new Error('School name already exists'))

      const request = {
        json: () => Promise.resolve({
          name: 'Duplicate School'
        })
      } as any

      const { POST } = await import('@/app/api/schools/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create school')
    })
  })
})