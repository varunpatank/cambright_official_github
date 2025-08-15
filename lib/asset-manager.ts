import { AssetType } from '@prisma/client'
import { minioClient, BUCKET_NAME } from './minio'
import { db } from './db'
import { randomBytes } from 'crypto'
import { Readable } from 'stream'

export interface UploadAssetRequest {
  file: Buffer
  fileName: string
  mimeType: string
  fileSize: number
  uploadedBy: string
  assetType: AssetType
}

export interface AssetResponse {
  key: string
  fileName: string
  mimeType: string
  fileSize: number
  url: string
}

export interface AssetStreamResponse {
  stream: Readable
  mimeType: string
  fileName: string
  fileSize: number
}

export class AssetManagerService {
  /**
   * Generates a unique, secure key for asset identification
   * Uses crypto.randomBytes for cryptographically secure random generation
   */
  private generateUniqueKey(): string {
    // Generate 32 random bytes and convert to hex (64 characters)
    const randomPart = randomBytes(32).toString('hex')
    
    // Add timestamp for additional uniqueness
    const timestamp = Date.now().toString(36)
    
    // Combine for final key
    return `${timestamp}_${randomPart}`
  }

  /**
   * Generates MinIO path based on asset type and key
   */
  private getMinioPath(assetType: AssetType, key: string, fileName: string): string {
    const extension = fileName.split('.').pop() || ''
    const pathMap: Record<AssetType, string> = {
      SCHOOL_IMAGE: `assets/schools/images/${key}.${extension}`,
      SCHOOL_BANNER: `assets/schools/banners/${key}.${extension}`,
      POST_IMAGE: `assets/posts/images/${key}.${extension}`,
      COURSE_IMAGE: `assets/courses/images/${key}.${extension}`,
      CHAPTER_VIDEO: `assets/chapters/videos/${key}.${extension}`,
      GENERAL_FILE: `assets/general/${key}.${extension}`,
    }
    
    return pathMap[assetType]
  }

