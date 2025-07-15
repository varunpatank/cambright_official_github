// Migration API endpoint for existing tutors
// Migrates tutors from environment variables/defaults to database

import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { TutorService } from "@/lib/tutor-service"
import { requireAdmin } from "@/lib/admin"
import { defaultIds } from "@/app/(dashboard)/(routes)/users"

/**
 * POST /api/admin/tutors/migrate
 * Migrate existing tutors from environment variables to database
 */
export async function POST(req: Request) {
	try {
		const { userId } = auth()
		requireAdmin(userId)

		// Get existing tutor IDs from environment and defaults
		const envTutorIds = process.env.NEXT_PUBLIC_TUTOR_IDS?.trim()
		
		let existingTutorIds: string[]
		
		if (envTutorIds) {
			existingTutorIds = envTutorIds
				.split(",")
				.map(id => id.trim())
				.filter(id => id.length > 0)
		} else {
			existingTutorIds = defaultIds.tutorIds
		}

		if (existingTutorIds.length === 0) {
			return NextResponse.json({
				success: false,
				message: 'No tutors found to migrate'
			})
		}

		// Migrate tutors
		const migrationResults = await TutorService.migrateExistingTutors(
			existingTutorIds,
			userId!
		)

		return NextResponse.json({
			success: true,
			message: 'Migration completed',
			results: {
				total: existingTutorIds.length,
				successful: migrationResults.successful.length,
				failed: migrationResults.failed.length,
				skipped: migrationResults.skipped.length,
				details: migrationResults
			}
		})
	} catch (error) {
		console.error("Error migrating tutors:", error)
		
		if (error instanceof Error && error.message === 'Admin access required') {
			return new NextResponse("Unauthorized", { status: 401 })
		}
		
		return new NextResponse("Internal Error", { status: 500 })
	}
} 