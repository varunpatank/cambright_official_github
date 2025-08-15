import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { hasAdminAccess } from '@/lib/admin'
import { ChapterAdminService } from '@/lib/chapter-admin-service'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')
    const targetUserId = searchParams.get('userId')
    
    if (schoolId) {
      // Get chapter admins for specific school - This should be publicly viewable
      // so students can see who their school administrators are
      const admins = await ChapterAdminService.getAdminsBySchool(schoolId)
      return NextResponse.json({ admins })
    } else if (targetUserId) {
      // Allow users to query their own admin assignments, or admins to query others
      if (targetUserId !== userId && !hasAdminAccess(userId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      // Get schools where user is a chapter admin
      const adminAssignments = await ChapterAdminService.getSchoolsByUser(targetUserId)
      return NextResponse.json({ admins: adminAssignments })
    } else {
      // Check if user has admin access for general queries
      if (!hasAdminAccess(userId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      // Get all schools with their admin assignments
      const schoolsWithAdmins = await ChapterAdminService.getAllSchoolsWithAdmins()
      return NextResponse.json({ schools: schoolsWithAdmins })
    }
  } catch (error) {
    console.error('Error getting chapter admins:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const AssignChapterAdminSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  targetUserId: z.string().min(1, 'Target user ID is required'),
  role: z.enum(['CHAPTER_ADMIN', 'CHAPTER_SUPER_ADMIN'], {
    errorMap: () => ({ message: 'Role must be CHAPTER_ADMIN or CHAPTER_SUPER_ADMIN' })
  })
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = AssignChapterAdminSchema.parse(body)
    const { schoolId, targetUserId, role } = validatedData

    // Check if user has admin access
    const isSystemAdmin = hasAdminAccess(userId)
    const hasChapterSuperAdminAccess = await ChapterAdminService.hasPermission(
      userId, 
      schoolId, 
      'CHAPTER_SUPER_ADMIN' as any
    )
    
    if (!isSystemAdmin && !hasChapterSuperAdminAccess) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Super admin or chapter super admin access required.' 
      }, { status: 403 })
    }

    // Only system admins can assign CHAPTER_SUPER_ADMIN role
    if (role === 'CHAPTER_SUPER_ADMIN' && !isSystemAdmin) {
      return NextResponse.json({ 
        error: 'Only system administrators can assign chapter super admin role' 
      }, { status: 403 })
    }

    // Validate school exists
    const schoolExists = await ChapterAdminService.validateSchoolExists(schoolId)
    if (!schoolExists) {
      return NextResponse.json({ 
        error: 'School not found or inactive' 
      }, { status: 404 })
    }

    const admin = await ChapterAdminService.assignAdmin(
      schoolId,
      targetUserId,
      role as any,
      userId
    )

    return NextResponse.json({ 
      success: true,
      admin: {
        id: admin.id,
        userId: admin.userId,
        schoolId: admin.schoolId,
        role: admin.role,
        assignedBy: admin.assignedBy,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        school: admin.school
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error assigning chapter admin:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: adminId' 
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