import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    // Search users using Clerk
    const userList = await clerkClient.users.getUserList({
      query,
      limit: 10
    })

    // Format user data for response
    const formattedUsers = userList.data.map(user => ({
      id: user.id,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Unknown',
      email: user.emailAddresses[0]?.emailAddress || 'No email',
      imageUrl: user.imageUrl,
      username: user.username
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 