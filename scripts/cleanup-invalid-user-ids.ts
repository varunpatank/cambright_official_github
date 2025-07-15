#!/usr/bin/env tsx

import { db } from '../lib/db'

async function cleanupInvalidUserIds() {
	console.log('🔍 Checking for courses with invalid user IDs...')

	try {
		// Find courses with potentially invalid user IDs
		const allCourses = await db.course.findMany({
			select: {
				id: true,
				userId: true,
				title: true,
				createdAt: true
			}
		})

		const invalidCourses = allCourses.filter(course => {
			const userId = course.userId
			// Check if it's a valid Clerk ID or at least looks reasonable
			return !userId || 
				   typeof userId !== 'string' || 
				   (!userId.startsWith('user_') && userId.length < 10) ||
				   userId === 'drive' ||
				   userId === 'null' ||
				   userId === 'undefined'
		})

		console.log(`📊 Found ${invalidCourses.length} courses with invalid user IDs out of ${allCourses.length} total courses`)

		if (invalidCourses.length > 0) {
			console.log('\n❌ Courses with invalid user IDs:')
			invalidCourses.forEach(course => {
				console.log(`  - Course: "${course.title}" (ID: ${course.id})`)
				console.log(`    Invalid userId: "${course.userId}"`)
				console.log(`    Created: ${course.createdAt}`)
				console.log('')
			})

			console.log('\n⚠️  Options to fix:')
			console.log('1. Delete these courses (if they\'re test data)')
			console.log('2. Assign to a default user')
			console.log('3. Leave as-is (they will show "Tutor" with no profile link)')
		}

		// Also check notes
		const allNotes = await db.note.findMany({
			select: {
				id: true,
				userId: true,
				title: true,
				createdAt: true
			}
		})

		const invalidNotes = allNotes.filter(note => {
			const userId = note.userId
			return !userId || 
				   typeof userId !== 'string' || 
				   (!userId.startsWith('user_') && userId.length < 10) ||
				   userId === 'drive' ||
				   userId === 'null' ||
				   userId === 'undefined'
		})

		console.log(`\n📝 Found ${invalidNotes.length} notes with invalid user IDs out of ${allNotes.length} total notes`)

		if (invalidNotes.length > 0) {
			console.log('\n❌ Notes with invalid user IDs:')
			invalidNotes.forEach(note => {
				console.log(`  - Note: "${note.title}" (ID: ${note.id})`)
				console.log(`    Invalid userId: "${note.userId}"`)
				console.log(`    Created: ${note.createdAt}`)
				console.log('')
			})
		}

		console.log('\n✅ Cleanup scan complete!')
		
	} catch (error) {
		console.error('❌ Error during cleanup scan:', error)
	}
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
	cleanupInvalidUserIds()
		.then(() => {
			console.log('👍 Scan finished')
			process.exit(0)
		})
		.catch((error) => {
			console.error('💥 Fatal error:', error)
			process.exit(1)
		})
}

export { cleanupInvalidUserIds } 