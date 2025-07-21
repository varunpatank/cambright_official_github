import { NextRequest } from 'next/server'
import { AssetType } from '@prisma/client'

// Mock dependencies
jest.mock('@/lib/current-profile', () => ({
  currentProfile: jest.fn()
}))

jest.mock('@/lib/admin', () => ({
  isAdmin: jest.fn()
}))

jest.mock('@/lib/asset-manager', () => ({
  assetManager: {
    uploadAsset: jest.fn(),
    getAsset: jest.fn(),
    deleteAsset: jest.fn(),
    getAssetMetadata: jest.fn(),
    cleanupOrphanedAssets: jest.fn(),
    listAssetsByType: jest.fn()
  }
}))

describe('Asset API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/assets/upload', () => {
    it('should upload asset successfully', async () => {
      const { currentProfile } = require('@/lib/current-profile')
      const { assetManager } = require('@/lib/asset-manager')
      
      currentProfile.mockResolvedValue({ userId: 'user-123' })
      assetManager.uploadAsset.mockResolvedValue({
        key: 'test_key',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        assetType: AssetType.SCHOOL_IMAGE,
        createdAt: new Date()
      })

      // Mock FormData
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', mockFile)
      formData.append('assetType', AssetType.SCHOOL_IMAGE)

      const request = {
        formData: () => Promise.resolve(formData)
      } as any

      const { POST } = await import('@/app/api/assets/upload/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.asset.key).toBe('test_key')
      expect(data.asset.url).toBe('/api/assets/test_key')
    })

    it('should return 401 if user not authenticated', async () => {
      const { currentProfile } = require('@/lib/current-profile')
      currentProfile.mockResolvedValue(null)

      const request = {
        formData: () => Promise.resolve(new FormData())
      } as any

      const { POST } = await import('@/app/api/assets/upload/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 if file is missing', async () => {
      const { currentProfile } = require('@/lib/current-profile')
      currentProfile.mockResolvedValue({ userId: 'user-123' })

      const formData = new FormData()
      formData.append('assetType', AssetType.SCHOOL_IMAGE)

      const request = {
        formData: () => Promise.resolve(formData)
      } as any

      const { POST } = await import('@/app/api/assets/upload/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('File is required')
    })
  })

  describe('GET /api/assets/[key]', () => {
    it('should retrieve asset successfully', async () => {
      const { assetManager } = require('@/lib/asset-manager')
      
      const mockStream = { pipe: jest.fn() }
      assetManager.getAsset.mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/jpeg',
        fileName: 'test.jpg',
        fileSize: 1024
      })

      const { GET } = await import('@/app/api/assets/[key]/route')
      const response = await GET({} as NextRequest, { params: { key: 'valid_key_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' } })

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('image/jpeg')
      expect(response.headers.get('Content-Length')).toBe('1024')
    })

    it('should return 400 for invalid key format', async () => {
      const { GET } = await import('@/app/api/assets/[key]/route')
      const response = await GET({} as NextRequest, { params: { key: 'invalid-key' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid asset key format')
    })

    it('should return 404 if asset not found', async () => {
      const { assetManager } = require('@/lib/asset-manager')
      assetManager.getAsset.mockRejectedValue(new Error('Asset not found'))

      const { GET } = await import('@/app/api/assets/[key]/route')
      const response = await GET({} as NextRequest, { params: { key: 'valid_key_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Asset not found')
    })
  })

  describe('DELETE /api/assets/[key]', () => {
    it('should delete asset successfully for owner', async () => {
      const { currentProfile } = require('@/lib/current-profile')
      const { isAdmin } = require('@/lib/admin')
      const { assetManager } = require('@/lib/asset-manager')
      
      currentProfile.mockResolvedValue({ userId: 'user-123' })
      isAdmin.mockReturnValue(false)
      assetManager.getAssetMetadata.mockResolvedValue({ uploadedBy: 'user-123' })
      assetManager.deleteAsset.mockResolvedValue(undefined)

      const { DELETE } = await import('@/app/api/assets/[key]/route')
      const response = await DELETE({} as NextRequest, { params: { key: 'valid_key_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Asset deleted successfully')
    })

    it('should delete asset successfully for admin', async () => {
      const { currentProfile } = require('@/lib/current-profile')
      const { isAdmin } = require('@/lib/admin')
      const { assetManager } = require('@/lib/asset-manager')
      
      currentProfile.mockResolvedValue({ userId: 'admin-123' })
      isAdmin.mockReturnValue(true)
      assetManager.getAssetMetadata.mockResolvedValue({ uploadedBy: 'user-123' })
      assetManager.deleteAsset.mockResolvedValue(undefined)

      const { DELETE } = await import('@/app/api/assets/[key]/route')
      const response = await DELETE({} as NextRequest, { params: { key: 'valid_key_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should return 403 if user tries to delete someone elses asset', async () => {
      const { currentProfile } = require('@/lib/current-profile')
      const { isAdmin } = require('@/lib/admin')
      const { assetManager } = require('@/lib/asset-manager')
      
      currentProfile.mockResolvedValue({ userId: 'user-123' })
      isAdmin.mockReturnValue(false)
      assetManager.getAssetMetadata.mockResolvedValue({ uploadedBy: 'other-user' })

      const { DELETE } = await import('@/app/api/assets/[key]/route')
      const response = await DELETE({} as NextRequest, { params: { key: 'valid_key_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden: You can only delete your own assets')
    })
  })

  describe('POST /api/assets/cleanup', () => {
    it('should cleanup orphaned assets for admin', async () => {
      const { currentProfile } = require('@/lib/current-profile')
      const { isAdmin } = require('@/lib/admin')
      const { assetManager } = require('@/lib/asset-manager')
      
      currentProfile.mockResolvedValue({ userId: 'admin-123' })
      isAdmin.mockReturnValue(true)
      assetManager.cleanupOrphanedAssets.mockResolvedValue(5)

      const { POST } = await import('@/app/api/assets/cleanup/route')
      const response = await POST({} as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.cleanedAssetsCount).toBe(5)
    })

    it('should return 403 for non-admin users', async () => {
      const { currentProfile } = require('@/lib/current-profile')
      const { isAdmin } = require('@/lib/admin')
      
      currentProfile.mockResolvedValue({ userId: 'user-123' })
      isAdmin.mockReturnValue(false)

      const { POST } = await import('@/app/api/assets/cleanup/route')
      const response = await POST({} as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden: Admin access required')
    })
  })
})