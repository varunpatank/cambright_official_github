import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { hasAdminAccess } from '@/lib/admin'
import { SchoolService } from '@/lib/school-service'
import { db } from '@/lib/db'

const UpdateSchoolSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  imageAssetId: z.string().optional(),
  bannerAssetId: z.string().optional(),
  isActive: z.boolean().optional(),
  volunteerHours: z.number().min(0).optional(),
  activeMembers: z.number().min(0).optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get school from database using SchoolService
    const school = await SchoolService.getSchoolById(params.id)
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Transform response to include asset URLs
    const schoolWithUrls = {
      ...school,
      imageUrl: school.imageAsset ? `/api/assets/${school.imageAsset.key}` : null,
      bannerUrl: school.bannerAsset ? `/api/assets/${school.bannerAsset.key}` : null
    }

    return NextResponse.json(schoolWithUrls)
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json(
      { error: 'Failed to fetch school' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const isAdmin = await hasAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = UpdateSchoolSchema.parse(body)

    // Check if school exists first
    const existingSchool = await SchoolService.getSchoolById(params.id)
    if (!existingSchool) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // If asset IDs are provided, verify they exist in the database
    if (validatedData.imageAssetId) {
      const imageAsset = await db.assets.findUnique({
        where: { id: validatedData.imageAssetId }
      })
      if (!imageAsset) {
        return NextResponse.json(
          { error: `Image asset not found: ${validatedData.imageAssetId}` },
          { status: 400 }
        )
      }
    }

    if (validatedData.bannerAssetId) {
      const bannerAsset = await db.assets.findUnique({
        where: { id: validatedData.bannerAssetId }
      })
      if (!bannerAsset) {
        return NextResponse.json(
          { error: `Banner asset not found: ${validatedData.bannerAssetId}` },
          { status: 400 }
        )
      }
    }

    // Use SchoolService to update school with asset relations
    const school = await SchoolService.updateSchool(params.id, validatedData)

    // Transform response to include asset URLs
    const schoolWithUrls = {
      ...school,
      imageUrl: school.imageAsset ? `/api/assets/${school.imageAsset.key}` : null,
      bannerUrl: school.bannerAsset ? `/api/assets/${school.bannerAsset.key}` : null
    }

    console.log(`School ${params.id} updated successfully:`, schoolWithUrls)
    return NextResponse.json(schoolWithUrls)
  } catch (error) {
    console.error('Error updating school:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update school' },
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

    const isAdmin = await hasAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = UpdateSchoolSchema.parse(body)

    // Check if school exists first
    const existingSchool = await SchoolService.getSchoolById(params.id)
    if (!existingSchool) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Use SchoolService to update school with asset relations
    const school = await SchoolService.updateSchool(params.id, validatedData)

    // Transform response to include asset URLs
    const schoolWithUrls = {
      ...school,
      imageUrl: school.imageAsset ? `/api/assets/${school.imageAsset.key}` : null,
      bannerUrl: school.bannerAsset ? `/api/assets/${school.bannerAsset.key}` : null
    }

    return NextResponse.json(schoolWithUrls)
  } catch (error) {
    console.error('Error updating school:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update school' },
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

    const isAdmin = await hasAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if school exists first
    const existingSchool = await SchoolService.getSchoolById(params.id)
    if (!existingSchool) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Use SchoolService to delete school (soft delete)
    await SchoolService.deleteSchool(params.id)

    return NextResponse.json({ message: 'School deleted successfully' })
  } catch (error) {
    console.error('Error deleting school:', error)
    return NextResponse.json(
      { error: 'Failed to delete school' },
      { status: 500 }
    )
  }
} 