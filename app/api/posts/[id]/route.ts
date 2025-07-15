import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hasAdminAccess } from '@/lib/admin'

const UpdatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  imageUrl: z.string().url().optional(),
  postType: z.enum(['ANNOUNCEMENT', 'EVENT']).optional(),
  isActive: z.boolean().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    const post = await db.schoolPost.findUnique({
      where: { 
        id: postId,
        isActive: true 
      },
      include: {
        school: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const postId = params.id

    // Get the existing post
    const existingPost = await db.schoolPost.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check permissions - either global admin or post author
    const isGlobalAdmin = await hasAdminAccess(userId)
    const isAuthor = existingPost.authorId === userId
    
    // TODO: Add chapter admin check once we have the function available
    // const hasChapterAccess = await hasChapterAdminAccess(userId, existingPost.schoolId)
    
    if (!isGlobalAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = UpdatePostSchema.parse(body)

    const updatedPost = await db.schoolPost.update({
      where: { id: postId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const postId = params.id

    // Get the existing post
    const existingPost = await db.schoolPost.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check permissions - either global admin or post author
    const isGlobalAdmin = await hasAdminAccess(userId)
    const isAuthor = existingPost.authorId === userId
    
    // TODO: Add chapter admin check once we have the function available
    // const hasChapterAccess = await hasChapterAdminAccess(userId, existingPost.schoolId)
    
    if (!isGlobalAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Soft delete the post
    await db.schoolPost.update({
      where: { id: postId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
} 