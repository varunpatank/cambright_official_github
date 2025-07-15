#!/usr/bin/env tsx
// Migration script to move existing tutors to database
// Run with: pnpm tsx scripts/migrate-tutors.ts

import { PrismaClient } from '@prisma/client'
import { defaultIds } from '../app/(dashboard)/(routes)/users'
import { TutorRole } from '@prisma/client'

const db = new PrismaClient()

async function migrateTutors() {
	console.log('🚀 Starting tutor migration...\n')

	try {
		// Get existing tutor IDs from environment and defaults
		const envTutorIds = process.env.NEXT_PUBLIC_TUTOR_IDS?.trim()
		
		let existingTutorIds: string[]
		
		if (envTutorIds) {
			existingTutorIds = envTutorIds
				.split(",")
				.map(id => id.trim())
				.filter(id => id.length > 0)
			console.log(`📄 Found ${existingTutorIds.length} tutors in environment variable`)
		} else {
			existingTutorIds = defaultIds.tutorIds
			console.log(`📄 Using ${existingTutorIds.length} default tutors from configuration`)
		}

		if (existingTutorIds.length === 0) {
			console.log('❌ No tutors found to migrate')
			return
		}

		console.log('📋 Tutors to migrate:')
		existingTutorIds.forEach((id, index) => {
			console.log(`   ${index + 1}. ${id}`)
		})
		console.log()

		const results = {
			successful: [] as string[],
			failed: [] as { userId: string; error: string }[],
			skipped: [] as string[]
		}

		// System user ID for migration
		const systemUserId = 'system_migration'

		for (const userId of existingTutorIds) {
			try {
				console.log(`🔄 Processing ${userId}...`)

				// Check if already exists
				const existing = await db.tutor.findUnique({
					where: { userId }
				})

				if (existing) {
					console.log(`   ⏭️  Already exists (${existing.isActive ? 'active' : 'inactive'})`)
					results.skipped.push(userId)
					continue
				}

				// Create new tutor with audit log
				await db.tutor.create({
					data: {
						userId,
						addedBy: systemUserId,
						role: TutorRole.TUTOR,
						auditLogs: {
							create: {
								action: 'MIGRATED',
								performedBy: systemUserId,
								details: {
									source: envTutorIds ? 'environment_variable' : 'default_config',
									migration_date: new Date().toISOString()
								}
							}
						}
					}
				})

				console.log(`   ✅ Successfully migrated`)
				results.successful.push(userId)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.log(`   ❌ Failed: ${errorMessage}`)
				results.failed.push({
					userId,
					error: errorMessage
				})
			}
		}

		// Print summary
		console.log('\n📊 Migration Summary:')
		console.log(`   ✅ Successful: ${results.successful.length}`)
		console.log(`   ⏭️  Skipped: ${results.skipped.length}`)
		console.log(`   ❌ Failed: ${results.failed.length}`)
		console.log(`   📊 Total: ${existingTutorIds.length}`)

		if (results.failed.length > 0) {
			console.log('\n❌ Failed migrations:')
			results.failed.forEach(({ userId, error }) => {
				console.log(`   - ${userId}: ${error}`)
			})
		}

		if (results.successful.length > 0) {
			console.log('\n🎉 Migration completed successfully!')
			console.log('📝 Next steps:')
			console.log('   1. Test the admin dashboard at /admin/tutors')
			console.log('   2. Verify tutors can access tutor features')
			console.log('   3. Consider removing NEXT_PUBLIC_TUTOR_IDS from environment')
		}

	} catch (error) {
		console.error('💥 Migration failed:', error)
		process.exit(1)
	} finally {
		await db.$disconnect()
	}
}

// Run migration if called directly
if (require.main === module) {
	migrateTutors()
		.then(() => {
			console.log('\n✅ Migration script completed')
			process.exit(0)
		})
		.catch((error) => {
			console.error('💥 Migration script failed:', error)
			process.exit(1)
		})
}

export { migrateTutors } 