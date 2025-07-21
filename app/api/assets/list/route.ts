import { NextRequest, NextResponse } from 'next/server'
import { AssetType } from '@prisma/client'
import { assetManager } from '@/lib/asset-manager'
import { currentProfile } from '@/lib/current-profile'
import { isAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const profile = await currentProfile()
    if (!profile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin permissions - only admins can list all assets
    const hasAdminAccess = isAdmin(profile.userId)
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const assetTypeParam = searchParams.get('assetType')
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    // Validate and set defaults
    const page = pageParam ? parseInt(pageParam, 10) : 1
    const limit = limitParam ? parseInt(limitParam, 10) : 50

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Validate asset type if provided
    let assetType: AssetType | undefined
    if (assetTypeParam) {
      if (!Object.values(AssetType).includes(assetTypeParam as AssetType)) {
        return NextResponse.json(
          { error: 'Invalid asset type' },
          { status: 400 }
        )
      }
      assetType = assetTypeParam as AssetType
    }

    // Get assets list
    let result
    if (assetType) {
      result = await assetManager.listAssets(assetType, undefined, page, limit)
    } else {
      // If no asset type specified, we need to implement a general list method
      // For now, let's return all asset types
      const allTypes = Object.values(AssetType)
      const allResults = await Promise.all(
        allTypes.map(type => assetManager.listAssets(type, undefined, 1, 10))
      )
      
      result = {
        assetsByType: allTypes.reduce((acc, type, index) => {
          acc[type] = allResults[index]
          return acc
        }, {} as Record<AssetType, any>),
        page: 1,
        limit: 10
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Asset listing error:', error)

    if (error instanceof Error) {
      if (error.message.includes('Failed to list')) {
        return NextResponse.json(
          { error: 'Failed to list assets' },
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
export async function POST() {
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