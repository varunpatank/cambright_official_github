import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { hasAdminAccess } from '@/lib/admin'
import { db } from '@/lib/db'

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
    const { volunteerHours, activeMembers } = body

    console.log(`Stats update request for school ${schoolId}:`, { volunteerHours, activeMembers })

    if (volunteerHours === undefined && activeMembers === undefined) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    // Check if user has admin access
    const isAdmin = await hasAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if school exists
    const existingSchool = await db.school.findUnique({
      where: { id: schoolId }
    })

    if (!existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    // Update volunteer hours if provided
    if (volunteerHours !== undefined) {
      if (typeof volunteerHours !== 'number' || volunteerHours < 0) {
        return NextResponse.json({ error: 'Invalid volunteer hours value' }, { status: 400 })
      }
      updateData.volunteerHours = volunteerHours
    }

    // Update active members if provided
    if (activeMembers !== undefined) {
      if (typeof activeMembers !== 'number' || activeMembers < 0) {
        return NextResponse.json({ error: 'Invalid active members value' }, { status: 400 })
      }
      updateData.activeMembers = activeMembers
    }

    console.log(`Updating school ${schoolId} with data:`, updateData)

    // Update the school in the database
    const updatedSchool = await db.school.update({
      where: { id: schoolId },
      data: updateData
    })

    console.log(`School ${schoolId} updated successfully:`, updatedSchool)

    return NextResponse.json(updatedSchool)
  } catch (error) {
    console.error('Error updating school stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 