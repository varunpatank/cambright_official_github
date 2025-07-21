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
      NOTE_ATTACHMENT: `assets/notes/attachments/${key}.${extension}`,
    }
    
    return pathMap[assetType]
  }

  /**
   * Uploads an asset to MinIO and creates a database record
   * Returns the asset key and API URL for frontend use
   */
  async uploadAsset(request: UploadAssetRequest): Promise<AssetResponse> {
    try {
      // Validate file before upload
      this.validateFile(request.fileName, request.mimeType, request.fileSize, request.assetType)
      
      // Generate unique key
      const key = this.generateUniqueKey()
      
      // Generate MinIO path
      const minioPath = this.getMinioPath(request.assetType, key, request.fileName)
      
      // Upload to MinIO
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
      
      // Create database record
      const assetRecord = await db.assetManager.create({
        data: {
          key,
          fileName: request.fileName,
          mimeType: request.mimeType,
          fileSize: request.fileSize,
          minioPath,
          uploadedBy: request.uploadedBy,
          assetType: request.assetType,
        },
      })
      
      // Return response with API URL
      return {
        key: assetRecord.key,
        fileName: assetRecord.fileName,
        mimeType: assetRecord.mimeType,
        fileSize: assetRecord.fileSize,
        url: `/api/assets/${assetRecord.key}`,
      }
    } catch (error) {
      console.error('Error uploading asset:', error)
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
      const assetRecord = await db.assetManager.findUnique({
        where: { 
          key,
          isActive: true 
        },
      })
      
      if (!assetRecord) {
        throw new Error('Asset not found or inactive')
      }
      
      // Get file stream from MinIO
      const stream = await minioClient.getObject(BUCKET_NAME, assetRecord.minioPath)
      
      return {
        stream,
        mimeType: assetRecord.mimeType,
        fileName: assetRecord.fileName,
        fileSize: assetRecord.fileSize,
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
      const assetRecord = await db.assetManager.findUnique({
        where: { key },
      })
      
      if (!assetRecord) {
        throw new Error('Asset not found')
      }
      
      // Delete from MinIO
      try {
        await minioClient.removeObject(BUCKET_NAME, assetRecord.minioPath)
      } catch (minioError) {
        console.warn('Failed to delete from MinIO, continuing with database cleanup:', minioError)
      }
      
      // Mark as inactive in database (soft delete for audit trail)
      await db.assetManager.update({
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
      const assetRecord = await db.assetManager.findUnique({
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
        fileName: assetRecord.fileName,
        mimeType: assetRecord.mimeType,
        fileSize: assetRecord.fileSize,
        assetType: assetRecord.assetType,
        uploadedBy: assetRecord.uploadedBy,
        createdAt: assetRecord.createdAt,
        url: `/api/assets/${assetRecord.key}`,
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
        where.assetType = assetType
      }
      
      if (uploadedBy) {
        where.uploadedBy = uploadedBy
      }
      
      const [assets, total] = await Promise.all([
        db.assetManager.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            key: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            assetType: true,
            uploadedBy: true,
            createdAt: true,
          },
        }),
        db.assetManager.count({ where }),
      ])
      
      return {
        assets: assets.map(asset => ({
          ...asset,
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
      CHAPTER_VIDEO: 100 * 1024 * 1024, // 100MB
      NOTE_ATTACHMENT: 20 * 1024 * 1024, // 20MB
    }

    // Allowed MIME types
    const ALLOWED_MIME_TYPES: Record<AssetType, string[]> = {
      SCHOOL_IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      SCHOOL_BANNER: ['image/jpeg', 'image/png', 'image/webp'],
      POST_IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      COURSE_IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
      CHAPTER_VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
      NOTE_ATTACHMENT: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'],
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
      const orphanedAssets = await db.assetManager.findMany({
        where: {
          isActive: true,
          AND: [
            { schoolImages: { none: {} } },
            { schoolBanners: { none: {} } },
            { postImages: { none: {} } },
            { courseImages: { none: {} } },
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
}

// Export singleton instance
export const assetManager = new AssetManagerService()