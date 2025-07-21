// Metrics middleware for automatic endpoint tracking
// Automatically tracks all API endpoint performance and error rates

import { NextRequest, NextResponse } from 'next/server'
import { trackEndpoint } from '@/lib/performance-metrics'

export function withMetricsTracking(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const start = Date.now()
    const endpoint = new URL(request.url).pathname
    const method = request.method
    
    // Extract user ID from headers if available (from Clerk)
    const userId = request.headers.get('x-user-id') || undefined
    
    try {
      const response = await handler(request, ...args)
      const duration = Date.now() - start
      
      // Track successful request
      trackEndpoint(endpoint, method, response.status, duration, { userId })
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Track failed request
      trackEndpoint(endpoint, method, 500, duration, {
        userId,
        error: errorMessage
      })
      
      // Re-throw the error
      throw error
    }
  }
}

// Helper function to create tracked API handlers
export function createTrackedHandler(handlers: {
  GET?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
  POST?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
  PUT?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
  DELETE?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
  PATCH?: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
}) {
  const trackedHandlers: any = {}
  
  Object.entries(handlers).forEach(([method, handler]) => {
    if (handler) {
      trackedHandlers[method] = withMetricsTracking(handler)
    }
  })
  
  return trackedHandlers
}

// Middleware for tracking admin operations specifically
export function withAdminOperationTracking<T>(
  operation: string,
  handler: (...args: any[]) => Promise<T>
) {
  return async (...args: any[]): Promise<T> => {
    const start = Date.now()
    
    try {
      const result = await handler(...args)
      const duration = Date.now() - start
      
      // Import here to avoid circular dependencies
      const { trackOperation } = await import('@/lib/performance-metrics')
      trackOperation(operation, true, duration)
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Import here to avoid circular dependencies
      const { trackOperation } = await import('@/lib/performance-metrics')
      trackOperation(operation, false, duration, { error: errorMessage })
      
      throw error
    }
  }
}

// Middleware for tracking asset operations
export function withAssetOperationTracking<T>(
  operation: 'upload' | 'download' | 'delete',
  handler: (...args: any[]) => Promise<T>,
  getMetadata?: (...args: any[]) => { assetKey?: string; assetType?: string; fileSize?: number }
) {
  return async (...args: any[]): Promise<T> => {
    const start = Date.now()
    const metadata = getMetadata ? getMetadata(...args) : {}
    
    try {
      const result = await handler(...args)
      const duration = Date.now() - start
      
      // Import here to avoid circular dependencies
      const { trackAssetOperation } = await import('@/lib/performance-metrics')
      trackAssetOperation(operation, true, duration, metadata)
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Import here to avoid circular dependencies
      const { trackAssetOperation } = await import('@/lib/performance-metrics')
      trackAssetOperation(operation, false, duration, {
        ...metadata,
        error: errorMessage
      })
      
      throw error
    }
  }
}