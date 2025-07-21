#!/usr/bin/env tsx
/**
 * Migration Validation and Rollback Utilities
 * 
 * This script provides validation and rollback capabilities for the chapter admin system migration:
 * 1. Creates validation scripts to verify migration success
 * 2. Implements rollback procedures for failed migrations
 * 3. Adds data consistency checks
 * 
 * Requirements: 7.3, 8.1
 */

import { db } from '../lib/db'
import { assetManager } from '../lib/asset-manager'
import { minioClient, BUCKET_NAME } from '../lib/minio'
import { AssetType } from '@prisma/client'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalSchools: number
    schoolsWithAssets: number
    totalAssets: number
    orphanedAssets: number
    invalidReferences: number
  }
}

interface RollbackSnapshot {
  timestamp: string
  schools: Array<{
    id: string
    name: string
    imageUrl: string | null
    imageAssetKey: string | null
    bannerAssetKey: string | null
  }>
  courses: Array<{
    id: string
    title: string
    imageUrl: string | null
    imageAssetKey: string | null
  }>
  posts: Array<{
    id: string
    title: string
    imageUrl: string | null
    imageAssetKey: string | null
  }>
  assets: Array<{
    key: string
    fileName: string
    minioPath: string
    assetType: AssetType
  }>
}

class MigrationValidator {
  private snapshotPath = join(process.cwd(), 'data', 'migration-snapshots')

