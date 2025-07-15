import { NextRequest, NextResponse } from 'next/server'
import { minioClient } from '@/lib/minio'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
	const url = new URL(req.url)
	const path = url.searchParams.get('path')
	if (!path) return new NextResponse('Missing path', { status: 400 })

	// Path traversal and folder restriction
	if (!path.startsWith('uploads/chapters/videos/') || path.includes('..')) {
		return new NextResponse('Forbidden', { status: 403 })
	}

	// Extract chapter UUID from filename (assume it's in the path)
	const uuidRegex = /([0-9a-fA-F\-]{36})/
	const match = path.match(uuidRegex)
	const chapterId = match ? match[1] : null
	if (!chapterId) return new NextResponse('Invalid path', { status: 400 })

	// Auth check
	const { userId } = auth()
	if (!userId) return new NextResponse('Unauthorized', { status: 401 })

	// DB check: is user enrolled in course for this chapter?
	const chapter = await db.chapter.findUnique({
		where: { id: chapterId },
		include: { course: { select: { enrollment: { where: { userId } } } } }
	})
	if (!chapter) return new NextResponse('Not found', { status: 404 })
	const hasAccess = chapter.course && chapter.course.enrollment.length > 0
	if (!hasAccess) return new NextResponse('Forbidden', { status: 403 })

	const bucket = 'cambright'
	try {
		const stream = await minioClient.getObject(bucket, path)
		return new NextResponse(stream as any, {
			headers: {
				'Content-Type': 'video/mp4',
				'Content-Disposition': `inline; filename="${path.split('/').pop() || 'video.mp4'}"`,
			},
		})
	} catch (err) {
		return new NextResponse('File not found', { status: 404 })
	}
} 