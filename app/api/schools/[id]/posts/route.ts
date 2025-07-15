import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hasAdminAccess } from '@/lib/admin'

const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url().optional(),
  postType: z.enum(['ANNOUNCEMENT', 'EVENT']).default('ANNOUNCEMENT')
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = params.id

    // Get school posts (public endpoint)
    const posts = await db.schoolPost.findMany({
      where: {
        schoolId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching school posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const schoolId = params.id
    
    // Check if user has admin access or chapter admin access to this school
    const isGlobalAdmin = await hasAdminAccess(userId)
    
    // TODO: Add chapter admin check once we have the function available
    // const hasChapterAccess = await hasChapterAdminAccess(userId, schoolId)
    
    if (!isGlobalAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Verify school exists
    const school = await db.school.findUnique({
      where: { id: schoolId }
    })

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validatedData = CreatePostSchema.parse(body)

    // Get user info for author details
    const { clerkClient } = await import('@clerk/nextjs/server')
    const user = await clerkClient.users.getUser(userId)
    const authorName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || 'Admin'

    const post = await db.schoolPost.create({
      data: {
        ...validatedData,
        schoolId,
        authorId: userId,
        authorName
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating school post:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
} 