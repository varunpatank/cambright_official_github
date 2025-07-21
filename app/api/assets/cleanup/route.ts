import { NextRequest, NextResponse } from 'next/server'
import { assetManager } from '@/lib/asset-manager'
import { currentProfile } from '@/lib/current-profile'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const profile = await currentProfile()
    if (!profile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin permissions - only admins can run cleanup
    const hasAdminAccess = isAdmin(profile.userId)
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Run cleanup for orphaned assets
    const cleanedCount = await assetManager.cleanupOrphanedAssets()

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      cleanedAssetsCount: cleanedCount
    })

  } catch (error) {
    console.error('Asset cleanup error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Failed to cleanup')) {
        return NextResponse.json(
          { error: 'Failed to cleanup orphaned assets' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}