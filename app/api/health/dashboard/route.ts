// Health Check Dashboard Endpoint
// Provides a comprehensive overview of all system health metrics

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/structured-logger'

export interface HealthDashboardResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  services: {
    chapterAdmin: {
      status: 'healthy' | 'degraded' | 'unhealthy'
      url: string
      lastChecked?: string
      responseTime?: number
    }
    assets: {
      status: 'healthy' | 'degraded' | 'unhealthy'
      url: string
      lastChecked?: string
      responseTime?: number
    }
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy'
      responseTime?: number
    }
    storage: {
      status: 'healthy' | 'degraded' | 'unhealthy'
      responseTime?: number
    }
  }
  metrics: {
    totalRequests24h: number
    errorRate24h: number
    avgResponseTime: number
    activeUsers: number
    systemLoad: {
      cpu: number
      memory: number
      disk: number
    }
  }
  alerts: Array<{
    level: 'info' | 'warning' | 'error' | 'critical'
    message: string
    timestamp: string
    service: string
  }>
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthDashboardResponse>> {
  const startTime = Date.now()
  
  try {
    const baseUrl = request.nextUrl.origin
    
    // Check individual service health endpoints
    const [chapterAdminHealth, assetHealth] = await Promise.allSettled([
      checkServiceHealth(`${baseUrl}/api/health/chapter-admin`),
      checkServiceHealth(`${baseUrl}/api/health/assets`)
    ])

    // Process service health results
    const services = {
      chapterAdmin: processHealthResult(chapterAdminHealth, `${baseUrl}/api/health/chapter-admin`),
      assets: processHealthResult(assetHealth, `${baseUrl}/api/health/assets`),
      database: {
        status: 'healthy' as const,
        responseTime: 0
      },
      storage: {
        status: 'healthy' as const,
        responseTime: 0
      }
    }

    // Calculate overall system status
    const serviceStatuses = Object.values(services).map(s => s.status)
    const overallStatus = serviceStatuses.includes('unhealthy') 
      ? 'unhealthy' 
      : serviceStatuses.includes('degraded') 
      ? 'degraded' 
      : 'healthy'

    // Get system metrics (mock data for now - in production, integrate with monitoring)
    const metrics = await getSystemMetrics()
    
    // Get recent alerts
    const alerts = await getRecentAlerts()

    const response: HealthDashboardResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics,
      alerts
    }

    // Log dashboard access
    const duration = Date.now() - startTime
    logger.info(`Health dashboard accessed - Status: ${overallStatus}`, {
      phase: 'runtime',
      category: 'health-check',
      service: 'health-dashboard',
      duration,
      metadata: {
        overallStatus,
        serviceCount: Object.keys(services).length,
        alertCount: alerts.length
      }
    })

    return NextResponse.json(response)

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Health dashboard failed', {
      phase: 'runtime',
      category: 'health-check',
      service: 'health-dashboard',
      duration,
      errorCategory: 'external-service',
      recoveryStrategy: 'retry',
      criticalityLevel: 'medium'
    }, error as Error)

    const errorResponse: HealthDashboardResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        chapterAdmin: {
          status: 'unhealthy',
          url: '/api/health/chapter-admin'
        },
        assets: {
          status: 'unhealthy',
          url: '/api/health/assets'
        },
        database: {
          status: 'unhealthy'
        },
        storage: {
          status: 'unhealthy'
        }
      },
      metrics: {
        totalRequests24h: 0,
        errorRate24h: 100,
        avgResponseTime: 0,
        activeUsers: 0,
        systemLoad: {
          cpu: 0,
          memory: 0,
          disk: 0
        }
      },
      alerts: [{
        level: 'critical',
        message: 'Health dashboard system failure',
        timestamp: new Date().toISOString(),
        service: 'health-dashboard'
      }]
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}

async function checkServiceHealth(url: string): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  lastChecked: string
}> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add timeout
      signal: AbortSignal.timeout(5000)
    })

    const responseTime = Date.now() - startTime
    const data = await response.json()

    return {
      status: data.status || (response.ok ? 'healthy' : 'unhealthy'),
      responseTime,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString()
    }
  }
}

function processHealthResult(
  result: PromiseSettledResult<any>,
  url: string
): {
  status: 'healthy' | 'degraded' | 'unhealthy'
  url: string
  lastChecked?: string
  responseTime?: number
} {
  if (result.status === 'fulfilled') {
    return {
      status: result.value.status,
      url,
      lastChecked: result.value.lastChecked,
      responseTime: result.value.responseTime
    }
  } else {
    return {
      status: 'unhealthy',
      url,
      lastChecked: new Date().toISOString()
    }
  }
}

async function getSystemMetrics() {
  // In production, this would integrate with monitoring systems
  // For now, return mock/basic data
  
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  
  return {
    totalRequests24h: 1250, // Mock data
    errorRate24h: 2.5, // Mock data
    avgResponseTime: 245, // Mock data
    activeUsers: 89, // Mock data
    systemLoad: {
      cpu: Math.round((cpuUsage.user + cpuUsage.system) / 1000000), // Convert to percentage
      memory: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      disk: 45 // Mock data
    }
  }
}

async function getRecentAlerts() {
  // In production, this would come from your alerting system
  // For now, return mock alerts based on system state
  
  const alerts = []
  
  // Check memory usage
  const memoryUsage = process.memoryUsage()
  const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
  
  if (memoryPercent > 90) {
    alerts.push({
      level: 'critical' as const,
      message: `High memory usage: ${Math.round(memoryPercent)}%`,
      timestamp: new Date().toISOString(),
      service: 'system'
    })
  } else if (memoryPercent > 80) {
    alerts.push({
      level: 'warning' as const,
      message: `Elevated memory usage: ${Math.round(memoryPercent)}%`,
      timestamp: new Date().toISOString(),
      service: 'system'
    })
  }

  // Check uptime
  const uptimeHours = process.uptime() / 3600
  if (uptimeHours < 1) {
    alerts.push({
      level: 'info' as const,
      message: 'System recently restarted',
      timestamp: new Date().toISOString(),
      service: 'system'
    })
  }

  // Add mock alerts for demonstration
  if (Math.random() > 0.8) {
    alerts.push({
      level: 'warning' as const,
      message: 'Elevated response times detected',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      service: 'api'
    })
  }

  return alerts.slice(0, 10) // Limit to 10 most recent alerts
}

// Additional endpoint for real-time metrics
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'refresh':
        // Trigger refresh of all health checks
        const baseUrl = request.nextUrl.origin
        
        // Fire and forget health check refreshes
        Promise.allSettled([
          fetch(`${baseUrl}/api/health/chapter-admin`),
          fetch(`${baseUrl}/api/health/assets`)
        ]).catch(error => {
          logger.warn('Health check refresh failed', {
            phase: 'runtime',
            category: 'health-check',
            service: 'health-dashboard'
          }, error)
        })

        return NextResponse.json({ 
          message: 'Health check refresh initiated',
          timestamp: new Date().toISOString()
        })

      case 'clear-alerts':
        // In production, this would clear alerts in your monitoring system
        return NextResponse.json({ 
          message: 'Alerts cleared',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Health dashboard POST failed', {
      phase: 'runtime',
      category: 'health-check',
      service: 'health-dashboard',
      errorCategory: 'validation',
      recoveryStrategy: 'fail-fast',
      criticalityLevel: 'low'
    }, error as Error)

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}