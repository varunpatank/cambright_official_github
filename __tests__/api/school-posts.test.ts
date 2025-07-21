import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  db: {
    school: {
      findUnique: jest.fn()
    },
    schoolPost: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }
}))

jest.mock('@/lib/chapter-admin-permissions', () => ({
  canCreateSchoolPost: jest.fn(),
  canDeleteSchoolPost: jest.fn()
}))

jest.mock('@/lib/admin', () => ({
  hasAdminAccess: jest.fn()
}))

jest.mock('@/lib/asset-manager', () => ({
  assetManager: {
    deleteAsset: jest.fn()
  }
}))

describe('School Posts API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/schools/[id]/posts', () => {
    it('should create post with asset key successfully', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { db } = require('@/lib/db')
      const { canCreateSchoolPost } = require('@/lib/chapter-admin-permissions')
      
      auth.mockReturnValue({ userId: 'user-123' })
      canCreateSchoolPost.mockResolvedValue(true)
      db.school.findUnique.mockResolvedValue({ id: 'school-123', name: 'Test School' })
      
      const mockPost = {
        id: 'post-123',
        title: 'Test Post',
        content: 'Test content',
        imageAssetKey: 'asset_key_123',
        schoolId: 'school-123',
        authorId: 'user-123',
        authorName: 'Test User',
        imageAsset: {
          key: 'asset_key_123',
          fileName: 'test.jpg',
          mimeType: 'image/jpeg'
        }
      }
      
      db.schoolPost.create.mockResolvedValue(mockPost)

      // Mock Clerk client
      jest.doMock('@clerk/nextjs/server', () => ({
        auth: jest.fn().mockReturnValue({ userId: 'user-123' }),
        clerkClient: {
          users: {
            getUser: jest.fn().mockResolvedValue({
              firstName: 'Test',
              lastName: 'User'
            })
          }
        }
      }))

      const request = {
        json: () => Promise.resolve({
          title: 'Test Post',
          content: 'Test content',
          imageAssetKey: 'asset_key_123',
          postType: 'ANNOUNCEMENT'
        })
      } as any

      const { POST } = await import('@/app/api/schools/[id]/posts/route')
      const response = await POST(request, { params: { id: 'school-123' } })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('post-123')
      expect(data.imageAssetKey).toBe('asset_key_123')
      expect(data.imageAsset).toBeDefined()
    })

    it('should return 403 if user lacks chapter admin permissions', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { canCreateSchoolPost } = require('@/lib/chapter-admin-permissions')
      
      auth.mockReturnValue({ userId: 'user-123' })
      canCreateSchoolPost.mockResolvedValue(false)

      const request = {
        json: () => Promise.resolve({
          title: 'Test Post',
          content: 'Test content'
        })
      } as any

      const { POST } = await import('@/app/api/schools/[id]/posts/route')
      const response = await POST(request, { params: { id: 'school-123' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Insufficient permissions')
    })
  })

  describe('GET /api/schools/[id]/posts', () => {
    it('should return posts with asset information', async () => {
      const { db } = require('@/lib/db')
      
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Post 1',
          content: 'Content 1',
          imageAssetKey: 'asset_key_1',
          imageAsset: {
            key: 'asset_key_1',
            fileName: 'image1.jpg',
            mimeType: 'image/jpeg'
          }
        },
        {
          id: 'post-2',
          title: 'Post 2',
          content: 'Content 2',
          imageAssetKey: null,
          imageAsset: null
        }
      ]
      
      db.schoolPost.findMany.mockResolvedValue(mockPosts)

      const request = {} as NextRequest

      const { GET } = await import('@/app/api/schools/[id]/posts/route')
      const response = await GET(request, { params: { id: 'school-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0].imageAsset).toBeDefined()
      expect(data[1].imageAsset).toBeNull()
    })
  })

  describe('DELETE /api/posts/[id]', () => {
    it('should delete post and associated asset', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { db } = require('@/lib/db')
      const { hasAdminAccess } = require('@/lib/admin')
      const { assetManager } = require('@/lib/asset-manager')
      
      auth.mockReturnValue({ userId: 'user-123' })
      hasAdminAccess.mockResolvedValue(true)
      
      const mockPost = {
        id: 'post-123',
        authorId: 'user-123',
        schoolId: 'school-123',
        imageAssetKey: 'asset_key_123'
      }
      
      db.schoolPost.findUnique.mockResolvedValue(mockPost)
      db.schoolPost.update.mockResolvedValue({ ...mockPost, isActive: false })
      assetManager.deleteAsset.mockResolvedValue(undefined)

      const request = {} as NextRequest

      const { DELETE } = await import('@/app/api/posts/[id]/route')
      const response = await DELETE(request, { params: { id: 'post-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(assetManager.deleteAsset).toHaveBeenCalledWith('asset_key_123')
    })

    it('should continue with post deletion even if asset deletion fails', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { db } = require('@/lib/db')
      const { hasAdminAccess } = require('@/lib/admin')
      const { assetManager } = require('@/lib/asset-manager')
      
      auth.mockReturnValue({ userId: 'user-123' })
      hasAdminAccess.mockResolvedValue(true)
      
      const mockPost = {
        id: 'post-123',
        authorId: 'user-123',
        schoolId: 'school-123',
        imageAssetKey: 'asset_key_123'
      }
      
      db.schoolPost.findUnique.mockResolvedValue(mockPost)
      db.schoolPost.update.mockResolvedValue({ ...mockPost, isActive: false })
      assetManager.deleteAsset.mockRejectedValue(new Error('Asset deletion failed'))

      const request = {} as NextRequest

      const { DELETE } = await import('@/app/api/posts/[id]/route')
      const response = await DELETE(request, { params: { id: 'post-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(assetManager.deleteAsset).toHaveBeenCalledWith('asset_key_123')
    })
  })

  describe('PATCH /api/posts/[id]', () => {
    it('should update post and handle asset key changes', async () => {
      const { auth } = require('@clerk/nextjs/server')
      const { db } = require('@/lib/db')
      const { hasAdminAccess } = require('@/lib/admin')
      const { assetManager } = require('@/lib/asset-manager')
      
      auth.mockReturnValue({ userId: 'user-123' })
      hasAdminAccess.mockResolvedValue(true)
      
      const existingPost = {
        id: 'post-123',
        authorId: 'user-123',
        schoolId: 'school-123',
        imageAssetKey: 'old_asset_key'
      }
      
      const updatedPost = {
        ...existingPost,
        imageAssetKey: 'new_asset_key',
        imageAsset: {
          key: 'new_asset_key',
          fileName: 'new_image.jpg',
          mimeType: 'image/jpeg'
        }
      }
      
      db.schoolPost.findUnique.mockResolvedValue(existingPost)
      db.schoolPost.update.mockResolvedValue(updatedPost)
      assetManager.deleteAsset.mockResolvedValue(undefined)

      const request = {
        json: () => Promise.resolve({
          imageAssetKey: 'new_asset_key'
        })
      } as any

      const { PATCH } = await import('@/app/api/posts/[id]/route')
      const response = await PATCH(request, { params: { id: 'post-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.imageAssetKey).toBe('new_asset_key')
      expect(assetManager.deleteAsset).toHaveBeenCalledWith('old_asset_key')
    })
  })
})