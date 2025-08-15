import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total users
    const totalUsers = await db.userModel.count()
    
    // Get active users (users who have activity in the last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const activeUsers = await db.userModel.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Get total schools
    const totalSchools = await db.school.count({
      where: {
        isActive: true
      }
    })

    // Get user's schools
    const userSchools = await db.chapterAdmin.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            location: true
          }
        }
      }
    })

    // Get user's XP (from UserModel)
    const userProfile = await db.userModel.findUnique({
      where: {
        userId: userId
      },
      select: {
        XP: true,
        name: true,
        imageUrl: true,
        email: true
      }
    })

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalSchools,
      userSchools: userSchools.map(admin => admin.school),
      userProfile: userProfile || { XP: 0, name: 'User', imageUrl: null, email: '' }
    })
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
