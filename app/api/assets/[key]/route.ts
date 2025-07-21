import { NextRequest, NextResponse } from 'next/server'
import { assetManager } from '@/lib/asset-manager'

interface RouteParams {
  params: {
    key: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { key } = params

    // Validate key parameter
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid asset key' },
        { status: 400 }
      )
    }

    // Basic key format validation (should be timestamp_hex format)
    const keyPattern = /^[a-z0-9]+_[a-f0-9]{64}$/
    if (!keyPattern.test(key)) {
      return NextResponse.json(
        { error: 'Invalid asset key format' },
        { status: 400 }
      )
    }

    // Retrieve asset from AssetManager
    const assetInfo = await assetManager.getAsset(key)

    // Create response with appropriate headers
    const response = new NextResponse(assetInfo.stream as any)

    // Set content headers
    response.headers.set('Content-Type', assetInfo.mimeType)
    response.headers.set('Content-Length', assetInfo.fileSize.toString())
    response.headers.set('Content-Disposition', `inline; filename="${assetInfo.fileName}"`)

    // Set caching headers for performance optimization
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable') // 1 year
    response.headers.set('ETag', `"${key}"`)

    // Set security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    // Only allow inline display for images and videos, force download for others
    const inlineTypes = ['image/', 'video/', 'audio/', 'text/plain', 'application/pdf']
    const isInlineType = inlineTypes.some(type => assetInfo.mimeType.startsWith(type))
    
    if (!isInlineType) {
      response.headers.set('Content-Disposition', `attachment; filename="${assetInfo.fileName}"`)
    }

    // Handle conditional requests (304 Not Modified)
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === `"${key}"`) {
      return new NextResponse(null, { status: 304 })
    }

    return response

  } catch (error) {
    console.error('Asset retrieval error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Asset not found')) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }

      if (error.message.includes('Failed to retrieve')) {
        return NextResponse.json(
          { error: 'Failed to retrieve asset' },
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

// Handle HEAD requests for metadata
export async function HEAD(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { key } = params

    // Validate key parameter
    if (!key || typeof key !== 'string') {
      return new NextResponse(null, { status: 400 })
    }

    // Basic key format validation
    const keyPattern = /^[a-z0-9]+_[a-f0-9]{64}$/
    if (!keyPattern.test(key)) {
      return new NextResponse(null, { status: 400 })
    }

    // Get asset metadata
    const metadata = await assetManager.getAssetMetadata(key)

    // Create response with headers only
    const response = new NextResponse(null)

    // Set content headers
    response.headers.set('Content-Type', metadata.mimeType)
    response.headers.set('Content-Length', metadata.fileSize.toString())
    response.headers.set('Content-Disposition', `inline; filename="${metadata.fileName}"`)

    // Set caching headers
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('ETag', `"${key}"`)

    // Set security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')

    return response

  } catch (error) {
    console.error('Asset HEAD request error:', error)

    if (error instanceof Error && error.message.includes('Asset not found')) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(null, { status: 500 })
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

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { key } = params

    // Validate key parameter
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid asset key' },
        { status: 400 }
      )
    }

    // Basic key format validation
    const keyPattern = /^[a-z0-9]+_[a-f0-9]{64}$/
    if (!keyPattern.test(key)) {
      return NextResponse.json(
        { error: 'Invalid asset key format' },
        { status: 400 }
      )
    }

    // Check authentication - only authenticated users can delete assets
    const { currentProfile } = await import('@/lib/current-profile')
    const profile = await currentProfile()
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get asset metadata to check ownership
    const metadata = await assetManager.getAssetMetadata(key)
    
    // Check if user has permission to delete this asset
    // Users can only delete their own assets, or admins can delete any asset
    const { isAdmin } = await import('@/lib/admin')
    const hasAdminAccess = isAdmin(profile.userId)
    
    if (!hasAdminAccess && metadata.uploadedBy !== profile.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own assets' },
        { status: 403 }
      )
    }

    // Delete the asset
    await assetManager.deleteAsset(key)

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    })

  } catch (error) {
    console.error('Asset deletion error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Asset not found')) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }

      if (error.message.includes('Failed to delete')) {
        return NextResponse.json(
          { error: 'Failed to delete asset' },
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

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}