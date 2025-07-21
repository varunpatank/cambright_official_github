import { NextRequest, NextResponse } from 'next/server'
import { getCurrentPhase, isBuildTime } from '@/lib/build-runtime-detector'
import { validateServiceEnvironment } from '@/lib/environment-validator'
import { getRuntimeState, getHealthStatus } from '@/lib/runtime-state-manager'

/**
 * GET /api/health/ready - Readiness probe endpoint
 * 
 * This endpoint indicates whether the application is ready to serve traffic.
 * Used by container orchestration systems to determine when to route traffic.
 */
export async function GET(request: NextRequest) {
  try {
    // Skip readiness checks during build time
    if (isBuildTime()) {
      return NextResponse.json(
        {
          status: 'build-time',
          ready: false,
          message: 'Build phase - readiness checks skipped',
          phase: 'build',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    const phase = getCurrentPhase()
    const healthStatus = getHealthStatus()
    const runtimeState = getRuntimeState()

    // Check if server is ready to serve traffic
    const isReady = healthStatus.canServeTraffic && 
                   (healthStatus.status === 'healthy' || healthStatus.status === 'degraded')

    // Validate optional services and provide graceful degradation
    const serviceChecks = await validateOptionalServices()
    
    const response = {
      status: isReady ? 'ready' : 'not-ready',
      ready: isReady,
      phase: healthStatus.phase,
      canServeTraffic: healthStatus.canServeTraffic,
      serverReady: healthStatus.serverReady,
      services: serviceChecks,
      initializationTime: healthStatus.initializationTime,
      retryAfter: healthStatus.retryAfter,
      timestamp: new Date().toISOString(),
      warnings: runtimeState.warnings.length > 0 ? runtimeState.warnings : undefined
    }

    // Return appropriate status code
    const statusCode = isReady ? 200 : 503

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('Readiness probe error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        ready: false,
        message: 'Readiness check failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Validates optional services and provides graceful degradation information
 */
async function validateOptionalServices() {
  const services = ['redis', 'minio', 'database', 'clerk']
  const results: Record<string, any> = {}

  for (const service of services) {
    try {
      const validation = validateServiceEnvironment(service)
      results[service] = {
        available: validation.isAvailable,
        canDegrade: validation.canDegrade,
        status: validation.isAvailable ? 'healthy' : (validation.canDegrade ? 'degraded' : 'unavailable'),
        missingVars: validation.missingVars,
        warnings: validation.warnings
      }
    } catch (error) {
      results[service] = {
        available: false,
        canDegrade: false,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  return results
}