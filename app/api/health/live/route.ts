import { NextRequest, NextResponse } from 'next/server'
import { getCurrentPhase, isBuildTime } from '@/lib/build-runtime-detector'
import { getRuntimeState, getHealthStatus } from '@/lib/runtime-state-manager'

/**
 * GET /api/health/live - Liveness probe endpoint
 * 
 * This endpoint indicates whether the application container is alive and functioning.
 * Used by container orchestration systems to determine if the container should be restarted.
 * This should be a lightweight check that doesn't depend on external services.
 */
export async function GET(request: NextRequest) {
  try {
    // Even during build time, the process is "alive"
    if (isBuildTime()) {
      return NextResponse.json(
        {
          status: 'alive',
          live: true,
          message: 'Build phase - process is alive',
          phase: 'build',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    }

    const phase = getCurrentPhase()
    const healthStatus = getHealthStatus()
    const runtimeState = getRuntimeState()

    // Liveness check - process is alive if it can respond
    // Don't fail liveness for service issues, only for critical process problems
    const isAlive = runtimeState.phase !== 'unknown' || 
                   !runtimeState.errors.some(error => 
                     error.includes('FATAL') || 
                     error.includes('CRITICAL') ||
                     error.includes('OUT_OF_MEMORY')
                   )

    // Perform basic process health checks
    const processChecks = await performBasicProcessChecks()

    const response = {
      status: isAlive ? 'alive' : 'dead',
      live: isAlive,
      phase: healthStatus.phase,
      processId: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      checks: processChecks,
      timestamp: new Date().toISOString(),
      criticalErrors: runtimeState.errors.filter(error => 
        error.includes('FATAL') || 
        error.includes('CRITICAL') ||
        error.includes('OUT_OF_MEMORY')
      )
    }

    // Return appropriate status code
    const statusCode = isAlive ? 200 : 503

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('Liveness probe error:', error)
    
    // If we can't even handle the liveness check, the process might be in trouble
    return NextResponse.json(
      {
        status: 'error',
        live: false,
        message: 'Liveness check failed - process may be unhealthy',
        error: error instanceof Error ? error.message : String(error),
        processId: process.pid,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Performs basic process health checks that don't depend on external services
 */
async function performBasicProcessChecks() {
  const checks = []

  try {
    // Memory usage check
    const memUsage = process.memoryUsage()
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    const memLimitMB = 512 // Reasonable limit for most containers
    
    checks.push({
      name: 'memory_usage',
      status: memUsageMB < memLimitMB ? 'healthy' : 'warning',
      message: `Heap usage: ${memUsageMB}MB`,
      details: {
        heapUsed: memUsageMB,
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      }
    })

    // Event loop lag check (basic)
    const start = process.hrtime.bigint()
    await new Promise(resolve => setImmediate(resolve))
    const lag = Number(process.hrtime.bigint() - start) / 1000000 // Convert to milliseconds
    
    checks.push({
      name: 'event_loop_lag',
      status: lag < 100 ? 'healthy' : (lag < 500 ? 'warning' : 'unhealthy'),
      message: `Event loop lag: ${lag.toFixed(2)}ms`,
      details: { lagMs: lag }
    })

    // Process uptime check
    const uptimeSeconds = process.uptime()
    checks.push({
      name: 'process_uptime',
      status: 'healthy',
      message: `Process uptime: ${Math.round(uptimeSeconds)}s`,
      details: { uptimeSeconds }
    })

  } catch (error) {
    checks.push({
      name: 'process_checks',
      status: 'error',
      message: 'Failed to perform process health checks',
      error: error instanceof Error ? error.message : String(error)
    })
  }

  return checks
}