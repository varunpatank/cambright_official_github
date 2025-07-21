import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hasAdminAccess } from '@/lib/admin'
import { canDeleteSchoolPost } from '@/lib/chapter-admin-permissions'
import { assetManager } from '@/lib/asset-manager'

const UpdatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  imageAssetKey: z.string().optional(),
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
        },
        imageAsset: {
          select: {
            key: true,
            fileName: true,
            mimeType: true
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

    // Check permissions - global admin, post author, or chapter admin with delete permissions
    const isGlobalAdmin = await hasAdminAccess(userId)
    const isAuthor = existingPost.authorId === userId
    const hasChapterDeleteAccess = await canDeleteSchoolPost(userId, existingPost.schoolId)
    
    if (!isGlobalAdmin && !isAuthor && !hasChapterDeleteAccess) {
      return NextResponse.json(
        { error: 'Permission denied. Requires global admin, post author, or chapter super admin access.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = UpdatePostSchema.parse(body)

    // If imageAssetKey is being changed, delete the old asset
    if (validatedData.imageAssetKey !== undefined && existingPost.imageAssetKey && validatedData.imageAssetKey !== existingPost.imageAssetKey) {
      try {
        await assetManager.deleteAsset(existingPost.imageAssetKey)
      } catch (assetError) {
        console.warn(`Failed to delete old asset ${existingPost.imageAssetKey} for post ${postId}:`, assetError)
        // Continue with post update even if asset deletion fails
      }
    }

    const updatedPost = await db.schoolPost.update({
      where: { id: postId },
      data: {
        ...validatedData,
        updatedAt: new Date()
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

    // Check permissions - global admin, post author, or chapter admin with delete permissions
    const isGlobalAdmin = await hasAdminAccess(userId)
    const isAuthor = existingPost.authorId === userId
    const hasChapterDeleteAccess = await canDeleteSchoolPost(userId, existingPost.schoolId)
    
    if (!isGlobalAdmin && !isAuthor && !hasChapterDeleteAccess) {
      return NextResponse.json(
        { error: 'Permission denied. Requires global admin, post author, or chapter super admin access.' },
        { status: 403 }
      )
    }

    // Delete associated asset if it exists
    if (existingPost.imageAssetKey) {
      try {
        await assetManager.deleteAsset(existingPost.imageAssetKey)
      } catch (assetError) {
        console.warn(`Failed to delete asset ${existingPost.imageAssetKey} for post ${postId}:`, assetError)
        // Continue with post deletion even if asset deletion fails
      }
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