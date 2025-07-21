#!/usr/bin/env tsx
/**
 * School Data Migration Script
 * 
 * This script migrates existing MinIO school data to the database-driven system:
 * 1. Identifies schools stored in MinIO JSON files
 * 2. Creates corresponding database records
 * 3. Migrates school images to AssetManager system
 * 4. Validates migration success and data integrity
 * 
 * Requirements: 5.3, 11.2
 */

import { getAllSchools } from '../lib/minio-schools-fallback'
import { getAllSchools as getMinioSchools } from '../lib/minio-schools'
import { db } from '../lib/db'
import { assetManager } from '../lib/asset-manager'
import { minioClient, BUCKET_NAME } from '../lib/minio'
import { AssetType } from '@prisma/client'
import { School as MinioSchool } from '../lib/minio-school-types'

interface MigrationStats {
  totalSchoolsFound: number
  schoolsCreated: number
  schoolsUpdated: number
  schoolsSkipped: number
  assetsCreated: number
  errors: string[]
}

interface SchoolImageInfo {
  schoolId: string
  imageUrl?: string
  bannerUrl?: string
  hasImageInMinio: boolean
  hasBannerInMinio: boolean
}

class SchoolDataMigrator {
  private stats: MigrationStats = {
    totalSchoolsFound: 0,
    schoolsCreated: 0,
    schoolsUpdated: 0,
    schoolsSkipped: 0,
    assetsCreated: 0,
    errors: []
  }

  /**
   * Main migration function
   */
  async migrate(): Promise<MigrationStats> {
    console.log('🚀 Starting school data migration to AssetManager system...')
    
    try {
      // Step 1: Get schools from both MinIO and fallback sources
      const schools = await this.getSchoolsFromAllSources()
      this.stats.totalSchoolsFound = schools.length
      
      if (schools.length === 0) {
        console.log('⚠️  No schools found in MinIO sources. Nothing to migrate.')
        return this.stats
      }

      console.log(`📊 Found ${schools.length} schools to process`)

      // Step 2: Process each school
      for (const school of schools) {
        await this.processSchool(school)
      }

      // Step 3: Validate migration
      await this.validateMigration()

      console.log('\n🎉 School data migration completed!')
      this.printStats()

      return this.stats

    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error('💥', errorMsg)
      this.stats.errors.push(errorMsg)
      throw error
    }
  }

  /**
   * Get schools from all available sources (MinIO and fallback)
   */
  private async getSchoolsFromAllSources(): Promise<MinioSchool[]> {
    const schools: MinioSchool[] = []
    
    try {
      // Try MinIO first
      console.log('📂 Checking MinIO for schools...')
      const minioSchools = await getMinioSchools()
      schools.push(...minioSchools)
      console.log(`✅ Found ${minioSchools.length} schools in MinIO`)
    } catch (error) {
      console.log('⚠️  MinIO not available, trying fallback...')
    }

    try {
      // Try fallback (local files)
      console.log('📂 Checking fallback storage for schools...')
      const fallbackSchools = await getAllSchools()
      
      // Deduplicate by ID
      const existingIds = new Set(schools.map(s => s.id))
      const newSchools = fallbackSchools.filter(s => !existingIds.has(s.id))
      
      schools.push(...newSchools)
      console.log(`✅ Found ${newSchools.length} additional schools in fallback storage`)
    } catch (error) {
      console.log('⚠️  Fallback storage not available')
    }

    return schools
  }

