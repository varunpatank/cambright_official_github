import { AssetManagerService } from '../../lib/asset-manager'
import { AssetType } from '@prisma/client'
import { minioClient, BUCKET_NAME } from '../../lib/minio'
import { db } from '../../lib/db'

// Mock dependencies
jest.mock('../../lib/minio', () => ({
  minioClient: {
    putObject: jest.fn(),
    getObject: jest.fn(),
    removeObject: jest.fn(),
  },
  BUCKET_NAME: 'test-bucket',
}))

jest.mock('../../lib/db', () => ({
  db: {
    assetManager: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

describe('AssetManagerService', () => {
  let assetManager: AssetManagerService
  
  beforeEach(() => {
    assetManager = new AssetManagerService()
    jest.clearAllMocks()
  })

  describe('uploadAsset', () => {
    it('should upload asset to MinIO and create database record', async () => {
      const mockFile = Buffer.from('test file content')
      const mockRequest = {
        file: mockFile,
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
        fileSize: mockFile.length,
        uploadedBy: 'user-123',
        assetType: AssetType.SCHOOL_IMAGE,
      }

      const mockAssetRecord = {
        key: 'test-key-123',
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
        fileSize: mockFile.length,
        minioPath: 'assets/schools/images/test-key-123.jpg',
        uploadedBy: 'user-123',
        assetType: AssetType.SCHOOL_IMAGE,
      }

      ;(minioClient.putObject as jest.Mock).mockResolvedValue(undefined)
      ;(db.assetManager.create as jest.Mock).mockResolvedValue(mockAssetRecord)

      const result = await assetManager.uploadAsset(mockRequest)

      expect(minioClient.putObject).toHaveBeenCalledWith(
        BUCKET_NAME,
        expect.stringContaining('assets/schools/images/'),
        mockFile,
        mockFile.length,
        expect.objectContaining({
          'Content-Type': 'image/jpeg',
          'Original-Name': 'test-image.jpg',
          'Uploaded-By': 'user-123',
          'Asset-Type': AssetType.SCHOOL_IMAGE,
        })
      )

      expect(db.assetManager.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fileName: 'test-image.jpg',
          mimeType: 'image/jpeg',
          fileSize: mockFile.length,
          uploadedBy: 'user-123',
          assetType: AssetType.SCHOOL_IMAGE,
        }),
      })

      expect(result).toEqual({
        key: 'test-key-123',
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
        fileSize: mockFile.length,
        url: '/api/assets/test-key-123',
      })
    })

    it('should handle upload errors gracefully', async () => {
      const mockRequest = {
        file: Buffer.from('test'),
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 4,
        uploadedBy: 'user-123',
        assetType: AssetType.SCHOOL_IMAGE,
      }

      ;(minioClient.putObject as jest.Mock).mockRejectedValue(new Error('MinIO error'))

      await expect(assetManager.uploadAsset(mockRequest)).rejects.toThrow('Failed to upload asset: MinIO error')
    })

    it('should validate file size limits', async () => {
      const mockRequest = {
        file: Buffer.from('test'),
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 10 * 1024 * 1024, // 10MB - exceeds 5MB limit for SCHOOL_IMAGE
        uploadedBy: 'user-123',
        assetType: AssetType.SCHOOL_IMAGE,
      }

      await expect(assetManager.uploadAsset(mockRequest)).rejects.toThrow('File size exceeds limit')
    })

    it('should validate MIME types', async () => {
      const mockRequest = {
        file: Buffer.from('test'),
        fileName: 'test.txt',
        mimeType: 'text/plain',
        fileSize: 100,
        uploadedBy: 'user-123',
        assetType: AssetType.SCHOOL_IMAGE, // text/plain not allowed for SCHOOL_IMAGE
      }

      await expect(assetManager.uploadAsset(mockRequest)).rejects.toThrow('Invalid file type')
    })

    it('should validate filename', async () => {
      const mockRequest = {
        file: Buffer.from('test'),
        fileName: '', // Empty filename
        mimeType: 'image/jpeg',
        fileSize: 100,
        uploadedBy: 'user-123',
        assetType: AssetType.SCHOOL_IMAGE,
      }

      await expect(assetManager.uploadAsset(mockRequest)).rejects.toThrow('Invalid filename')
    })
  })

  describe('getAsset', () => {
    it('should retrieve asset stream and metadata', async () => {
      const mockAssetRecord = {
        key: 'test-key-123',
        fileName: 'test-image.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        minioPath: 'assets/schools/images/test-key-123.jpg',
        isActive: true,
      }

      const mockStream = { pipe: jest.fn() } as any

      ;(db.assetManager.findUnique as jest.Mock).mockResolvedValue(mockAssetRecord)
      ;(minioClient.getObject as jest.Mock).mockResolvedValue(mockStream)

      const result = await assetManager.getAsset('test-key-123')

      expect(db.assetManager.findUnique).toHaveBeenCalledWith({
        where: { key: 'test-key-123', isActive: true },
      })

      expect(minioClient.getObject).toHaveBeenCalledWith(BUCKET_NAME, 'assets/schools/images/test-key-123.jpg')

      expect(result).toEqual({
        stream: mockStream,
        mimeType: 'image/jpeg',
        fileName: 'test-image.jpg',
        fileSize: 1024,
      })
    })

    it('should throw error for non-existent asset', async () => {
      ;(db.assetManager.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(assetManager.getAsset('non-existent-key')).rejects.toThrow('Failed to retrieve asset: Asset not found or inactive')
    })
  })

  describe('deleteAsset', () => {
    it('should delete asset from MinIO and mark as inactive in database', async () => {
      const mockAssetRecord = {
        key: 'test-key-123',
        minioPath: 'assets/schools/images/test-key-123.jpg',
      }

      ;(db.assetManager.findUnique as jest.Mock).mockResolvedValue(mockAssetRecord)
      ;(minioClient.removeObject as jest.Mock).mockResolvedValue(undefined)
      ;(db.assetManager.update as jest.Mock).mockResolvedValue(undefined)

      await assetManager.deleteAsset('test-key-123')

      expect(minioClient.removeObject).toHaveBeenCalledWith(BUCKET_NAME, 'assets/schools/images/test-key-123.jpg')
      expect(db.assetManager.update).toHaveBeenCalledWith({
        where: { key: 'test-key-123' },
        data: { 
          isActive: false,
          updatedAt: expect.any(Date),
        },
      })
    })

    it('should continue with database cleanup even if MinIO deletion fails', async () => {
      const mockAssetRecord = {
        key: 'test-key-123',
        minioPath: 'assets/schools/images/test-key-123.jpg',
      }

      ;(db.assetManager.findUnique as jest.Mock).mockResolvedValue(mockAssetRecord)
      ;(minioClient.removeObject as jest.Mock).mockRejectedValue(new Error('MinIO error'))
      ;(db.assetManager.update as jest.Mock).mockResolvedValue(undefined)

      await assetManager.deleteAsset('test-key-123')

      expect(db.assetManager.update).toHaveBeenCalledWith({
        where: { key: 'test-key-123' },
        data: { 
          isActive: false,
          updatedAt: expect.any(Date),
        },
      })
    })

    it('should throw error for non-existent asset', async () => {
      ;(db.assetManager.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(assetManager.deleteAsset('non-existent-key')).rejects.toThrow('Failed to delete asset: Asset not found')
    })
  })

  describe('generateUniqueKey', () => {
    it('should generate unique keys', () => {
      const key1 = (assetManager as any).generateUniqueKey()
      const key2 = (assetManager as any).generateUniqueKey()
      
      expect(key1).toBeDefined()
      expect(key2).toBeDefined()
      expect(key1).not.toBe(key2)
      expect(key1).toMatch(/^[a-z0-9]+_[a-f0-9]{64}$/)
      expect(key2).toMatch(/^[a-z0-9]+_[a-f0-9]{64}$/)
    })
  })

  describe('getMinioPath', () => {
    it('should generate correct paths for different asset types', () => {
      const getMinioPath = (assetManager as any).getMinioPath.bind(assetManager)
      
      expect(getMinioPath(AssetType.SCHOOL_IMAGE, 'key123', 'image.jpg')).toBe('assets/schools/images/key123.jpg')
      expect(getMinioPath(AssetType.SCHOOL_BANNER, 'key123', 'banner.png')).toBe('assets/schools/banners/key123.png')
      expect(getMinioPath(AssetType.POST_IMAGE, 'key123', 'post.gif')).toBe('assets/posts/images/key123.gif')
      expect(getMinioPath(AssetType.COURSE_IMAGE, 'key123', 'course.webp')).toBe('assets/courses/images/key123.webp')
      expect(getMinioPath(AssetType.CHAPTER_VIDEO, 'key123', 'video.mp4')).toBe('assets/chapters/videos/key123.mp4')
      expect(getMinioPath(AssetType.NOTE_ATTACHMENT, 'key123', 'note.pdf')).toBe('assets/notes/attachments/key123.pdf')
    })
  })
})