  /**
   * Create a snapshot before migration for rollback purposes
   */
  async createPreMigrationSnapshot(): Promise<string> {
    console.log('📸 Creating pre-migration snapshot...')

    try {
      // Ensure snapshot directory exists
      if (!existsSync(this.snapshotPath)) {
        require('fs').mkdirSync(this.snapshotPath, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const snapshotFile = join(this.snapshotPath, `pre-migration-${timestamp}.json`)

      // Collect current state
      const schools = await db.school.findMany({
        select: {
          id: true,
          name: true,
          imageUrl: true,
          imageAssetKey: true,
          bannerAssetKey: true
        }
      })

      const courses = await db.course.findMany({
        select: {
          id: true,
          title: true,
          imageUrl: true,
          imageAssetKey: true
        }
      })

      const posts = await db.schoolPost.findMany({
        select: {
          id: true,
          title: true,
          imageUrl: true,
          imageAssetKey: true
        }
      })

      const assets = await db.assetManager.findMany({
        where: { isActive: true },
        select: {
          key: true,
          fileName: true,
          minioPath: true,
          assetType: true
        }
      })

      const snapshot: RollbackSnapshot = {
        timestamp,
        schools,
        courses,
        posts,
        assets
      }

      writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2))
      console.log(`✅ Snapshot created: ${snapshotFile}`)
      
      return snapshotFile

    } catch (error) {
      console.error('❌ Failed to create snapshot:', error)
      throw new Error(`Snapshot creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate the migration results
   */
  async validateMigration(): Promise<ValidationResult> {
    console.log('🔍 Validating migration results...')

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        totalSchools: 0,
        schoolsWithAssets: 0,
        totalAssets: 0,
        orphanedAssets: 0,
        invalidReferences: 0
      }
    }

    try {
      // Validate database consistency
      await this.validateDatabaseConsistency(result)
      
      // Validate asset integrity
      await this.validateAssetIntegrity(result)
      
      // Validate MinIO consistency
      await this.validateMinioConsistency(result)
      
      // Check for data loss
      await this.checkForDataLoss(result)

      // Determine overall validity
      result.isValid = result.errors.length === 0

      console.log(`\n📊 Validation ${result.isValid ? 'PASSED' : 'FAILED'}`)
      console.log(`   ✅ Errors: ${result.errors.length}`)
      console.log(`   ⚠️  Warnings: ${result.warnings.length}`)

      return result

    } catch (error) {
      result.isValid = false
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Validate database consistency
   */
  private async validateDatabaseConsistency(result: ValidationResult): Promise<void> {
    console.log('🔍 Checking database consistency...')

    try {
      // Count total schools
      result.stats.totalSchools = await db.school.count()

      // Count schools with assets
      result.stats.schoolsWithAssets = await db.school.count({
        where: {
          OR: [
            { imageAssetKey: { not: null } },
            { bannerAssetKey: { not: null } }
          ]
        }
      })

      // Count total assets
      result.stats.totalAssets = await db.assetManager.count({
        where: { isActive: true }
      })

      // Check for invalid asset references in schools
      const schoolsWithInvalidImageAssets = await db.school.findMany({
        where: {
          imageAssetKey: { not: null },
          imageAsset: null
        },
        select: { id: true, name: true, imageAssetKey: true }
      })

      const schoolsWithInvalidBannerAssets = await db.school.findMany({
        where: {
          bannerAssetKey: { not: null },
          bannerAsset: null
        },
        select: { id: true, name: true, bannerAssetKey: true }
      })

      // Check for invalid asset references in courses
      const coursesWithInvalidAssets = await db.course.findMany({
        where: {
          imageAssetKey: { not: null },
          imageAsset: null
        },
        select: { id: true, title: true, imageAssetKey: true }
      })

      // Check for invalid asset references in posts
      const postsWithInvalidAssets = await db.schoolPost.findMany({
        where: {
          imageAssetKey: { not: null },
          imageAsset: null
        },
        select: { id: true, title: true, imageAssetKey: true }
      })

      const totalInvalidReferences = 
        schoolsWithInvalidImageAssets.length + 
        schoolsWithInvalidBannerAssets.length + 
        coursesWithInvalidAssets.length + 
        postsWithInvalidAssets.length

      result.stats.invalidReferences = totalInvalidReferences

      if (totalInvalidReferences > 0) {
        result.errors.push(`Found ${totalInvalidReferences} invalid asset references`)
        
        schoolsWithInvalidImageAssets.forEach(school => {
          result.errors.push(`School "${school.name}" has invalid image asset key: ${school.imageAssetKey}`)
        })
        
        schoolsWithInvalidBannerAssets.forEach(school => {
          result.errors.push(`School "${school.name}" has invalid banner asset key: ${school.bannerAssetKey}`)
        })
        
        coursesWithInvalidAssets.forEach(course => {
          result.errors.push(`Course "${course.title}" has invalid asset key: ${course.imageAssetKey}`)
        })
        
        postsWithInvalidAssets.forEach(post => {
          result.errors.push(`Post "${post.title}" has invalid asset key: ${post.imageAssetKey}`)
        })
      }

      console.log(`✅ Database consistency check completed`)

    } catch (error) {
      result.errors.push(`Database consistency check failed: ${error}`)
    }
  }

  /**
   * Validate asset integrity
   */
  private async validateAssetIntegrity(result: ValidationResult): Promise<void> {
    console.log('🔍 Checking asset integrity...')

    try {
      // Get all active assets
      const assets = await db.assetManager.findMany({
        where: { isActive: true },
        select: {
          key: true,
          fileName: true,
          minioPath: true,
          assetType: true
        }
      })

      let validAssets = 0
      let invalidAssets = 0

      for (const asset of assets) {
        try {
          // Check if file exists in MinIO
          await minioClient.statObject(BUCKET_NAME, asset.minioPath)
          validAssets++
        } catch (error) {
          result.errors.push(`Asset ${asset.key} (${asset.fileName}) file not found in MinIO: ${asset.minioPath}`)
          invalidAssets++
        }
      }

      if (invalidAssets > 0) {
        result.errors.push(`Found ${invalidAssets} assets with missing files in MinIO`)
      }

      console.log(`✅ Asset integrity check completed: ${validAssets} valid, ${invalidAssets} invalid`)

    } catch (error) {
      result.errors.push(`Asset integrity check failed: ${error}`)
    }
  }

  /**
   * Validate MinIO consistency
   */
  private async validateMinioConsistency(result: ValidationResult): Promise<void> {
    console.log('🔍 Checking MinIO consistency...')

    try {
      // Get all managed asset paths
      const managedAssets = await db.assetManager.findMany({
        where: { isActive: true },
        select: { minioPath: true }
      })

      const managedPaths = new Set(managedAssets.map(asset => asset.minioPath))

      // Check for orphaned files in asset directories
      const assetDirectories = [
        'assets/schools/images/',
        'assets/schools/banners/',
        'assets/courses/images/',
        'assets/posts/images/'
      ]

      let orphanedCount = 0

      for (const directory of assetDirectories) {
        try {
          const objects = await this.listMinioObjects(directory)
          
          for (const obj of objects) {
            if (!managedPaths.has(obj.name)) {
              // Check if it's still referenced in legacy fields
              const isReferenced = await this.isFileStillReferenced(obj.name)
              if (!isReferenced) {
                orphanedCount++
                result.warnings.push(`Orphaned file in MinIO: ${obj.name}`)
              }
            }
          }
        } catch (error) {
          result.warnings.push(`Could not check directory ${directory}: ${error}`)
        }
      }

      result.stats.orphanedAssets = orphanedCount

      if (orphanedCount > 0) {
        result.warnings.push(`Found ${orphanedCount} orphaned files in MinIO`)
      }

      console.log(`✅ MinIO consistency check completed: ${orphanedCount} orphaned files`)

    } catch (error) {
      result.errors.push(`MinIO consistency check failed: ${error}`)
    }
  }

  /**
   * Check for potential data loss
   */
  private async checkForDataLoss(result: ValidationResult): Promise<void> {
    console.log('🔍 Checking for data loss...')

    try {
      // Check for schools that lost their images
      const schoolsWithLostImages = await db.school.findMany({
        where: {
          imageUrl: { not: null },
          imageAssetKey: null
        },
        select: { id: true, name: true, imageUrl: true }
      })

      if (schoolsWithLostImages.length > 0) {
        result.warnings.push(`${schoolsWithLostImages.length} schools still have imageUrl but no imageAssetKey`)
        schoolsWithLostImages.forEach(school => {
          result.warnings.push(`School "${school.name}" may have lost image: ${school.imageUrl}`)
        })
      }

      // Check for courses that lost their images
      const coursesWithLostImages = await db.course.findMany({
        where: {
          imageUrl: { not: null },
          imageAssetKey: null
        },
        select: { id: true, title: true, imageUrl: true }
      })

      if (coursesWithLostImages.length > 0) {
        result.warnings.push(`${coursesWithLostImages.length} courses still have imageUrl but no imageAssetKey`)
        coursesWithLostImages.forEach(course => {
          result.warnings.push(`Course "${course.title}" may have lost image: ${course.imageUrl}`)
        })
      }

      // Check for posts that lost their images
      const postsWithLostImages = await db.schoolPost.findMany({
        where: {
          imageUrl: { not: null },
          imageAssetKey: null
        },
        select: { id: true, title: true, imageUrl: true }
      })

      if (postsWithLostImages.length > 0) {
        result.warnings.push(`${postsWithLostImages.length} posts still have imageUrl but no imageAssetKey`)
        postsWithLostImages.forEach(post => {
          result.warnings.push(`Post "${post.title}" may have lost image: ${post.imageUrl}`)
        })
      }

      console.log(`✅ Data loss check completed`)

    } catch (error) {
      result.errors.push(`Data loss check failed: ${error}`)
    }
  }

  /**
   * Rollback migration using a snapshot
   */
  async rollbackMigration(snapshotFile: string): Promise<void> {
    console.log(`🔄 Rolling back migration using snapshot: ${snapshotFile}`)

    try {
      if (!existsSync(snapshotFile)) {
        throw new Error(`Snapshot file not found: ${snapshotFile}`)
      }

      const snapshotData: RollbackSnapshot = JSON.parse(readFileSync(snapshotFile, 'utf-8'))
      console.log(`📸 Using snapshot from: ${snapshotData.timestamp}`)

      // Rollback schools
      console.log('🔄 Rolling back schools...')
      for (const school of snapshotData.schools) {
        await db.school.update({
          where: { id: school.id },
          data: {
            imageUrl: school.imageUrl,
            imageAssetKey: school.imageAssetKey,
            bannerAssetKey: school.bannerAssetKey,
            updatedAt: new Date()
          }
        })
      }
      console.log(`✅ Rolled back ${snapshotData.schools.length} schools`)

      // Rollback courses
      console.log('🔄 Rolling back courses...')
      for (const course of snapshotData.courses) {
        await db.course.update({
          where: { id: course.id },
          data: {
            imageUrl: course.imageUrl,
            imageAssetKey: course.imageAssetKey,
            updatedAt: new Date()
          }
        })
      }
      console.log(`✅ Rolled back ${snapshotData.courses.length} courses`)

      // Rollback posts
      console.log('🔄 Rolling back posts...')
      for (const post of snapshotData.posts) {
        await db.schoolPost.update({
          where: { id: post.id },
          data: {
            imageUrl: post.imageUrl,
            imageAssetKey: post.imageAssetKey,
            updatedAt: new Date()
          }
        })
      }
      console.log(`✅ Rolled back ${snapshotData.posts.length} posts`)

      // Remove assets that were created during migration
      console.log('🔄 Removing migration assets...')
      const currentAssets = await db.assetManager.findMany({
        where: { isActive: true },
        select: { key: true }
      })

      const snapshotAssetKeys = new Set(snapshotData.assets.map(a => a.key))
      const assetsToRemove = currentAssets.filter(a => !snapshotAssetKeys.has(a.key))

      for (const asset of assetsToRemove) {
        try {
          await assetManager.deleteAsset(asset.key)
        } catch (error) {
          console.log(`⚠️  Could not remove asset ${asset.key}: ${error}`)
        }
      }
      console.log(`✅ Removed ${assetsToRemove.length} migration assets`)

      console.log('🎉 Rollback completed successfully!')

    } catch (error) {
      console.error('💥 Rollback failed:', error)
      throw new Error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate a comprehensive migration report
   */
  async generateMigrationReport(): Promise<string> {
    console.log('📊 Generating migration report...')

    try {
      const validation = await this.validateMigration()
      const timestamp = new Date().toISOString()

      const report = `
# Chapter Admin System Migration Report
Generated: ${timestamp}

## Migration Status: ${validation.isValid ? '✅ SUCCESS' : '❌ FAILED'}

## Statistics
- Total Schools: ${validation.stats.totalSchools}
- Schools with Assets: ${validation.stats.schoolsWithAssets}
- Total Assets: ${validation.stats.totalAssets}
- Orphaned Assets: ${validation.stats.orphanedAssets}
- Invalid References: ${validation.stats.invalidReferences}

## Errors (${validation.errors.length})
${validation.errors.map((error, i) => `${i + 1}. ${error}`).join('\n')}

## Warnings (${validation.warnings.length})
${validation.warnings.map((warning, i) => `${i + 1}. ${warning}`).join('\n')}

## Recommendations
${validation.isValid 
  ? '✅ Migration completed successfully. No action required.'
  : '❌ Migration has issues. Consider running rollback and investigating errors.'
}

${validation.warnings.length > 0 
  ? '⚠️  Review warnings and consider cleanup operations.'
  : ''
}
`

      const reportFile = join(process.cwd(), 'data', `migration-report-${timestamp.replace(/[:.]/g, '-')}.md`)
      writeFileSync(reportFile, report)
      
      console.log(`📊 Report saved: ${reportFile}`)
      return reportFile

    } catch (error) {
      throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
   * Check if a file is still referenced in the database
   */
  private async isFileStillReferenced(filePath: string): Promise<boolean> {
    try {
      const possibleUrls = [
        filePath,
        `/${filePath}`,
        `minio://${BUCKET_NAME}/${filePath}`
      ]

      const [schoolCount, courseCount, postCount] = await Promise.all([
        db.school.count({ where: { imageUrl: { in: possibleUrls } } }),
        db.course.count({ where: { imageUrl: { in: possibleUrls } } }),
        db.schoolPost.count({ where: { imageUrl: { in: possibleUrls } } })
      ])

      return schoolCount > 0 || courseCount > 0 || postCount > 0

    } catch (error) {
      return true // Err on the side of caution
    }
  }
}

