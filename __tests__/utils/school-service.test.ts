import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { SchoolService } from '@/lib/school-service'
import { db } from '@/lib/db'

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    school: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

const mockDb = db as jest.Mocked<typeof db>

describe('SchoolService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllSchools', () => {
    it('should return schools with pagination', async () => {
      const mockSchools = [
        {
          id: '1',
          name: 'Test School',
          description: 'A test school',
          location: 'Test City',
          isActive: true,
          imageAsset: { key: 'image-key' },
          bannerAsset: { key: 'banner-key' }
        }
      ]

      mockDb.school.count.mockResolvedValue(1)
      mockDb.school.findMany.mockResolvedValue(mockSchools as any)

      const result = await SchoolService.getAllSchools({
        page: 1,
        limit: 10
      })

      expect(result.schools).toEqual(mockSchools)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
    })

    it('should handle search queries', async () => {
      mockDb.school.count.mockResolvedValue(0)
      mockDb.school.findMany.mockResolvedValue([])

      await SchoolService.getAllSchools({
        search: 'test query',
        page: 1,
        limit: 10
      })

      expect(mockDb.school.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test query', mode: 'insensitive' } },
            { description: { contains: 'test query', mode: 'insensitive' } },
            { location: { contains: 'test query', mode: 'insensitive' } }
          ],
          isActive: true
        },
        include: {
          imageAsset: true,
          bannerAsset: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })
    })
  })

  describe('getSchoolById', () => {
    it('should return school with assets', async () => {
      const mockSchool = {
        id: '1',
        name: 'Test School',
        imageAsset: { key: 'image-key' },
        bannerAsset: { key: 'banner-key' }
      }

      mockDb.school.findUnique.mockResolvedValue(mockSchool as any)

      const result = await SchoolService.getSchoolById('1')

      expect(result).toEqual(mockSchool)
      expect(mockDb.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          imageAsset: true,
          bannerAsset: true
        }
      })
    })

    it('should return null if school not found', async () => {
      mockDb.school.findUnique.mockResolvedValue(null)

      const result = await SchoolService.getSchoolById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('createSchool', () => {
    it('should create school with asset references', async () => {
      const createData = {
        name: 'New School',
        description: 'A new school',
        location: 'New City',
        imageAssetKey: 'image-key',
        bannerAssetKey: 'banner-key',
        createdBy: 'user-123'
      }

      const mockCreatedSchool = {
        id: '1',
        ...createData,
        volunteerHours: 0,
        activeMembers: 0,
        isActive: true,
        imageAsset: { key: 'image-key' },
        bannerAsset: { key: 'banner-key' }
      }

      mockDb.school.create.mockResolvedValue(mockCreatedSchool as any)

      const result = await SchoolService.createSchool(createData)

      expect(result).toEqual(mockCreatedSchool)
      expect(mockDb.school.create).toHaveBeenCalledWith({
        data: {
          name: 'New School',
          description: 'A new school',
          location: 'New City',
          website: undefined,
          email: undefined,
          phone: undefined,
          imageAssetKey: 'image-key',
          bannerAssetKey: 'banner-key',
          volunteerHours: 0,
          activeMembers: 0,
          createdBy: 'user-123',
          isActive: true
        },
        include: {
          imageAsset: true,
          bannerAsset: true
        }
      })
    })
  })

  describe('updateSchool', () => {
    it('should update school with new data', async () => {
      const updateData = {
        name: 'Updated School',
        imageAssetKey: 'new-image-key'
      }

      const mockUpdatedSchool = {
        id: '1',
        name: 'Updated School',
        imageAssetKey: 'new-image-key',
        imageAsset: { key: 'new-image-key' },
        bannerAsset: null
      }

      mockDb.school.update.mockResolvedValue(mockUpdatedSchool as any)

      const result = await SchoolService.updateSchool('1', updateData)

      expect(result).toEqual(mockUpdatedSchool)
      expect(mockDb.school.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        include: {
          imageAsset: true,
          bannerAsset: true
        }
      })
    })
  })

  describe('updateSchoolStats', () => {
    it('should update school statistics', async () => {
      const statsData = {
        volunteerHours: 100,
        activeMembers: 50
      }

      const mockUpdatedSchool = {
        id: '1',
        name: 'Test School',
        volunteerHours: 100,
        activeMembers: 50,
        imageAsset: null,
        bannerAsset: null
      }

      mockDb.school.update.mockResolvedValue(mockUpdatedSchool as any)

      const result = await SchoolService.updateSchoolStats('1', statsData)

      expect(result).toEqual(mockUpdatedSchool)
      expect(mockDb.school.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: statsData,
        include: {
          imageAsset: true,
          bannerAsset: true
        }
      })
    })
  })

  describe('deleteSchool', () => {
    it('should soft delete school by setting isActive to false', async () => {
      await SchoolService.deleteSchool('1')

      expect(mockDb.school.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false }
      })
    })
  })

  describe('schoolExists', () => {
    it('should return true if school exists and is active', async () => {
      mockDb.school.findUnique.mockResolvedValue({ id: '1' } as any)

      const result = await SchoolService.schoolExists('1')

      expect(result).toBe(true)
      expect(mockDb.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1', isActive: true },
        select: { id: true }
      })
    })

    it('should return false if school does not exist', async () => {
      mockDb.school.findUnique.mockResolvedValue(null)

      const result = await SchoolService.schoolExists('nonexistent')

      expect(result).toBe(false)
    })
  })
})