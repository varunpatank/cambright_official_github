#!/usr/bin/env tsx
/**
 * Asset Migration Utilities Script
 * 
 * This script migrates existing assets with direct paths to the AssetManager system:
 * 1. Identifies all existing assets with direct paths in the database
 * 2. Generates AssetManager records for existing assets
 * 3. Updates database references to use asset keys
 * 4. Removes orphaned MinIO files after successful migration
 * 
 * Requirements: 10.3, 11.2
 */

import { db } from '../lib/db'
import { assetManager } from '../lib/asset-manager'
import { minioClient, BUCKET_NAME } from '../lib/minio'
import { AssetType } from '@prisma/client'

interface AssetMigrationStats {
  totalAssetsFound: number
  schoolImagesProcessed: number
  courseImagesProcessed: number
  postImagesProcessed: number
  assetsCreated: number
  referencesUpdated: number
  orphanedFilesRemoved: number
  errors: string[]
}

interface AssetToMigrate {
  type: 'school_image' | 'course_image' | 'post_image'
  entityId: string
  entityType: string
  currentUrl: string
  fieldName: string
}

class AssetMigrationUtilities {
  private stats: AssetMigrationStats = {
    totalAssetsFound: 0,
    schoolImagesProcessed: 0,
    courseImagesProcessed: 0,
    postImagesProcessed: 0,
    assetsCreated: 0,
    referencesUpdated: 0,
    orphanedFilesRemoved: 0,
    errors: []
  }

