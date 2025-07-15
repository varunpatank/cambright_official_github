import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin'

// Check if we're in build time (when environment variables might not be available)
function isBuildTime() {
  return process.env.NODE_ENV === 'production' && !process.env.MINIO_URL
}

export async function GET(request: NextRequest) {
  try {
    // Skip during build time
    if (isBuildTime()) {
      return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
    }

    const { 
      assignChapterAdmin, 
      removeChapterAdmin, 
      getAllChapterAdmins,
      hasChapterAdminAccess,
      getChapterAdminsBySchool 
    } = await import('@/lib/minio-chapter-admins')

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')
    
    if (schoolId) {
      // Get chapter admins for specific school
      const admins = await getChapterAdminsBySchool(schoolId)
      return NextResponse.json(admins)
    } else {
      // Get all chapter admins
      const admins = await getAllChapterAdmins()
      return NextResponse.json(admins)
    }
  } catch (error) {
    console.error('Error getting chapter admins:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Skip during build time
    if (isBuildTime()) {
      return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
    }

    const { 
      assignChapterAdmin, 
      removeChapterAdmin, 
      getAllChapterAdmins,
      hasChapterAdminAccess,
      getChapterAdminsBySchool 
    } = await import('@/lib/minio-chapter-admins')

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { schoolId, targetUserId, role } = body

    if (!schoolId || !targetUserId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['chapter_super_admin', 'chapter_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check permissions
    const isSuperAdmin = isAdmin(userId)
    const hasChapterAccess = await hasChapterAdminAccess(userId, schoolId, 'chapter_super_admin')
    
    if (!isSuperAdmin && !hasChapterAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only super admins can assign chapter_super_admin role
    if (role === 'chapter_super_admin' && !isSuperAdmin) {
      return NextResponse.json({ error: 'Only super admins can assign chapter super admin role' }, { status: 403 })
    }

    const result = await assignChapterAdmin({
      schoolId,
      userId: targetUserId,
      role,
      assignedBy: userId
    })

    if (result.success) {
      return NextResponse.json(result.admin)
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('Error assigning chapter admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Skip during build time
    if (isBuildTime()) {
      return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
    }

    const { 
      assignChapterAdmin, 
      removeChapterAdmin, 
      getAllChapterAdmins,
      hasChapterAdminAccess,
      getChapterAdminsBySchool 
    } = await import('@/lib/minio-chapter-admins')

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')
    const targetUserId = searchParams.get('userId')

    if (!schoolId || !targetUserId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Check permissions
    const isSuperAdmin = isAdmin(userId)
    const hasChapterAccess = await hasChapterAdminAccess(userId, schoolId, 'chapter_super_admin')
    
    if (!isSuperAdmin && !hasChapterAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await removeChapterAdmin(schoolId, targetUserId)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('Error removing chapter admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 