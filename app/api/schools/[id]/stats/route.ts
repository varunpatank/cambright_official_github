import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { SchoolService } from '@/lib/school-service'
import { canEditSchoolStats } from '@/lib/chapter-admin-permissions'

const UpdateStatsSchema = z.object({
  volunteerHours: z.number().min(0).optional(),
  activeMembers: z.number().min(0).optional()
}).refine(
  (data) => data.volunteerHours !== undefined || data.activeMembers !== undefined,
  { message: 'At least one field (volunteerHours or activeMembers) must be provided' }
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schoolId = params.id
    const body = await request.json()
    const validatedData = UpdateStatsSchema.parse(body)
    const { volunteerHours, activeMembers } = validatedData

    console.log(`Stats update request for school ${schoolId}:`, { volunteerHours, activeMembers })

    // Check permissions for each field being updated
    if (volunteerHours !== undefined) {
      const canEditVolunteerHours = await canEditSchoolStats(userId, schoolId, 'volunteerHours')
      if (!canEditVolunteerHours) {
        return NextResponse.json({ 
          error: 'Insufficient permissions to edit volunteer hours. Super admin or chapter super admin access required.' 
        }, { status: 403 })
      }
    }

    if (activeMembers !== undefined) {
      const canEditActiveMembers = await canEditSchoolStats(userId, schoolId, 'activeMembers')
      if (!canEditActiveMembers) {
        return NextResponse.json({ 
          error: 'Insufficient permissions to edit active members. Admin access required for this school.' 
        }, { status: 403 })
      }
    }

    // Check if school exists using SchoolService
    const existingSchool = await SchoolService.getSchoolById(schoolId)

    if (!existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Prepare update data (validation already done by Zod schema)
    const updateData: any = {}
    
    if (volunteerHours !== undefined) {
      updateData.volunteerHours = volunteerHours
    }
    
    if (activeMembers !== undefined) {
      updateData.activeMembers = activeMembers
    }

    console.log(`Updating school ${schoolId} with data:`, updateData)

    // Update the school stats using SchoolService
    const updatedSchool = await SchoolService.updateSchoolStats(schoolId, updateData)

    // Transform response to include asset URLs
    const schoolWithUrls = {
      ...updatedSchool,
      imageUrl: updatedSchool.imageAsset ? `/api/assets/${updatedSchool.imageAsset.key}` : null,
      bannerUrl: updatedSchool.bannerAsset ? `/api/assets/${updatedSchool.bannerAsset.key}` : null
    }

    console.log(`School ${schoolId} updated successfully:`, schoolWithUrls)

    return NextResponse.json(schoolWithUrls)
  } catch (error) {
    console.error('Error updating school stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 