  /**
   * Main migration function
   */
  async migrate(): Promise<AssetMigrationStats> {
    console.log('🚀 Starting asset migration to AssetManager system...')
    
    try {
      // Step 1: Identify all assets that need migration
      const assetsToMigrate = await this.identifyAssetsToMigrate()
      this.stats.totalAssetsFound = assetsToMigrate.length

      if (assetsToMigrate.length === 0) {
        console.log('⚠️  No assets found that need migration.')
        return this.stats
      }

      console.log(`📊 Found ${assetsToMigrate.length} assets to migrate`)

      // Step 2: Process each asset
      for (const asset of assetsToMigrate) {
        await this.processAsset(asset)
      }

      // Step 3: Clean up orphaned files
      await this.cleanupOrphanedFiles()

      // Step 4: Validate migration
      await this.validateMigration()

      console.log('\n🎉 Asset migration completed!')
      this.printStats()

      return this.stats

    } catch (error) {
      const errorMsg = `Asset migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error('💥', errorMsg)
      this.stats.errors.push(errorMsg)
      throw error
    }
  }

  /**
   * Identify all assets that need to be migrated to AssetManager
   */
  private async identifyAssetsToMigrate(): Promise<AssetToMigrate[]> {
    console.log('🔍 Identifying assets that need migration...')
    const assetsToMigrate: AssetToMigrate[] = []

    try {
      // Find schools with imageUrl but no imageAssetKey
      const schoolsWithImages = await db.school.findMany({
        where: {
          imageUrl: { not: null },
          imageAssetKey: null
        },
        select: {
          id: true,
          imageUrl: true
        }
      })

      for (const school of schoolsWithImages) {
        if (school.imageUrl && this.isDirectPath(school.imageUrl)) {
          assetsToMigrate.push({
            type: 'school_image',
            entityId: school.id,
            entityType: 'School',
            currentUrl: school.imageUrl,
            fieldName: 'imageUrl'
          })
        }
      }

      console.log(`📊 Found ${schoolsWithImages.length} school images to migrate`)

      // Find courses with imageUrl but no imageAssetKey
      const coursesWithImages = await db.course.findMany({
        where: {
          imageUrl: { not: null },
          imageAssetKey: null
        },
        select: {
          id: true,
          imageUrl: true
        }
      })

      for (const course of coursesWithImages) {
        if (course.imageUrl && this.isDirectPath(course.imageUrl)) {
          assetsToMigrate.push({
            type: 'course_image',
            entityId: course.id,
            entityType: 'Course',
            currentUrl: course.imageUrl,
            fieldName: 'imageUrl'
          })
        }
      }

      console.log(`📊 Found ${coursesWithImages.length} course images to migrate`)

      // Find school posts with imageUrl but no imageAssetKey
      const postsWithImages = await db.schoolPost.findMany({
        where: {
          imageUrl: { not: null },
          imageAssetKey: null
        },
        select: {
          id: true,
          imageUrl: true
        }
      })

      for (const post of postsWithImages) {
        if (post.imageUrl && this.isDirectPath(post.imageUrl)) {
          assetsToMigrate.push({
            type: 'post_image',
            entityId: post.id,
            entityType: 'SchoolPost',
            currentUrl: post.imageUrl,
            fieldName: 'imageUrl'
          })
        }
      }

      console.log(`📊 Found ${postsWithImages.length} post images to migrate`)

    } catch (error) {
      console.error('❌ Error identifying assets:', error)
      this.stats.errors.push(`Error identifying assets: ${error}`)
    }

    return assetsToMigrate
  }

  /**
   * Check if a URL represents a direct path that needs migration
   */
  private isDirectPath(url: string): boolean {
    // Check for MinIO direct paths
    if (url.startsWith('minio://') || url.includes('/minio/')) {
      return true
    }

    // Check for direct file paths
    if (url.startsWith('/uploads/') || url.startsWith('/assets/')) {
      return true
    }

    // Check for other patterns that indicate direct access
    if (url.includes('school-images/') || url.includes('course-images/') || url.includes('post-images/')) {
      return true
    }

    return false
  }

  /**
   * Process a single asset migration
   */
  private async processAsset(asset: AssetToMigrate): Promise<void> {
    try {
      console.log(`\n🖼️  Processing ${asset.entityType} asset: ${asset.currentUrl}`)

      // Extract MinIO path from URL
      const minioPath = this.extractMinioPath(asset.currentUrl)
      if (!minioPath) {
        console.log(`⚠️  Could not extract MinIO path from: ${asset.currentUrl}`)
        return
      }

      // Check if file exists in MinIO
      let fileExists = false
      let fileBuffer: Buffer
      let fileName: string
      let mimeType: string
      let fileSize: number

      try {
        const stat = await minioClient.statObject(BUCKET_NAME, minioPath)
        const stream = await minioClient.getObject(BUCKET_NAME, minioPath)
        
        const chunks: Buffer[] = []
        for await (const chunk of stream) {
          chunks.push(chunk)
        }
        
        fileBuffer = Buffer.concat(chunks)
        fileName = minioPath.split('/').pop() || 'asset'
        mimeType = stat.metaData['content-type'] || this.guessMimeType(fileName)
        fileSize = stat.size
        fileExists = true

      } catch (error) {
        console.log(`⚠️  File not found in MinIO: ${minioPath}`)
        return
      }

      if (!fileExists) {
        return
      }

      // Determine asset type
      const assetType = this.getAssetType(asset.type)

      // Upload through AssetManager
      const assetResponse = await assetManager.uploadAsset({
        file: fileBuffer,
        fileName,
        mimeType,
        fileSize,
        uploadedBy: 'asset-migration-script',
        assetType
      })

      console.log(`✅ Created asset: ${fileName} -> ${assetResponse.key}`)
      this.stats.assetsCreated++

      // Update database reference
      await this.updateDatabaseReference(asset, assetResponse.key)

      // Update stats
      switch (asset.type) {
        case 'school_image':
          this.stats.schoolImagesProcessed++
          break
        case 'course_image':
          this.stats.courseImagesProcessed++
          break
        case 'post_image':
          this.stats.postImagesProcessed++
          break
      }

    } catch (error) {
      const errorMsg = `Error processing asset ${asset.currentUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error('❌', errorMsg)
      this.stats.errors.push(errorMsg)
    }
  }

  /**
   * Extract MinIO path from various URL formats
   */
  private extractMinioPath(url: string): string | null {
    try {
      // Handle minio:// URLs
      if (url.startsWith('minio://')) {
        return url.replace(`minio://${BUCKET_NAME}/`, '')
      }

      // Handle HTTP URLs that might point to MinIO
      if (url.startsWith('http')) {
        const urlObj = new URL(url)
        return urlObj.pathname.substring(1) // Remove leading slash
      }

      // Handle direct paths
      if (url.startsWith('/')) {
        return url.substring(1) // Remove leading slash
      }

      // Return as-is if it looks like a path
      return url

    } catch (error) {
      console.log(`⚠️  Could not extract MinIO path from: ${url}`)
      return null
    }
  }

  /**
   * Get AssetType enum value from string type
   */
  private getAssetType(type: string): AssetType {
    switch (type) {
      case 'school_image':
        return AssetType.SCHOOL_IMAGE
      case 'course_image':
        return AssetType.COURSE_IMAGE
      case 'post_image':
        return AssetType.POST_IMAGE
      default:
        return AssetType.SCHOOL_IMAGE // Default fallback
    }
  }

  /**
   * Guess MIME type from file extension
   */
  private guessMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'webp':
        return 'image/webp'
      case 'gif':
        return 'image/gif'
      case 'svg':
        return 'image/svg+xml'
      default:
        return 'application/octet-stream'
    }
  }

  /**
   * Update database reference to use asset key
   */
  private async updateDatabaseReference(asset: AssetToMigrate, assetKey: string): Promise<void> {
    try {
      switch (asset.type) {
        case 'school_image':
          await db.school.update({
            where: { id: asset.entityId },
            data: { 
              imageAssetKey: assetKey,
              // Keep imageUrl for backward compatibility during transition
              updatedAt: new Date()
            }
          })
          break

        case 'course_image':
          await db.course.update({
            where: { id: asset.entityId },
            data: { 
              imageAssetKey: assetKey,
              // Keep imageUrl for backward compatibility during transition
              updatedAt: new Date()
            }
          })
          break

        case 'post_image':
          await db.schoolPost.update({
            where: { id: asset.entityId },
            data: { 
              imageAssetKey: assetKey,
              // Keep imageUrl for backward compatibility during transition
              updatedAt: new Date()
            }
          })
          break
      }

      console.log(`✅ Updated ${asset.entityType} reference: ${asset.entityId}`)
      this.stats.referencesUpdated++

    } catch (error) {
      throw new Error(`Failed to update database reference: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clean up orphaned MinIO files that are no longer referenced
   */
  private async cleanupOrphanedFiles(): Promise<void> {
    console.log('\n🧹 Cleaning up orphaned files...')

    try {
      // Get all asset paths that are now managed by AssetManager
      const managedAssets = await db.assetManager.findMany({
        where: { isActive: true },
        select: { minioPath: true }
      })

      const managedPaths = new Set(managedAssets.map(asset => asset.minioPath))

      // List all files in common asset directories
      const directoriesToCheck = [
        'school-images/',
        'course-images/',
        'post-images/',
        'uploads/',
        'assets/schools/',
        'assets/courses/',
        'assets/posts/'
      ]

      let totalOrphanedFiles = 0

      for (const directory of directoriesToCheck) {
        try {
          const objects = await this.listMinioObjects(directory)
          
          for (const obj of objects) {
            // Check if this file is managed by AssetManager
            if (!managedPaths.has(obj.name)) {
              // Check if it's still referenced in the database
              const isReferenced = await this.isFileStillReferenced(obj.name)
              
              if (!isReferenced) {
                try {
                  await minioClient.removeObject(BUCKET_NAME, obj.name)
                  console.log(`🗑️  Removed orphaned file: ${obj.name}`)
                  totalOrphanedFiles++
                } catch (error) {
                  console.log(`⚠️  Could not remove file ${obj.name}: ${error}`)
                }
              }
            }
          }
        } catch (error) {
          console.log(`⚠️  Could not check directory ${directory}: ${error}`)
        }
      }

      this.stats.orphanedFilesRemoved = totalOrphanedFiles
      console.log(`✅ Removed ${totalOrphanedFiles} orphaned files`)

    } catch (error) {
      console.error('❌ Error during cleanup:', error)
      this.stats.errors.push(`Cleanup error: ${error}`)
    }
  }

  /**
   * Check if a file is still referenced in the database
   */
  private async isFileStillReferenced(filePath: string): Promise<boolean> {
    try {
      // Check various URL formats that might reference this file
      const possibleUrls = [
        filePath,
        `/${filePath}`,
        `minio://${BUCKET_NAME}/${filePath}`,
        `http://localhost:9000/${BUCKET_NAME}/${filePath}`
      ]

      // Check schools
      const schoolCount = await db.school.count({
        where: {
          imageUrl: { in: possibleUrls }
        }
      })

      if (schoolCount > 0) return true

      // Check courses
      const courseCount = await db.course.count({
        where: {
          imageUrl: { in: possibleUrls }
        }
      })

      if (courseCount > 0) return true

      // Check posts
      const postCount = await db.schoolPost.count({
        where: {
          imageUrl: { in: possibleUrls }
        }
      })

      if (postCount > 0) return true

      return false

    } catch (error) {
      console.log(`⚠️  Error checking references for ${filePath}: ${error}`)
      return true // Err on the side of caution
    }
  }

  /**
   * List objects in MinIO with a given prefix
   */
  private async listMinioObjects(prefix: string): Promise<{ name: string; size: number }[]> {
    return new Promise((resolve, reject) => {
      const objects: { name: string; size: number }[] = []
      const stream = minioClient.listObjects(BUCKET_NAME, prefix, true)
      
      stream.on('data', (obj) => {
        if (obj.name && obj.size) {
          objects.push({ name: obj.name, size: obj.size })
        }
      })
      
      stream.on('end', () => resolve(objects))
      stream.on('error', reject)
    })
  }

  /**
   * Validate the migration results
   */
  private async validateMigration(): Promise<void> {
    console.log('\n🔍 Validating asset migration results...')

    try {
      // Count entities with asset keys
      const schoolsWithAssetKeys = await db.school.count({
        where: { imageAssetKey: { not: null } }
      })

      const coursesWithAssetKeys = await db.course.count({
        where: { imageAssetKey: { not: null } }
      })

      const postsWithAssetKeys = await db.schoolPost.count({
        where: { imageAssetKey: { not: null } }
      })

      console.log(`📊 Schools with asset keys: ${schoolsWithAssetKeys}`)
      console.log(`📊 Courses with asset keys: ${coursesWithAssetKeys}`)
      console.log(`📊 Posts with asset keys: ${postsWithAssetKeys}`)

      // Count total assets in AssetManager
      const totalAssets = await db.assetManager.count({
        where: { isActive: true }
      })

      console.log(`📊 Total assets in AssetManager: ${totalAssets}`)

      // Check for invalid asset references
      const invalidSchoolAssets = await db.school.count({
        where: {
          imageAssetKey: { not: null },
          imageAsset: null
        }
      })

      const invalidCourseAssets = await db.course.count({
        where: {
          imageAssetKey: { not: null },
          imageAsset: null
        }
      })

      const invalidPostAssets = await db.schoolPost.count({
        where: {
          imageAssetKey: { not: null },
          imageAsset: null
        }
      })

      const totalInvalidReferences = invalidSchoolAssets + invalidCourseAssets + invalidPostAssets

      if (totalInvalidReferences > 0) {
        console.log(`⚠️  Found ${totalInvalidReferences} invalid asset references`)
        this.stats.errors.push(`${totalInvalidReferences} invalid asset references found`)
      } else {
        console.log('✅ All asset references are valid')
      }

    } catch (error) {
      console.error('❌ Validation failed:', error)
      this.stats.errors.push(`Validation failed: ${error}`)
    }
  }

  /**
   * Print migration statistics
   */
  private printStats(): void {
    console.log('\n📈 Asset Migration Statistics:')
    console.log(`   📊 Total assets found: ${this.stats.totalAssetsFound}`)
    console.log(`   🏫 School images processed: ${this.stats.schoolImagesProcessed}`)
    console.log(`   📚 Course images processed: ${this.stats.courseImagesProcessed}`)
    console.log(`   📝 Post images processed: ${this.stats.postImagesProcessed}`)
    console.log(`   ✅ Assets created: ${this.stats.assetsCreated}`)
    console.log(`   🔄 References updated: ${this.stats.referencesUpdated}`)
    console.log(`   🗑️  Orphaned files removed: ${this.stats.orphanedFilesRemoved}`)
    console.log(`   ❌ Errors: ${this.stats.errors.length}`)

    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      this.stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }
  }
}

/**
 * Main asset migration function
 */
async function migrateAssetsToAssetManager(): Promise<void> {
  const migrator = new AssetMigrationUtilities()
  
  try {
    const stats = await migrator.migrate()
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️  Asset migration completed with errors. Please review the error log.')
      process.exit(1)
    } else {
      console.log('\n🎉 Asset migration completed successfully!')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('💥 Asset migration failed:', error)
    process.exit(1)
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateAssetsToAssetManager().catch((error) => {
    console.error('💥 Unhandled error in asset migration script:', error)
    process.exit(1)
  })
}

export { AssetMigrationUtilities, migrateAssetsToAssetManager }