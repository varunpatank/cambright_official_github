// Performance health check endpoint
// Provides detailed performance health status for monitoring systems

import { NextRequest, NextResponse } from 'next/server'
import { performanceMetrics } from '@/lib/performance-metrics'
import { queryMonitor, checkDatabaseHealth } from '@/lib/query-performance-monitor'
import { enhancedCache } from '@/lib/enhanced-cache'
import { ChapterAdminService } from '@/lib/chapter-admin-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'
    
    // Get system health metrics
    const systemHealth = performanceMetrics.getSystemHealthMetrics()
    const alerts = performanceMetrics.getPerformanceAlerts()
    
    // Get database health
    const dbHealth = await checkDatabaseHealth()
    
    // Get query performance stats
    const queryStats = queryMonitor.getQueryStats()
    
    // Get cache stats
    const cacheStats = await enhancedCache.getCacheStats()
    
    // Get admin stats
    const adminStats = await ChapterAdminService.getAdminStats()
    
    // Determine overall health status
    const isHealthy = systemHealth.overallHealth > 70 && dbHealth.healthy
    const status = isHealthy ? 'healthy' : 'degraded'
    
    const response = {
      status,
      timestamp: new Date().toISOString(),
      health: {
        overall: systemHealth.overallHealth,
        adminAssignments: systemHealth.adminAssignmentHealth,
        assetOperations: systemHealth.assetOperationHealth,
        endpoints: systemHealth.endpointHealth,
      },
      database: {
        healthy: dbHealth.healthy,
        responseTime: dbHealth.responseTime,
        ...(dbHealth.error && { error: dbHealth.error }),
      },
      cache: {
        implementation: cacheStats.implementation,
        redisAvailable: cacheStats.isRedisAvailable,
      },
      queries: {
        total: queryStats.total,
        successful: queryStats.successful,
        failed: queryStats.failed,
        successRate: queryStats.successRate,
        averageTime: queryStats.averageQueryTime,
        slowQueries: queryStats.slowQueries,
      },
      adminSystem: {
        totalAdmins: adminStats.totalAdmins,
        schoolsWithAdmins: adminStats.schoolsWithAdmins,
        totalActiveSchools: adminStats.totalActiveSchools,
        adminsByRole: adminStats.adminsByRole,
      },
      alerts: alerts.map(alert => ({
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
      })),
      ...(detailed && {
        detailed: {
          adminAssignmentStats: performanceMetrics.getAdminAssignmentStats(),
          assetOperationStats: performanceMetrics.getAssetOperationStats(),
          endpointStats: performanceMetrics.getEndpointStats(),
          slowQueries: queryMonitor.getSlowQueries().slice(-10),
          failedQueries: queryMonitor.getFailedQueries().slice(-10),
        }
      })
    }
    
    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': status,
        'X-Health-Score': systemHealth.overallHealth.toString(),
      },
    })
  } catch (error) {
    console.error('Error in performance health check:', error)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// Simple health ping
export async function HEAD() {
  try {
    const systemHealth = performanceMetrics.getSystemHealthMetrics()
    const dbHealth = await checkDatabaseHealth()
    
    const isHealthy = systemHealth.overallHealth > 70 && dbHealth.healthy
    
    return new NextResponse(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        'X-Health-Score': systemHealth.overallHealth.toString(),
        'X-Database-Healthy': dbHealth.healthy.toString(),
        'X-Response-Time': (dbHealth.responseTime || 0).toString(),
      },
    })
  } catch (error) {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Health-Error': 'true',
      },
    })
  }
}