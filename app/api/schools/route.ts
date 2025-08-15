import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { hasAdminAccess } from '@/lib/admin'
import { SchoolService } from '@/lib/school-service'
import { db } from '@/lib/db'

const CreateSchoolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  imageAssetId: z.string().optional(),
  bannerAssetId: z.string().optional(),
  volunteerHours: z.number().min(0).default(0),
  activeMembers: z.number().min(0).default(0)
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || undefined

    // Use SchoolService to get schools from database
    const result = await SchoolService.getSchools({
      page,
      limit,
      search
    })

    // Transform response to include asset URLs
    const schoolsWithUrls = result.schools.map(school => ({
      ...school,
      imageUrl: school.imageAsset ? `/api/assets/${school.imageAsset.key}` : null,
      bannerUrl: school.bannerAsset ? `/api/assets/${school.bannerAsset.key}` : null
    }))

    return NextResponse.json({
      schools: schoolsWithUrls,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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
    const validatedData = CreateSchoolSchema.parse(body)

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

    // Use SchoolService to create school with asset relations
    const school = await SchoolService.createSchool({
      ...validatedData,
      createdBy: userId
    })

    // Transform response to include asset URLs
    const schoolWithUrls = {
      ...school,
      imageUrl: school.imageAsset ? `/api/assets/${school.imageAsset.key}` : null,
      bannerUrl: school.bannerAsset ? `/api/assets/${school.bannerAsset.key}` : null
    }

    return NextResponse.json(schoolWithUrls, { status: 201 })
  } catch (error) {
    console.error('Error creating school:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    )
  }
} 