  /**
   * Uploads an asset to MinIO and creates a database record
   * Returns the asset key and API URL for frontend use
   */
  async uploadAsset(request: UploadAssetRequest): Promise<AssetResponse> {
    try {
      console.log('AssetManager: Starting upload process...', {
        fileName: request.fileName,
        mimeType: request.mimeType,
        fileSize: request.fileSize,
        assetType: request.assetType,
        uploadedBy: request.uploadedBy
      })

      // Validate file before upload
      this.validateFile(request.fileName, request.mimeType, request.fileSize, request.assetType)
      console.log('AssetManager: File validation passed')
      
      // Generate unique key
      const key = this.generateUniqueKey()
      console.log('AssetManager: Generated key:', key)
      
      // Generate MinIO path
      const minioPath = this.getMinioPath(request.assetType, key, request.fileName)
      console.log('AssetManager: MinIO path:', minioPath)
      
      // Upload to MinIO
      console.log('AssetManager: Uploading to MinIO...')
      await minioClient.putObject(
        BUCKET_NAME,
        minioPath,
        request.file,
        request.fileSize,
        {
          'Content-Type': request.mimeType,
          'Original-Name': request.fileName,
          'Uploaded-By': request.uploadedBy,
          'Asset-Type': request.assetType,
        }
      )
      console.log('AssetManager: MinIO upload successful')
      
      // Create database record
      console.log('AssetManager: Creating database record...')
      const assetRecord = await db.assets.create({
        data: {
          id: key, // Use key as id in the new schema
          key,
          originalName: request.fileName,
          mimeType: request.mimeType,
          size: request.fileSize,
          url: `/api/assets/${key}`,
          type: request.assetType,
          uploadedBy: request.uploadedBy,
        },
      })
      console.log('AssetManager: Database record created:', {
        id: assetRecord.id,
        key: assetRecord.key,
        url: assetRecord.url
      })
      
      // Return response with API URL
      const response = {
        key: assetRecord.key,
        fileName: assetRecord.originalName,
        mimeType: assetRecord.mimeType,
        fileSize: assetRecord.size,
        url: assetRecord.url,
      }
      console.log('AssetManager: Returning response:', response)
      return response
    } catch (error) {
      console.error('AssetManager: Error during upload:', error)
      console.error('AssetManager: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      throw new Error(`Failed to upload asset: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Retrieves an asset using its key
   * Returns a stream and metadata for serving the file
   */
  async getAsset(key: string): Promise<AssetStreamResponse> {
    try {
      // Look up asset in database
      const assetRecord = await db.assets.findUnique({
        where: { 
          key,
          isActive: true 
        },
      })
      
      if (!assetRecord) {
        throw new Error('Asset not found or inactive')
      }
      
      // Get file stream from MinIO - we need to construct the path
      const minioPath = this.getMinioPath(assetRecord.type, assetRecord.key, assetRecord.originalName)
      const stream = await minioClient.getObject(BUCKET_NAME, minioPath)
      
      return {
        stream,
        mimeType: assetRecord.mimeType,
        fileName: assetRecord.originalName,
        fileSize: assetRecord.size,
      }
    } catch (error) {
      console.error('Error retrieving asset:', error)
      throw new Error(`Failed to retrieve asset: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Deletes an asset from both MinIO and database
   * Performs cleanup operations
   */
  async deleteAsset(key: string): Promise<void> {
    try {
      // Look up asset in database
      const assetRecord = await db.assets.findUnique({
        where: { key },
      })
      
      if (!assetRecord) {
        throw new Error('Asset not found')
      }
      
      // Delete from MinIO
      try {
        const minioPath = this.getMinioPath(assetRecord.type, assetRecord.key, assetRecord.originalName)
        await minioClient.removeObject(BUCKET_NAME, minioPath)
      } catch (minioError) {
        console.warn('Failed to delete from MinIO, continuing with database cleanup:', minioError)
      }
      
      // Mark as inactive in database (soft delete for audit trail)
      await db.assets.update({
        where: { key },
        data: { 
          isActive: false,
          updatedAt: new Date(),
        },
      })
      
      console.log(`Asset ${key} deleted successfully`)
    } catch (error) {
      console.error('Error deleting asset:', error)
      throw new Error(`Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Gets asset metadata without downloading the file
   */
  async getAssetMetadata(key: string) {
    try {
      const assetRecord = await db.assets.findUnique({
        where: { 
          key,
          isActive: true 
        },
      })
      
      if (!assetRecord) {
        throw new Error('Asset not found or inactive')
      }
      
      return {
        key: assetRecord.key,
        fileName: assetRecord.originalName,
        mimeType: assetRecord.mimeType,
        fileSize: assetRecord.size,
        assetType: assetRecord.type,
        uploadedBy: assetRecord.uploadedBy,
        createdAt: assetRecord.createdAt,
        url: assetRecord.url,
      }
    } catch (error) {
      console.error('Error getting asset metadata:', error)
      throw new Error(`Failed to get asset metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Lists assets by type with pagination
   */
  async listAssets(
    assetType?: AssetType,
    uploadedBy?: string,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const where: any = { isActive: true }
      
      if (assetType) {
        where.type = assetType
      }
      
      if (uploadedBy) {
        where.uploadedBy = uploadedBy
      }
      
      const [assets, total] = await Promise.all([
        db.assets.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            key: true,
            originalName: true,
            mimeType: true,
            size: true,
            type: true,
            uploadedBy: true,
            createdAt: true,
          },
        }),
        db.assets.count({ where }),
      ])
      
      return {
        assets: assets.map(asset => ({
          key: asset.key,
          fileName: asset.originalName,
          mimeType: asset.mimeType,
          fileSize: asset.size,
          assetType: asset.type,
          uploadedBy: asset.uploadedBy,
          createdAt: asset.createdAt,
          url: `/api/assets/${asset.key}`,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error('Error listing assets:', error)
      throw new Error(`Failed to list assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validates file type and size before upload
   */
  private validateFile(fileName: string, mimeType: string, fileSize: number, assetType: AssetType): void {
    // File size limits (in bytes)
    const MAX_FILE_SIZES: Record<AssetType, number> = {
      SCHOOL_IMAGE: 5 * 1024 * 1024, // 5MB
      SCHOOL_BANNER: 10 * 1024 * 1024, // 10MB
      POST_IMAGE: 5 * 1024 * 1024, // 5MB
      COURSE_IMAGE: 5 * 1024 * 1024, // 5MB
      CHAPTER_VIDEO: 10 * 1024 * 1024 * 1024, // 10GB for videos
      GENERAL_FILE: 20 * 1024 * 1024, // 20MB
    }

    // Allowed MIME types
    const ALLOWED_MIME_TYPES: Record<AssetType, string[]> = {
      SCHOOL_IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      SCHOOL_BANNER: ['image/jpeg', 'image/png', 'image/webp'],
      POST_IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      COURSE_IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
      CHAPTER_VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg'],
      GENERAL_FILE: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'video/mp4', 'video/webm', 'video/quicktime'],
    }

    // Check file size
    if (fileSize > MAX_FILE_SIZES[assetType]) {
      throw new Error(`File size exceeds limit for ${assetType}. Maximum: ${MAX_FILE_SIZES[assetType]} bytes`)
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES[assetType].includes(mimeType)) {
      throw new Error(`Invalid file type for ${assetType}. Allowed: ${ALLOWED_MIME_TYPES[assetType].join(', ')}`)
    }

    // Basic filename validation
    if (!fileName || fileName.length > 255) {
      throw new Error('Invalid filename: must be non-empty and less than 255 characters')
    }
  }

  /**
   * Cleanup orphaned assets (assets not referenced by any entity)
   * This is a maintenance operation
   */
  async cleanupOrphanedAssets(): Promise<{ deletedCount: number }> {
    try {
      // Find assets that are not referenced by any entity
      const orphanedAssets = await db.assets.findMany({
        where: {
          isActive: true,
          AND: [
            { School_School_imageAssetIdToAssets: { none: {} } },
            { School_School_bannerAssetIdToAssets: { none: {} } },
            { SchoolPost: { none: {} } },
            { Course: { none: {} } },
          ],
        },
        select: { key: true },
      })
      
      let deletedCount = 0
      
      for (const asset of orphanedAssets) {
        try {
          await this.deleteAsset(asset.key)
          deletedCount++
        } catch (error) {
          console.warn(`Failed to delete orphaned asset ${asset.key}:`, error)
        }
      }
      
      console.log(`Cleaned up ${deletedCount} orphaned assets`)
      return { deletedCount }
    } catch (error) {
      console.error('Error cleaning up orphaned assets:', error)
      throw new Error(`Failed to cleanup orphaned assets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate a presigned URL for accessing an asset
   */
  async generatePresignedUrl(key: string, expirySeconds: number = 3600): Promise<{ url: string } | null> {
    try {
      // Get asset info from database
      const asset = await db.assets.findUnique({
        where: { key },
        select: { key: true, originalName: true, isActive: true }
      })

      if (!asset || !asset.isActive) {
        return null
      }

      // Generate presigned URL for the asset
      const { getPresignedUrl } = await import('./minio')
      const presignedUrl = await getPresignedUrl(BUCKET_NAME, asset.key, expirySeconds)

      return { url: presignedUrl }
    } catch (error) {
      console.error(`Error generating presigned URL for ${key}:`, error)
      return null
    }
  }
}

// Export singleton instance
export const assetManager = new AssetManagerService()