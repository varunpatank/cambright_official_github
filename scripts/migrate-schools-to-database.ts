#!/usr/bin/env tsx
// Migration script to move schools from JSON files to database
// Fixes the issue where SchoolPosts expect schools in database but they're in JSON files

import { getAllSchools } from '../lib/minio-schools-fallback'
import { db } from '../lib/db'

async function migrateSchoolsToDatabase() {
	console.log('🚀 Starting migration of schools from JSON files to database...')
	
	try {
		// Get all schools from JSON files
		console.log('📂 Reading schools from JSON files...')
		const schoolsFromFiles = await getAllSchools()
		console.log(`✅ Found ${schoolsFromFiles.length} schools in JSON files`)

		if (schoolsFromFiles.length === 0) {
			console.log('⚠️  No schools found in JSON files. Nothing to migrate.')
			return
		}

		// Check existing schools in database
		const existingSchoolsInDb = await db.school.findMany()
		console.log(`📊 Found ${existingSchoolsInDb.length} schools already in database`)

		// Create a map of existing school names in database to avoid duplicates
		const existingNames = new Set(existingSchoolsInDb.map(school => school.name))

		let successCount = 0
		let skipCount = 0
		let errorCount = 0

		// Migrate each school
		for (const school of schoolsFromFiles) {
			try {
				// Skip if school with same name already exists in database
				if (existingNames.has(school.name)) {
					console.log(`⚠️  School "${school.name}" already exists in database, skipping...`)
					skipCount++
					continue
				}

				// Convert JSON dates to Date objects
				const createdAt = new Date(school.createdAt)
				const updatedAt = new Date(school.updatedAt)

				// Create school in database
				await db.school.create({
					data: {
						id: school.id, // Keep the same ID for consistency
						name: school.name,
						description: school.description || null,
						imageUrl: school.imageUrl || null,
						location: school.location || null,
						website: school.website || null,
						email: school.email || null,
						phone: school.phone || null,
						isActive: school.isActive,
						createdBy: school.createdBy,
						createdAt: createdAt,
						updatedAt: updatedAt
					}
				})

				console.log(`✅ Successfully migrated: ${school.name} (ID: ${school.id})`)
				successCount++

			} catch (error) {
				console.error(`❌ Error migrating school "${school.name}":`, error)
				errorCount++
			}
		}

		console.log('\n🎉 Migration completed!')
		console.log(`✅ Successfully migrated: ${successCount} schools`)
		console.log(`⚠️  Skipped (already exist): ${skipCount} schools`)
		console.log(`❌ Errors: ${errorCount} schools`)

		// Verify the migration
		const finalCount = await db.school.count()
		console.log(`📊 Total schools now in database: ${finalCount}`)

		if (successCount > 0) {
			console.log('\n📋 Next steps:')
			console.log('1. ✅ Schools are now in the database and SchoolPosts should work')
			console.log('2. ✅ School detail pages will continue to work')
			console.log('3. 🔄 Consider updating APIs to use database instead of JSON files')
			console.log('4. 🗑️  Eventually remove JSON files once everything is working')
		}

	} catch (error) {
		console.error('💥 Migration failed:', error)
		process.exit(1)
	}
}

// Run the migration
if (require.main === module) {
	migrateSchoolsToDatabase().catch((error) => {
		console.error('💥 Unhandled error in migration script:', error)
		process.exit(1)
	})
} 