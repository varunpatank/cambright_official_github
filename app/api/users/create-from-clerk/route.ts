import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user already exists in our database
    const existingUser = await db.userModel.findUnique({
      where: { userId }
    })

    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists',
        user: existingUser 
      })
    }

    // Get user data from Clerk
    const clerkUser = await clerkClient.users.getUser(userId)
    
    // Create new user in our database
    const newUser = await db.userModel.create({
      data: {
        userId: clerkUser.id,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.username || 'Anonymous',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        imageUrl: clerkUser.imageUrl || '',
        XP: 0,
        followers: 0,
        following: 0,
        biog: '',
        // Add any other default fields you need
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('Error creating user from Clerk:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
