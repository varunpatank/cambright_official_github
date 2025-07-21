import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { canCreateSchoolPost } from '@/lib/chapter-admin-permissions'

const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageAssetKey: z.string().optional(),
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
      include: {
        imageAsset: {
          select: {
            key: true,
            fileName: true,
            mimeType: true
          }
        }
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
    
    // Check if user can create posts for this school
    const canCreatePost = await canCreateSchoolPost(userId, schoolId)
    
    if (!canCreatePost) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Chapter admin access required for this school.' },
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
      },
      include: {
        imageAsset: {
          select: {
            key: true,
            fileName: true,
            mimeType: true
          }
        }
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