/**
 * CLI interface for validation and rollback operations
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const validator = new MigrationValidator()

  try {
    switch (command) {
      case 'snapshot':
        const snapshotFile = await validator.createPreMigrationSnapshot()
        console.log(`Snapshot created: ${snapshotFile}`)
        break

      case 'validate':
        const validation = await validator.validateMigration()
        console.log(`Validation ${validation.isValid ? 'PASSED' : 'FAILED'}`)
        if (!validation.isValid) {
          process.exit(1)
        }
        break

      case 'rollback':
        const snapshotPath = args[1]
        if (!snapshotPath) {
          console.error('Usage: tsx migration-validation-and-rollback.ts rollback <snapshot-file>')
          process.exit(1)
        }
        await validator.rollbackMigration(snapshotPath)
        break

      case 'report':
        const reportFile = await validator.generateMigrationReport()
        console.log(`Report generated: ${reportFile}`)
        break

      default:
        console.log(`
Usage: tsx migration-validation-and-rollback.ts <command>

Commands:
  snapshot  - Create a pre-migration snapshot
  validate  - Validate migration results
  rollback <snapshot-file> - Rollback using snapshot
  report    - Generate migration report
`)
        process.exit(1)
    }

  } catch (error) {
    console.error('💥 Command failed:', error)
    process.exit(1)
  }
}

// Run CLI if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
}

export { MigrationValidator }
export type { ValidationResult, RollbackSnapshot }