  /**
   * Process a single school
   */
  private async processSchool(school: MinioSchool): Promise<void> {
    try {
      console.log(`\n🏫 Processing school: ${school.name} (${school.id})`)

      // Check if school already exists in database
      const existingSchool = await db.school.findUnique({
        where: { id: school.id },
        include: {
          imageAsset: true,
          bannerAsset: true
        }
      })

      // Analyze school images
      const imageInfo = await this.analyzeSchoolImages(school)

      if (existingSchool) {
        // Update existing school
        await this.updateExistingSchool(existingSchool, school, imageInfo)
      } else {
        // Create new school
        await this.createNewSchool(school, imageInfo)
      }

    } catch (error) {
      const errorMsg = `Error processing school ${school.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error('❌', errorMsg)
      this.stats.errors.push(errorMsg)
    }
  }

  /**
   * Analyze school images to determine what needs to be migrated
   */
  private async analyzeSchoolImages(school: MinioSchool): Promise<SchoolImageInfo> {
    const info: SchoolImageInfo = {
      schoolId: school.id,
      imageUrl: school.imageUrl,
      hasImageInMinio: false,
      hasBannerInMinio: false
    }

    // Check for school images in MinIO
    try {
      const imagePrefix = `school-images/${school.id}/`
      const objects = await this.listMinioObjects(imagePrefix)
      
      if (objects.length > 0) {
        info.hasImageInMinio = true
        // Look for common image files
        const imageFile = objects.find(obj => 
          obj.name.includes('logo') || 
          obj.name.includes('image') || 
          obj.name.match(/\.(jpg|jpeg|png|webp)$/i)
        )
        if (imageFile) {
          info.imageUrl = `minio://${BUCKET_NAME}/${imageFile.name}`
        }

        // Look for banner files
        const bannerFile = objects.find(obj => 
          obj.name.includes('banner') || 
          obj.name.includes('cover')
        )
        if (bannerFile) {
          info.hasBannerInMinio = true
          info.bannerUrl = `minio://${BUCKET_NAME}/${bannerFile.name}`
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not check MinIO images for school ${school.id}:`, error)
    }

    return info
  }

  /**
   * Create a new school in the database
   */
  private async createNewSchool(school: MinioSchool, imageInfo: SchoolImageInfo): Promise<void> {
    try {
      // Migrate assets first
      const imageAssetKey = await this.migrateSchoolImage(school.id, imageInfo.imageUrl, AssetType.SCHOOL_IMAGE)
      const bannerAssetKey = await this.migrateSchoolImage(school.id, imageInfo.bannerUrl, AssetType.SCHOOL_BANNER)

      // Create school record
      await db.school.create({
        data: {
          id: school.id,
          name: school.name,
          description: school.description || null,
          location: school.location || null,
          website: school.website || null,
          email: school.email || null,
          phone: school.phone || null,
          isActive: school.isActive,
          volunteerHours: school.volunteerHours || 0,
          activeMembers: school.activeMembers || 0,
          createdBy: school.createdBy,
          createdAt: new Date(school.createdAt),
          updatedAt: new Date(school.updatedAt),
          imageAssetKey,
          bannerAssetKey,
          // Keep legacy imageUrl for backward compatibility during transition
          imageUrl: school.imageUrl || null
        }
      })

      console.log(`✅ Created school: ${school.name}`)
      this.stats.schoolsCreated++

    } catch (error) {
      throw new Error(`Failed to create school: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update an existing school in the database
   */
  private async updateExistingSchool(existingSchool: any, school: MinioSchool, imageInfo: SchoolImageInfo): Promise<void> {
    try {
      let imageAssetKey = existingSchool.imageAssetKey
      let bannerAssetKey = existingSchool.bannerAssetKey

      // Migrate assets if they don't exist yet
      if (!imageAssetKey && imageInfo.imageUrl) {
        imageAssetKey = await this.migrateSchoolImage(school.id, imageInfo.imageUrl, AssetType.SCHOOL_IMAGE)
      }

      if (!bannerAssetKey && imageInfo.bannerUrl) {
        bannerAssetKey = await this.migrateSchoolImage(school.id, imageInfo.bannerUrl, AssetType.SCHOOL_BANNER)
      }

      // Update school record with any new data
      await db.school.update({
        where: { id: school.id },
        data: {
          name: school.name,
          description: school.description || existingSchool.description,
          location: school.location || existingSchool.location,
          website: school.website || existingSchool.website,
          email: school.email || existingSchool.email,
          phone: school.phone || existingSchool.phone,
          volunteerHours: school.volunteerHours ?? existingSchool.volunteerHours,
          activeMembers: school.activeMembers ?? existingSchool.activeMembers,
          imageAssetKey: imageAssetKey || existingSchool.imageAssetKey,
          bannerAssetKey: bannerAssetKey || existingSchool.bannerAssetKey,
          updatedAt: new Date()
        }
      })

      console.log(`✅ Updated school: ${school.name}`)
      this.stats.schoolsUpdated++

    } catch (error) {
      throw new Error(`Failed to update school: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Migrate a school image to AssetManager
   */
  private async migrateSchoolImage(schoolId: string, imageUrl: string | undefined, assetType: AssetType): Promise<string | null> {
    if (!imageUrl) return null

    try {
      // Skip if already an asset key
      if (!imageUrl.startsWith('minio://') && !imageUrl.startsWith('http')) {
        return null
      }

      // Extract MinIO path from URL
      let minioPath: string
      if (imageUrl.startsWith('minio://')) {
        minioPath = imageUrl.replace(`minio://${BUCKET_NAME}/`, '')
      } else {
        // Handle HTTP URLs that might point to MinIO
        const url = new URL(imageUrl)
        minioPath = url.pathname.substring(1) // Remove leading slash
      }

      // Check if file exists in MinIO
      try {
        const stat = await minioClient.statObject(BUCKET_NAME, minioPath)
        
        // Download the file
        const stream = await minioClient.getObject(BUCKET_NAME, minioPath)
        const chunks: Buffer[] = []
        
        for await (const chunk of stream) {
          chunks.push(chunk)
        }
        
        const fileBuffer = Buffer.concat(chunks)
        const fileName = minioPath.split('/').pop() || 'image'
        
        // Upload through AssetManager
        const assetResponse = await assetManager.uploadAsset({
          file: fileBuffer,
          fileName,
          mimeType: stat.metaData['content-type'] || 'image/jpeg',
          fileSize: stat.size,
          uploadedBy: 'migration-script',
          assetType
        })

        console.log(`✅ Migrated ${assetType.toLowerCase()}: ${fileName} -> ${assetResponse.key}`)
        this.stats.assetsCreated++
        
        return assetResponse.key

      } catch (error) {
        console.log(`⚠️  Could not migrate image ${minioPath}: ${error}`)
        return null
      }

    } catch (error) {
      console.log(`⚠️  Error migrating image for school ${schoolId}: ${error}`)
      return null
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
    console.log('\n🔍 Validating migration results...')

    try {
      // Count schools in database
      const totalSchoolsInDb = await db.school.count()
      console.log(`📊 Total schools in database: ${totalSchoolsInDb}`)

      // Count schools with assets
      const schoolsWithImages = await db.school.count({
        where: { imageAssetKey: { not: null } }
      })
      
      const schoolsWithBanners = await db.school.count({
        where: { bannerAssetKey: { not: null } }
      })

      console.log(`📊 Schools with image assets: ${schoolsWithImages}`)
      console.log(`📊 Schools with banner assets: ${schoolsWithBanners}`)

      // Count total assets created
      const totalAssets = await db.assetManager.count({
        where: {
          assetType: { in: [AssetType.SCHOOL_IMAGE, AssetType.SCHOOL_BANNER] },
          isActive: true
        }
      })

      console.log(`📊 Total school assets in AssetManager: ${totalAssets}`)

      // Validate data integrity
      const schoolsWithInvalidAssets = await db.school.findMany({
        where: {
          OR: [
            { 
              imageAssetKey: { not: null },
              imageAsset: null
            },
            {
              bannerAssetKey: { not: null },
              bannerAsset: null
            }
          ]
        },
        select: { id: true, name: true }
      })

      if (schoolsWithInvalidAssets.length > 0) {
        console.log(`⚠️  Found ${schoolsWithInvalidAssets.length} schools with invalid asset references`)
        schoolsWithInvalidAssets.forEach(school => {
          console.log(`   - ${school.name} (${school.id})`)
        })
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
    console.log('\n📈 Migration Statistics:')
    console.log(`   📊 Total schools found: ${this.stats.totalSchoolsFound}`)
    console.log(`   ✅ Schools created: ${this.stats.schoolsCreated}`)
    console.log(`   🔄 Schools updated: ${this.stats.schoolsUpdated}`)
    console.log(`   ⏭️  Schools skipped: ${this.stats.schoolsSkipped}`)
    console.log(`   🖼️  Assets created: ${this.stats.assetsCreated}`)
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
 * Main migration function
 */
async function migrateSchoolData(): Promise<void> {
  const migrator = new SchoolDataMigrator()
  
  try {
    const stats = await migrator.migrate()
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️  Migration completed with errors. Please review the error log.')
      process.exit(1)
    } else {
      console.log('\n🎉 Migration completed successfully!')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateSchoolData().catch((error) => {
    console.error('💥 Unhandled error in migration script:', error)
    process.exit(1)
  })
}

export { SchoolDataMigrator, migrateSchoolData }