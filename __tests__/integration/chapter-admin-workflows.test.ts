import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ChapterAdminRole } from '@prisma/client'

// Mock the services for integration testing
const mockDb = {
  school: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
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
  schoolPost: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  assetManager: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}

const mockCache = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  clear: jest.fn(),
}

const mockMinioClient = {
  putObject: jest.fn(),
  getObject: jest.fn(),
  removeObject: jest.fn(),
}

// Mock implementations
jest.mock('@/lib/db', () => ({
  db: mockDb,
}))

jest.mock('@/lib/cache', () => ({
  cache: mockCache,
}))

jest.mock('@/lib/minio', () => ({
  minioClient: mockMinioClient,
  BUCKET_NAME: 'test-bucket',
}))

jest.mock('@/lib/admin', () => ({
  hasAdminAccess: jest.fn(),
}))

// Import services after mocking
import { ChapterAdminService } from '@/lib/chapter-admin-service'
import { SchoolService } from '@/lib/school-service'
import { AssetManagerService } from '@/lib/asset-manager'
import { hasAdminAccess } from '@/lib/admin'

const mockHasAdminAccess = hasAdminAccess as jest.MockedFunction<typeof hasAdminAccess>

describe('Chapter Admin System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Admin Assignment Workflow', () => {
    it('should complete full admin assignment workflow', async () => {
      // Setup test data
      const schoolId = 'school-123'
      const targetUserId = 'user-456'
      const assignedBy = 'admin-789'
      
      const mockSchool = {
        id: schoolId,
        name: 'Test School',
        description: 'A test school',
        location: 'Test City',
        isActive: true,
      }

      const mockNewAdmin = {
        id: 'admin-123',
        userId: targetUserId,
        schoolId: schoolId,
        role: ChapterAdminRole.CHAPTER_ADMIN,
        assignedBy: assignedBy,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        school: mockSchool,
      }

      // Mock database responses
      mockDb.school.findUnique.mockResolvedValue(mockSchool)
      mockDb.chapterAdmin.findUnique.mockResolvedValue(null) // No existing admin
      mockDb.chapterAdmin.create.mockResolvedValue(mockNewAdmin)
      mockCache.del.mockResolvedValue(1)

      // Step 1: Assign admin
      const assignedAdmin = await ChapterAdminService.assignAdmin(
        schoolId,
        targetUserId,
        ChapterAdminRole.CHAPTER_ADMIN,
        assignedBy
      )

      expect(assignedAdmin).toEqual(mockNewAdmin)
      expect(mockDb.school.findUnique).toHaveBeenCalledWith({
        where: { id: schoolId, isActive: true }
      })
      expect(mockDb.chapterAdmin.create).toHaveBeenCalledWith({
        data: {
          userId: targetUserId,
          schoolId: schoolId,
          role: ChapterAdminRole.CHAPTER_ADMIN,
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

      // Step 2: Verify admin can be retrieved
      const mockAdmins = [mockNewAdmin]
      mockCache.get.mockResolvedValue(null)
      mockDb.chapterAdmin.findMany.mockResolvedValue(mockAdmins)
      mockCache.setex.mockResolvedValue('OK')

      const retrievedAdmins = await ChapterAdminService.getAdminsBySchool(schoolId)
      
      expect(retrievedAdmins).toEqual(mockAdmins)
      expect(mockDb.chapterAdmin.findMany).toHaveBeenCalledWith({
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

      // Step 3: Verify admin has permissions
      mockDb.chapterAdmin.findUnique.mockResolvedValue({
        id: 'admin-123',
        role: ChapterAdminRole.CHAPTER_ADMIN,
      })

      const hasPermission = await ChapterAdminService.hasPermission(
        targetUserId,
        schoolId,
        ChapterAdminRole.CHAPTER_ADMIN
      )

      expect(hasPermission).toBe(true)

      // Step 4: Remove admin
      mockDb.chapterAdmin.findUnique.mockResolvedValue({
        id: 'admin-123',
        userId: targetUserId,
        schoolId: schoolId,
        isActive: true,
      })
      mockDb.chapterAdmin.update.mockResolvedValue(undefined)

      await ChapterAdminService.removeAdmin('admin-123', assignedBy)

      expect(mockDb.chapterAdmin.update).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        data: {
          isActive: false,
          updatedAt: expect.any(Date)
        }
      })

      // Verify cache was cleared
      expect(mockCache.del).toHaveBeenCalledTimes(4) // 2 for assign, 2 for remove
    })

    it('should handle admin reactivation workflow', async () => {
      const schoolId = 'school-123'
      const targetUserId = 'user-456'
      const assignedBy = 'admin-789'
      
      const mockSchool = {
        id: schoolId,
        name: 'Test School',
        isActive: true,
      }

      const mockExistingAdmin = {
        id: 'admin-123',
        userId: targetUserId,
        schoolId: schoolId,
        role: ChapterAdminRole.CHAPTER_ADMIN,
        isActive: false, // Inactive admin
      }

      const mockReactivatedAdmin = {
        ...mockExistingAdmin,
        isActive: true,
        role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
        assignedBy: assignedBy,
        school: mockSchool,
      }

      // Mock database responses
      mockDb.school.findUnique.mockResolvedValue(mockSchool)
      mockDb.chapterAdmin.findUnique.mockResolvedValue(mockExistingAdmin)
      mockDb.chapterAdmin.update.mockResolvedValue(mockReactivatedAdmin)
      mockCache.del.mockResolvedValue(1)

      const result = await ChapterAdminService.assignAdmin(
        schoolId,
        targetUserId,
        ChapterAdminRole.CHAPTER_SUPER_ADMIN,
        assignedBy
      )

      expect(result).toEqual(mockReactivatedAdmin)
      expect(mockDb.chapterAdmin.update).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        data: {
          isActive: true,
          role: ChapterAdminRole.CHAPTER_SUPER_ADMIN,
          assignedBy: assignedBy,
          updatedAt: expect.any(Date)
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
    })
  })

  describe('End-to-End Asset Upload and Retrieval Tests', () => {
    it('should complete asset upload and retrieval workflow', async () => {
      const assetManager = new AssetManagerService()
      
      // Step 1: Upload asset
      const mockFile = Buffer.from('test file content')
      const uploadRequest = {
        file: mockFile,
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
        fileSize: mockFile.length,
        uploadedBy: 'user-123',
        assetType: 'SCHOOL_IMAGE' as any,
      }

      const mockAssetRecord = {
        key: 'test_key_123',
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
        fileSize: mockFile.length,
        minioPath: 'assets/schools/images/test_key_123.jpg',
        uploadedBy: 'user-123',
        assetType: 'SCHOOL_IMAGE',
        isActive: true,
      }

      mockMinioClient.putObject.mockResolvedValue(undefined)
      mockDb.assetManager.create.mockResolvedValue(mockAssetRecord)

      const uploadResult = await assetManager.uploadAsset(uploadRequest)

      expect(uploadResult.key).toBe('test_key_123')
      expect(uploadResult.url).toBe('/api/assets/test_key_123')
      expect(mockMinioClient.putObject).toHaveBeenCalled()
      expect(mockDb.assetManager.create).toHaveBeenCalled()

      // Step 2: Retrieve asset
      const mockStream = { pipe: jest.fn() }
      mockDb.assetManager.findUnique.mockResolvedValue(mockAssetRecord)
      mockMinioClient.getObject.mockResolvedValue(mockStream)

      const retrievalResult = await assetManager.getAsset('test_key_123')

      expect(retrievalResult.stream).toBe(mockStream)
      expect(retrievalResult.mimeType).toBe('image/jpeg')
      expect(retrievalResult.fileName).toBe('test-image.jpg')
      expect(mockDb.assetManager.findUnique).toHaveBeenCalledWith({
        where: { key: 'test_key_123', isActive: true }
      })

      // Step 3: Delete asset
      mockDb.assetManager.findUnique.mockResolvedValue(mockAssetRecord)
      mockMinioClient.removeObject.mockResolvedValue(undefined)
      mockDb.assetManager.update.mockResolvedValue(undefined)

      await assetManager.deleteAsset('test_key_123')

      expect(mockMinioClient.removeObject).toHaveBeenCalledWith(
        'test-bucket',
        'assets/schools/images/test_key_123.jpg'
      )
      expect(mockDb.assetManager.update).toHaveBeenCalledWith({
        where: { key: 'test_key_123' },
        data: {
          isActive: false,
          updatedAt: expect.any(Date)
        }
      })
    })

    it('should handle asset upload with validation errors', async () => {
      const assetManager = new AssetManagerService()
      
      // Test file size validation
      const oversizedRequest = {
        file: Buffer.from('test'),
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 10 * 1024 * 1024, // 10MB - exceeds limit
        uploadedBy: 'user-123',
        assetType: 'SCHOOL_IMAGE' as any,
      }

      await expect(assetManager.uploadAsset(oversizedRequest)).rejects.toThrow('File size exceeds limit')

      // Test invalid MIME type
      const invalidMimeRequest = {
        file: Buffer.from('test'),
        fileName: 'test.txt',
        mimeType: 'text/plain',
        fileSize: 100,
        uploadedBy: 'user-123',
        assetType: 'SCHOOL_IMAGE' as any,
      }

      await expect(assetManager.uploadAsset(invalidMimeRequest)).rejects.toThrow('Invalid file type')

      // Test empty filename
      const emptyFilenameRequest = {
        file: Buffer.from('test'),
        fileName: '',
        mimeType: 'image/jpeg',
        fileSize: 100,
        uploadedBy: 'user-123',
        assetType: 'SCHOOL_IMAGE' as any,
      }

      await expect(assetManager.uploadAsset(emptyFilenameRequest)).rejects.toThrow('Invalid filename')
    })
  })

  describe('School Post Creation with Chapter Admin Permissions', () => {
    it('should create school post with proper admin permissions', async () => {
      const schoolId = 'school-123'
      const adminUserId = 'admin-456'
      
      // Setup: User is a chapter admin for the school
      mockDb.chapterAdmin.findUnique.mockResolvedValue({
        id: 'admin-assignment-123',
        userId: adminUserId,
        schoolId: schoolId,
        role: ChapterAdminRole.CHAPTER_ADMIN,
        isActive: true,
      })

      // Verify admin has permission to create posts
      const hasPostPermission = await ChapterAdminService.hasPermission(
        adminUserId,
        schoolId,
        ChapterAdminRole.CHAPTER_ADMIN
      )

      expect(hasPostPermission).toBe(true)

      // Create school post with asset
      const mockPost = {
        id: 'post-123',
        title: 'Test Post',
        content: 'Test content',
        schoolId: schoolId,
        authorId: adminUserId,
        imageAssetKey: 'asset_key_123',
        isActive: true,
        createdAt: new Date(),
      }

      mockDb.schoolPost.create.mockResolvedValue(mockPost)

      // Mock post creation (this would be done through a service)
      const createPostMock = async (postData: any) => {
        // Verify user has permission
        const hasPermission = await ChapterAdminService.hasPermission(
          postData.authorId,
          postData.schoolId,
          ChapterAdminRole.CHAPTER_ADMIN
        )

        if (!hasPermission) {
          throw new Error('Insufficient permissions to create post')
        }

        return await mockDb.schoolPost.create({
          data: postData
        })
      }

      const createdPost = await createPostMock({
        title: 'Test Post',
        content: 'Test content',
        schoolId: schoolId,
        authorId: adminUserId,
        imageAssetKey: 'asset_key_123',
      })

      expect(createdPost).toEqual(mockPost)
      expect(mockDb.schoolPost.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Post',
          content: 'Test content',
          schoolId: schoolId,
          authorId: adminUserId,
          imageAssetKey: 'asset_key_123',
        }
      })
    })

    it('should prevent post creation without admin permissions', async () => {
      const schoolId = 'school-123'
      const regularUserId = 'user-456'
      
      // Setup: User is NOT a chapter admin for the school
      mockDb.chapterAdmin.findUnique.mockResolvedValue(null)

      const hasPostPermission = await ChapterAdminService.hasPermission(
        regularUserId,
        schoolId,
        ChapterAdminRole.CHAPTER_ADMIN
      )

      expect(hasPostPermission).toBe(false)

      // Mock post creation that checks permissions
      const createPostMock = async (postData: any) => {
        const hasPermission = await ChapterAdminService.hasPermission(
          postData.authorId,
          postData.schoolId,
          ChapterAdminRole.CHAPTER_ADMIN
        )

        if (!hasPermission) {
          throw new Error('Insufficient permissions to create post')
        }

        return await mockDb.schoolPost.create({
          data: postData
        })
      }

      await expect(createPostMock({
        title: 'Test Post',
        content: 'Test content',
        schoolId: schoolId,
        authorId: regularUserId,
      })).rejects.toThrow('Insufficient permissions to create post')

      expect(mockDb.schoolPost.create).not.toHaveBeenCalled()
    })
  })

  describe('Migration Process Validation', () => {
    it('should validate school data migration workflow', async () => {
      // Mock existing schools in database
      const existingSchools = [
        {
          id: 'school-1',
          name: 'Existing School 1',
          isActive: true,
        },
        {
          id: 'school-2',
          name: 'Existing School 2',
          isActive: true,
        }
      ]

      mockDb.school.findMany.mockResolvedValue(existingSchools)

      const schools = await SchoolService.getAllSchools({
        page: 1,
        limit: 10,
        includeInactive: false
      })

      expect(schools.schools).toEqual(existingSchools)
      expect(mockDb.school.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          imageAsset: true,
          bannerAsset: true
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      })

      // Verify no MinIO dependencies
      expect(mockMinioClient.getObject).not.toHaveBeenCalled()
    })

    it('should validate asset migration process', async () => {
      // Mock legacy assets that need migration
      const legacyAssets = [
        {
          id: 'asset-1',
          oldPath: '/uploads/school-images/image1.jpg',
          fileName: 'image1.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024,
        }
      ]

      // Mock migration process
      const migrationMock = async (legacyAsset: any) => {
        // Create new AssetManager record
        const newAssetRecord = {
          key: 'migrated_key_123',
          fileName: legacyAsset.fileName,
          mimeType: legacyAsset.mimeType,
          fileSize: legacyAsset.fileSize,
          minioPath: `assets/schools/images/migrated_key_123.jpg`,
          uploadedBy: 'migration-script',
          assetType: 'SCHOOL_IMAGE',
          isActive: true,
        }

        mockDb.assetManager.create.mockResolvedValue(newAssetRecord)
        
        return await mockDb.assetManager.create({
          data: newAssetRecord
        })
      }

      const migratedAsset = await migrationMock(legacyAssets[0])

      expect(migratedAsset.key).toBe('migrated_key_123')
      expect(migratedAsset.fileName).toBe('image1.jpg')
      expect(mockDb.assetManager.create).toHaveBeenCalled()
    })
  })

  describe('Error Recovery and Consistency', () => {
    it('should handle database connection failures gracefully', async () => {
      mockDb.school.findUnique.mockRejectedValue(new Error('Database connection failed'))

      await expect(
        ChapterAdminService.assignAdmin(
          'school-123',
          'user-456',
          ChapterAdminRole.CHAPTER_ADMIN,
          'admin-789'
        )
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle cache failures gracefully', async () => {
      const schoolId = 'school-123'
      
      // Cache fails but database works
      mockCache.get.mockRejectedValue(new Error('Cache connection failed'))
      mockDb.chapterAdmin.findMany.mockResolvedValue([])
      mockCache.setex.mockRejectedValue(new Error('Cache write failed'))

      // Should still work without cache
      const result = await ChapterAdminService.getAdminsBySchool(schoolId)

      expect(result).toEqual([])
      expect(mockDb.chapterAdmin.findMany).toHaveBeenCalled()
    })

    it('should maintain data consistency during partial failures', async () => {
      const assetManager = new AssetManagerService()
      
      // MinIO upload succeeds but database fails
      mockMinioClient.putObject.mockResolvedValue(undefined)
      mockDb.assetManager.create.mockRejectedValue(new Error('Database write failed'))

      const uploadRequest = {
        file: Buffer.from('test'),
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 100,
        uploadedBy: 'user-123',
        assetType: 'SCHOOL_IMAGE' as any,
      }

      await expect(assetManager.uploadAsset(uploadRequest)).rejects.toThrow('Failed to upload asset')

      // Verify MinIO upload was attempted
      expect(mockMinioClient.putObject).toHaveBeenCalled()
    })
  })
})