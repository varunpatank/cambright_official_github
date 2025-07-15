// Admin API for tutor management
// Handles CRUD operations for tutors with proper authorization

import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { TutorService } from "@/lib/tutor-service"
import { hasAdminAccess, requireAdmin } from "@/lib/admin"
import { TutorRole } from "@prisma/client"
import { z } from "zod"

// Validation schemas
const addTutorSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	role: z.nativeEnum(TutorRole).optional().default(TutorRole.TUTOR)
})

const updateTutorSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
	role: z.nativeEnum(TutorRole),
	action: z.enum(['update_role', 'activate', 'deactivate'])
})

/**
 * GET /api/admin/tutors
 * Get all tutors with pagination and filtering
 */
export async function GET(req: Request) {
	try {
		const { userId } = auth()
		requireAdmin(userId)

		const { searchParams } = new URL(req.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')
		const filter = searchParams.get('filter') // 'active', 'inactive', 'all'
		const role = searchParams.get('role') as TutorRole | null

		// Get tutors with filters
		const tutors = await TutorService.getAllTutors()
		
		// Apply filters
		let filteredTutors = tutors
		
		if (filter === 'active') {
			filteredTutors = tutors.filter(t => t.isActive)
		} else if (filter === 'inactive') {
			filteredTutors = tutors.filter(t => !t.isActive)
		}
		
		if (role) {
			filteredTutors = filteredTutors.filter(t => t.role === role)
		}

		// Pagination
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		const paginatedTutors = filteredTutors.slice(startIndex, endIndex)

		// Get stats
		const stats = await TutorService.getTutorStats()

		return NextResponse.json({
			tutors: paginatedTutors,
			pagination: {
				current: page,
				limit,
				total: filteredTutors.length,
				pages: Math.ceil(filteredTutors.length / limit)
			},
			stats
		})
	} catch (error) {
		console.error("Error fetching tutors:", error)
		
		if (error instanceof Error && error.message === 'Admin access required') {
			return new NextResponse("Unauthorized", { status: 401 })
		}
		
		return new NextResponse("Internal Error", { status: 500 })
	}
}

/**
 * POST /api/admin/tutors
 * Add a new tutor
 */
export async function POST(req: Request) {
	try {
		const { userId } = auth()
		requireAdmin(userId)

		const body = await req.json()
		const validatedData = addTutorSchema.parse(body)

		const newTutor = await TutorService.addTutor(
			validatedData.userId,
			userId!,
			validatedData.role
		)

		return NextResponse.json({
			success: true,
			tutor: newTutor,
			message: 'Tutor added successfully'
		})
	} catch (error) {
		console.error("Error adding tutor:", error)
		
		if (error instanceof Error) {
			if (error.message === 'Admin access required') {
				return new NextResponse("Unauthorized", { status: 401 })
			}
			
			if (error.message.includes('already an active tutor')) {
				return NextResponse.json(
					{ error: error.message },
					{ status: 400 }
				)
			}
		}
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid input", details: error.errors },
				{ status: 400 }
			)
		}
		
		return new NextResponse("Internal Error", { status: 500 })
	}
}

/**
 * PATCH /api/admin/tutors
 * Update tutor (role, status)
 */
export async function PATCH(req: Request) {
	try {
		const { userId } = auth()
		requireAdmin(userId)

		const body = await req.json()
		const validatedData = updateTutorSchema.parse(body)

		let result

		switch (validatedData.action) {
			case 'update_role':
				result = await TutorService.updateTutorRole(
					validatedData.userId,
					validatedData.role,
					userId!
				)
				break
			
			case 'deactivate':
				await TutorService.removeTutor(validatedData.userId, userId!)
				result = { message: 'Tutor deactivated successfully' }
				break
			
			case 'activate':
				result = await TutorService.addTutor(
					validatedData.userId,
					userId!,
					validatedData.role
				)
				break
			
			default:
				return NextResponse.json(
					{ error: 'Invalid action' },
					{ status: 400 }
				)
		}

		return NextResponse.json({
			success: true,
			result,
			message: `Tutor ${validatedData.action} completed successfully`
		})
	} catch (error) {
		console.error("Error updating tutor:", error)
		
		if (error instanceof Error) {
			if (error.message === 'Admin access required') {
				return new NextResponse("Unauthorized", { status: 401 })
			}
			
			return NextResponse.json(
				{ error: error.message },
				{ status: 400 }
			)
		}
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid input", details: error.errors },
				{ status: 400 }
			)
		}
		
		return new NextResponse("Internal Error", { status: 500 })
	}
} 