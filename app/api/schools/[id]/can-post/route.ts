import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { canCreateSchoolPost } from '@/lib/chapter-admin-permissions'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ canPost: false })
    }

    const schoolId = params.id
    
    // Use the proper permission checking function
    const canPost = await canCreateSchoolPost(userId, schoolId)
    
    return NextResponse.json({ canPost })
  } catch (error) {
    console.error('Error checking post permissions:', error)
    return NextResponse.json({ canPost: false })
  }
}
