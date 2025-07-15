import { NextRequest, NextResponse } from 'next/server'
import { isTutor } from '@/lib/tutor'
import { TutorService } from '@/lib/tutor-service'

// Make this route dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')

		if (!userId) {
			return NextResponse.json({ isTutor: false })
		}

		// Warm cache on first call to ensure better performance
		// This is a fire-and-forget operation
		TutorService.warmCache().catch(error => {
			console.warn('Failed to warm cache during tutor status check:', error)
		})

		const tutorStatus = await isTutor(userId)
		return NextResponse.json({ isTutor: tutorStatus })
	} catch (error) {
		console.error('Error checking tutor status:', error)
		return NextResponse.json({ isTutor: false }, { status: 500 })
	}
} 