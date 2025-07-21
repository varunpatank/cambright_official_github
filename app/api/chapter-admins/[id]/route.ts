import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { hasAdminAccess } from '@/lib/admin'
import { ChapterAdminService } from '@/lib/chapter-admin-service'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminId = params.id

    if (!adminId) {
      return NextResponse.json({ 
        error: 'Admin ID is required' 
      }, { status: 400 })
    }

    // Get the admin assignment to check permissions
    const adminAssignment = await ChapterAdminService.getAdminById(adminId)
    
    if (!adminAssignment) {
      return NextResponse.json({ 
        error: 'Chapter admin assignment not found' 
      }, { status: 404 })
    }

    // Check permissions
    const isSystemAdmin = hasAdminAccess(userId)
    const hasChapterSuperAdminAccess = await ChapterAdminService.hasPermission(
      userId, 
      adminAssignment.schoolId, 
      'CHAPTER_SUPER_ADMIN' as any
    )
    
    if (!isSystemAdmin && !hasChapterSuperAdminAccess) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Super admin or chapter super admin access required.' 
      }, { status: 403 })
    }

    await ChapterAdminService.removeAdmin(adminId, userId)

    return NextResponse.json({ 
      success: true,
      message: 'Chapter admin assignment removed successfully'
    })
  } catch (error) {
    console.error('Error removing chapter admin:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}