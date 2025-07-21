// Performance metrics API endpoint
// Provides access to system performance metrics and health status

import { NextRequest, NextResponse } from 'next/server'
import { performanceMetrics } from '@/lib/performance-metrics'
import { queryMonitor } from '@/lib/query-performance-monitor'
import { enhancedCache } from '@/lib/enhanced-cache'
import { checkDatabaseHealth, getConnectionPoolStats } from '@/lib/query-performance-monitor'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = parseInt(searchParams.get('timeRange') || '24')
    const format = searchParams.get('format') || 'json'
    const includeDetails = searchParams.get('details') === 'true'

    // Get performance metrics
    const metrics = performanceMetrics.exportMetrics()
    
    // Get database health
    const dbHealth = await checkDatabaseHealth()
    
    // Get connection pool stats
    const poolStats = await getConnectionPoolStats()
    
    // Get query performance stats
    const queryStats = queryMonitor.getQueryStats()
    
    // Get cache stats
    const cacheStats = await enhancedCache.getCacheStats()

    const response = {
      timestamp: new Date().toISOString(),
      timeRange: `${timeRange}h`,
      system: {
        database: dbHealth,
        connectionPool: poolStats,
        cache: cacheStats,
      },
      performance: {
        queries: queryStats,
        adminAssignments: metrics.summary.adminAssignmentStats,
        assetOperations: metrics.summary.assetOperationStats,
        endpoints: metrics.summary.endpointStats,
        systemHealth: metrics.summary.systemHealth,
      },
      alerts: metrics.summary.alerts,
      ...(includeDetails && {
        details: {
          adminAssignments: metrics.adminAssignments.slice(-100), // Last 100
          assetOperations: metrics.assetOperations.slice(-100),
          endpoints: metrics.endpoints.slice(-100),
          operations: metrics.operations.slice(-100),
          slowQueries: queryMonitor.getSlowQueries().slice(-50), // Last 50 slow queries
          failedQueries: queryMonitor.getFailedQueries().slice(-50), // Last 50 failed queries
        }
      })
    }

    if (format === 'prometheus') {
      // Convert to Prometheus format
      const prometheusMetrics = convertToPrometheusFormat(response)
      return new NextResponse(prometheusMetrics, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        },
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD() {
  try {
    const systemHealth = performanceMetrics.getSystemHealthMetrics()
    const dbHealth = await checkDatabaseHealth()
    
    const isHealthy = systemHealth.overallHealth > 70 && dbHealth.healthy
    
    return new NextResponse(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        'X-Health-Score': systemHealth.overallHealth.toString(),
        'X-Database-Health': dbHealth.healthy ? 'healthy' : 'unhealthy',
      },
    })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}

function convertToPrometheusFormat(data: any): string {
  const lines: string[] = []
  
  // System health metrics
  lines.push('# HELP system_health_score Overall system health score (0-100)')
  lines.push('# TYPE system_health_score gauge')
  lines.push(`system_health_score ${data.performance.systemHealth.overallHealth}`)
  
  lines.push('# HELP admin_assignment_success_rate Admin assignment success rate (0-100)')
  lines.push('# TYPE admin_assignment_success_rate gauge')
  lines.push(`admin_assignment_success_rate ${data.performance.adminAssignments.successRate}`)
  
  lines.push('# HELP database_response_time Database response time in milliseconds')
  lines.push('# TYPE database_response_time gauge')
  lines.push(`database_response_time ${data.system.database.responseTime || 0}`)
  
  lines.push('# HELP query_average_time Average query execution time in milliseconds')
  lines.push('# TYPE query_average_time gauge')
  lines.push(`query_average_time ${data.performance.queries.averageQueryTime}`)
  
  lines.push('# HELP slow_queries_total Total number of slow queries')
  lines.push('# TYPE slow_queries_total counter')
  lines.push(`slow_queries_total ${data.performance.queries.slowQueries}`)
  
  lines.push('# HELP failed_queries_total Total number of failed queries')
  lines.push('# TYPE failed_queries_total counter')
  lines.push(`failed_queries_total ${data.performance.queries.failed}`)
  
  // Asset operation metrics
  const assetOps = data.performance.assetOperations
  Object.entries(assetOps).forEach(([operation, stats]: [string, any]) => {
    lines.push(`# HELP asset_${operation}_total Total ${operation} operations`)
    lines.push(`# TYPE asset_${operation}_total counter`)
    lines.push(`asset_${operation}_total ${stats.total}`)
    
    lines.push(`# HELP asset_${operation}_success_total Successful ${operation} operations`)
    lines.push(`# TYPE asset_${operation}_success_total counter`)
    lines.push(`asset_${operation}_success_total ${stats.successful}`)
    
    lines.push(`# HELP asset_${operation}_duration_ms Average ${operation} duration in milliseconds`)
    lines.push(`# TYPE asset_${operation}_duration_ms gauge`)
    lines.push(`asset_${operation}_duration_ms ${stats.averageDuration}`)
  })
  
  return lines.join('\n') + '\n'
}