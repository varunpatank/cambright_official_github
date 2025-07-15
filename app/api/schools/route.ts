import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { hasAdminAccess } from '@/lib/admin'
import { db } from '@/lib/db'

const CreateSchoolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  volunteerHours: z.number().min(0).default(0),
  activeMembers: z.number().min(0).default(0)
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause for search
    let whereClause: any = {}
    
    if (query) {
      whereClause = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ]
      }
    }

    // Filter only active schools for public access
    whereClause.isActive = true

    // Get total count for pagination
    const totalCount = await db.school.count({ where: whereClause })

    // Get paginated schools
    const schools = await db.school.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      schools,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
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

    const school = await db.school.create({
      data: {
        ...validatedData,
        createdBy: userId
      }
    })

    return NextResponse.json(school, { status: 201 })
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