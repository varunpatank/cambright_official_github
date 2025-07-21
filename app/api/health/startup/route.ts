import { NextRequest, NextResponse } from 'next/server'
import { getCurrentPhase, isBuildTime } from '@/lib/build-runtime-detector'
import { getRuntimeState, getHealthStatus } from '@/lib/runtime-state-manager'
import { validateEnvironment } from '@/lib/environment-validator'

/**
 * GET /api/health/startup - Startup probe endpoint
 * 
 * This endpoint indicates whether the application has completed its startup sequence.
 * Used by container orchestration systems during the initial startup period.
 * Should return success only when the application is fully initialized.
 */
export async function GET(request: NextRequest) {
  try {
    // Skip startup checks during build time
    if (isBuildTime()) {
      return NextResponse.json(
        {
          status: 'build-time',
          started: false,
          message: 'Build phase - startup checks not applicable',
          phase: 'build',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    const phase = getCurrentPhase()
    const healthStatus = getHealthStatus()
    const runtimeState = getRuntimeState()

    // Startup is complete when server is ready or in a degraded but functional state
    const isStarted = runtimeState.phase === 'runtime' || 
                     (runtimeState.phase === 'build' && healthStatus.status === 'degraded')

    // Get detailed startup information
    const startupInfo = await getStartupInformation()

    const response = {
      status: isStarted ? 'started' : 'starting',
      started: isStarted,
      phase: healthStatus.phase,
      serverReady: healthStatus.serverReady,
      initializationTime: healthStatus.initializationTime,
      startupInfo,
      retryAfter: healthStatus.retryAfter,
      timestamp: new Date().toISOString(),
      errors: runtimeState.errors.length > 0 ? runtimeState.errors : undefined,
      warnings: runtimeState.warnings.length > 0 ? runtimeState.warnings : undefined
    }

    // Return appropriate status code
    let statusCode: number
    if (isStarted) {
      statusCode = 200
    } else if (runtimeState.phase === 'unknown') {
      statusCode = 500
    } else {
      statusCode = 503 // Still starting
    }

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('Startup probe error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        started: false,
        message: 'Startup check failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Gets detailed startup information including environment validation and health checks
 */
async function getStartupInformation() {
  const runtimeState = getRuntimeState()
  const phase = getCurrentPhase()
  
  // Environment validation
  const detailedPhase = phase === 'build' ? 'build' : 
                       phase === 'runtime' ? 'runtime-server' : 
                       'runtime-server' // default fallback
  const envValidation = validateEnvironment(detailedPhase)
  
  // Startup timing information
  const startupTiming = {
    startTime: new Date(runtimeState.initializationStartTime).toISOString(),
    endTime: runtimeState.initializationEndTime 
      ? new Date(runtimeState.initializationEndTime).toISOString() 
      : null,
    duration: runtimeState.initializationEndTime 
      ? runtimeState.initializationEndTime - runtimeState.initializationStartTime 
      : Date.now() - runtimeState.initializationStartTime
  }

  // Health check summary
  const healthCheckSummary = runtimeState.healthCheckResults ? {
    overallStatus: runtimeState.healthCheckResults.overallStatus,
    totalChecks: runtimeState.healthCheckResults.totalChecks,
    successCount: runtimeState.healthCheckResults.successCount,
    failedCount: runtimeState.healthCheckResults.failedCount,
    warningCount: runtimeState.healthCheckResults.warningCount,
    skippedCount: runtimeState.healthCheckResults.skippedCount,
    totalDuration: runtimeState.healthCheckResults.totalDuration
  } : null

  // Service availability summary
  const serviceAvailability = {
    database: envValidation.missingRequired.includes('DATABASE_URL') ? 'unavailable' : 'available',
    auth: envValidation.missingRequired.some(v => v.includes('CLERK')) ? 'unavailable' : 'available',
    cache: envValidation.missingOptional.includes('REDIS_URL') ? 'degraded' : 'available',
    storage: envValidation.missingOptional.some(v => v.startsWith('MINIO_')) ? 'degraded' : 'available'
  }

  return {
    timing: startupTiming,
    environment: {
      isValid: envValidation.isValid,
      missingRequired: envValidation.missingRequired,
      missingOptional: envValidation.missingOptional,
      warnings: envValidation.warnings
    },
    healthChecks: healthCheckSummary,
    services: serviceAvailability,
    phase: runtimeState.phase
  }
}