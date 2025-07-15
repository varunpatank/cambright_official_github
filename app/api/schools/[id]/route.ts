import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { hasAdminAccess } from '@/lib/admin'
import { db } from '@/lib/db'

const UpdateSchoolSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  volunteerHours: z.number().min(0).optional(),
  activeMembers: z.number().min(0).optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const school = await db.school.findUnique({
      where: { id: params.id }
    })
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(school)
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
    console.log(`Updating school ${params.id} with data:`, body)
    
    const validatedData = UpdateSchoolSchema.parse(body)

    const school = await db.school.update({
      where: { id: params.id },
      data: validatedData
    })

    console.log(`School ${params.id} updated successfully:`, school)
    return NextResponse.json(school)
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

    const school = await db.school.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(school)
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

    await db.school.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'School deleted successfully' })
  } catch (error) {
    console.error('Error deleting school:', error)
    return NextResponse.json(
      { error: 'Failed to delete school' },
      { status: 500 }
    )
  }
} 