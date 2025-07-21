// Performance metrics and monitoring system
// Tracks admin assignment success rates, asset operations, and error rates

interface MetricData {
  timestamp: Date
  value: number
  labels?: Record<string, string>
}

interface OperationMetric {
  operation: string
  success: boolean
  duration: number
  timestamp: Date
  error?: string
  metadata?: Record<string, any>
}

interface AdminAssignmentMetric {
  schoolId: string
  targetUserId: string
  assignedBy: string
  role: string
  success: boolean
  duration: number
  timestamp: Date
  error?: string
}

interface AssetOperationMetric {
  operation: 'upload' | 'download' | 'delete'
  assetKey?: string
  assetType?: string
  fileSize?: number
  success: boolean
  duration: number
  timestamp: Date
  error?: string
}

interface EndpointMetric {
  endpoint: string
  method: string
  statusCode: number
  duration: number
  timestamp: Date
  userId?: string
  error?: string
}

class PerformanceMetrics {
  private adminAssignmentMetrics: AdminAssignmentMetric[] = []
  private assetOperationMetrics: AssetOperationMetric[] = []
  private endpointMetrics: EndpointMetric[] = []
  private operationMetrics: OperationMetric[] = []
  
  private readonly maxMetrics = 10000 // Keep last 10k metrics
  private readonly metricsRetentionHours = 24 // Keep metrics for 24 hours

  // Admin assignment metrics
  trackAdminAssignment(metric: AdminAssignmentMetric): void {
    this.adminAssignmentMetrics.push(metric)
    this.cleanupOldMetrics()
  }

  getAdminAssignmentSuccessRate(timeRangeHours = 24): number {
    const cutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000)
    const recentMetrics = this.adminAssignmentMetrics.filter(m => m.timestamp > cutoff)
    
    if (recentMetrics.length === 0) return 100
    
    const successful = recentMetrics.filter(m => m.success).length
    return (successful / recentMetrics.length) * 100
  }

  getAdminAssignmentStats(timeRangeHours = 24): {
    total: number
    successful: number
    failed: number
    successRate: number
    averageDuration: number
    errorsByType: Record<string, number>
  } {
    const cutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000)
    const recentMetrics = this.adminAssignmentMetrics.filter(m => m.timestamp > cutoff)
    
    const successful = recentMetrics.filter(m => m.success)
    const failed = recentMetrics.filter(m => !m.success)
    
    const errorsByType = failed.reduce((acc, metric) => {
      const errorType = metric.error || 'Unknown'
      acc[errorType] = (acc[errorType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageDuration = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
      : 0

    return {
      total: recentMetrics.length,
      successful: successful.length,
      failed: failed.length,
      successRate: this.getAdminAssignmentSuccessRate(timeRangeHours),
      averageDuration,
      errorsByType
    }
  }

  // Asset operation metrics
  trackAssetOperation(metric: AssetOperationMetric): void {
    this.assetOperationMetrics.push(metric)
    this.cleanupOldMetrics()
  }

  getAssetOperationStats(timeRangeHours = 24): {
    upload: { total: number; successful: number; failed: number; averageDuration: number }
    download: { total: number; successful: number; failed: number; averageDuration: number }
    delete: { total: number; successful: number; failed: number; averageDuration: number }
  } {
    const cutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000)
    const recentMetrics = this.assetOperationMetrics.filter(m => m.timestamp > cutoff)
    
    const operations = ['upload', 'download', 'delete'] as const
    const stats = {} as any

    operations.forEach(operation => {
      const operationMetrics = recentMetrics.filter(m => m.operation === operation)
      const successful = operationMetrics.filter(m => m.success)
      const averageDuration = operationMetrics.length > 0
        ? operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length
        : 0

      stats[operation] = {
        total: operationMetrics.length,
        successful: successful.length,
        failed: operationMetrics.length - successful.length,
        averageDuration
      }
    })

    return stats
  }

  // Endpoint metrics
  trackEndpoint(metric: EndpointMetric): void {
    this.endpointMetrics.push(metric)
    this.cleanupOldMetrics()
  }

  getEndpointErrorRate(endpoint?: string, timeRangeHours = 24): number {
    const cutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000)
    let recentMetrics = this.endpointMetrics.filter(m => m.timestamp > cutoff)
    
    if (endpoint) {
      recentMetrics = recentMetrics.filter(m => m.endpoint === endpoint)
    }
    
    if (recentMetrics.length === 0) return 0
    
    const errors = recentMetrics.filter(m => m.statusCode >= 400).length
    return (errors / recentMetrics.length) * 100
  }

  getEndpointStats(timeRangeHours = 24): Record<string, {
    total: number
    errors: number
    errorRate: number
    averageDuration: number
    statusCodes: Record<number, number>
  }> {
    const cutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000)
    const recentMetrics = this.endpointMetrics.filter(m => m.timestamp > cutoff)
    
    const endpointStats = {} as any

    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`
      
      if (!endpointStats[key]) {
        endpointStats[key] = {
          total: 0,
          errors: 0,
          totalDuration: 0,
          statusCodes: {}
        }
      }

      endpointStats[key].total++
      endpointStats[key].totalDuration += metric.duration
      
      if (metric.statusCode >= 400) {
        endpointStats[key].errors++
      }

      endpointStats[key].statusCodes[metric.statusCode] = 
        (endpointStats[key].statusCodes[metric.statusCode] || 0) + 1
    })

    // Calculate final stats
    Object.keys(endpointStats).forEach(key => {
      const stats = endpointStats[key]
      stats.errorRate = (stats.errors / stats.total) * 100
      stats.averageDuration = stats.totalDuration / stats.total
      delete stats.totalDuration
    })

    return endpointStats
  }

  // General operation metrics
  trackOperation(metric: OperationMetric): void {
    this.operationMetrics.push(metric)
    this.cleanupOldMetrics()
  }

  getOperationStats(operation?: string, timeRangeHours = 24): {
    total: number
    successful: number
    failed: number
    successRate: number
    averageDuration: number
    slowOperations: number
  } {
    const cutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000)
    let recentMetrics = this.operationMetrics.filter(m => m.timestamp > cutoff)
    
    if (operation) {
      recentMetrics = recentMetrics.filter(m => m.operation === operation)
    }
    
    const successful = recentMetrics.filter(m => m.success)
    const slowOperations = recentMetrics.filter(m => m.duration > 1000) // > 1 second
    
    const averageDuration = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
      : 0

    return {
      total: recentMetrics.length,
      successful: successful.length,
      failed: recentMetrics.length - successful.length,
      successRate: recentMetrics.length > 0 ? (successful.length / recentMetrics.length) * 100 : 100,
      averageDuration,
      slowOperations: slowOperations.length
    }
  }

  // System health metrics
  getSystemHealthMetrics(): {
    adminAssignmentHealth: number
    assetOperationHealth: number
    endpointHealth: number
    overallHealth: number
  } {
    const adminHealth = this.getAdminAssignmentSuccessRate(1) // Last hour
    const assetStats = this.getAssetOperationStats(1)
    const endpointErrorRate = this.getEndpointErrorRate(undefined, 1)
    
    // Calculate asset operation health (average success rate across operations)
    const assetOperations = Object.values(assetStats)
    const assetHealth = assetOperations.length > 0
      ? assetOperations.reduce((sum, op) => {
          const successRate = op.total > 0 ? (op.successful / op.total) * 100 : 100
          return sum + successRate
        }, 0) / assetOperations.length
      : 100

    const endpointHealth = 100 - endpointErrorRate

    const overallHealth = (adminHealth + assetHealth + endpointHealth) / 3

    return {
      adminAssignmentHealth: adminHealth,
      assetOperationHealth: assetHealth,
      endpointHealth,
      overallHealth
    }
  }

  // Performance alerts
  getPerformanceAlerts(): Array<{
    type: 'error_rate' | 'slow_operation' | 'system_health'
    severity: 'low' | 'medium' | 'high'
    message: string
    timestamp: Date
  }> {
    const alerts = []
    const now = new Date()

    // Check error rates
    const endpointErrorRate = this.getEndpointErrorRate(undefined, 1)
    if (endpointErrorRate > 10) {
      alerts.push({
        type: 'error_rate' as const,
        severity: endpointErrorRate > 25 ? 'high' as const : 'medium' as const,
        message: `High error rate detected: ${endpointErrorRate.toFixed(1)}%`,
        timestamp: now
      })
    }

    // Check admin assignment success rate
    const adminSuccessRate = this.getAdminAssignmentSuccessRate(1)
    if (adminSuccessRate < 90) {
      alerts.push({
        type: 'error_rate' as const,
        severity: adminSuccessRate < 75 ? 'high' as const : 'medium' as const,
        message: `Low admin assignment success rate: ${adminSuccessRate.toFixed(1)}%`,
        timestamp: now
      })
    }

    // Check for slow operations
    const operationStats = this.getOperationStats(undefined, 1)
    if (operationStats.slowOperations > 5) {
      alerts.push({
        type: 'slow_operation' as const,
        severity: operationStats.slowOperations > 20 ? 'high' as const : 'medium' as const,
        message: `${operationStats.slowOperations} slow operations detected in the last hour`,
        timestamp: now
      })
    }

    // Check overall system health
    const systemHealth = this.getSystemHealthMetrics()
    if (systemHealth.overallHealth < 80) {
      alerts.push({
        type: 'system_health' as const,
        severity: systemHealth.overallHealth < 60 ? 'high' as const : 'medium' as const,
        message: `System health degraded: ${systemHealth.overallHealth.toFixed(1)}%`,
        timestamp: now
      })
    }

    return alerts
  }

  // Cleanup old metrics
  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - this.metricsRetentionHours * 60 * 60 * 1000)
    
    this.adminAssignmentMetrics = this.adminAssignmentMetrics
      .filter(m => m.timestamp > cutoff)
      .slice(-this.maxMetrics)
    
    this.assetOperationMetrics = this.assetOperationMetrics
      .filter(m => m.timestamp > cutoff)
      .slice(-this.maxMetrics)
    
    this.endpointMetrics = this.endpointMetrics
      .filter(m => m.timestamp > cutoff)
      .slice(-this.maxMetrics)
    
    this.operationMetrics = this.operationMetrics
      .filter(m => m.timestamp > cutoff)
      .slice(-this.maxMetrics)
  }

  // Export metrics for external monitoring systems
  exportMetrics(): {
    adminAssignments: AdminAssignmentMetric[]
    assetOperations: AssetOperationMetric[]
    endpoints: EndpointMetric[]
    operations: OperationMetric[]
    summary: {
      adminAssignmentStats: {
        total: number
        successful: number
        failed: number
        successRate: number
        averageDuration: number
        errorsByType: Record<string, number>
      }
      assetOperationStats: {
        upload: { total: number; successful: number; failed: number; averageDuration: number }
        download: { total: number; successful: number; failed: number; averageDuration: number }
        delete: { total: number; successful: number; failed: number; averageDuration: number }
      }
      endpointStats: Record<string, {
        total: number
        errors: number
        errorRate: number
        averageDuration: number
        statusCodes: Record<number, number>
      }>
      systemHealth: {
        adminAssignmentHealth: number
        assetOperationHealth: number
        endpointHealth: number
        overallHealth: number
      }
      alerts: Array<{
        type: 'error_rate' | 'slow_operation' | 'system_health'
        severity: 'low' | 'medium' | 'high'
        message: string
        timestamp: Date
      }>
    }
  } {
    return {
      adminAssignments: [...this.adminAssignmentMetrics],
      assetOperations: [...this.assetOperationMetrics],
      endpoints: [...this.endpointMetrics],
      operations: [...this.operationMetrics],
      summary: {
        adminAssignmentStats: this.getAdminAssignmentStats(),
        assetOperationStats: this.getAssetOperationStats(),
        endpointStats: this.getEndpointStats(),
        systemHealth: this.getSystemHealthMetrics(),
        alerts: this.getPerformanceAlerts()
      }
    }
  }

  // Clear all metrics
  clearMetrics(): void {
    this.adminAssignmentMetrics = []
    this.assetOperationMetrics = []
    this.endpointMetrics = []
    this.operationMetrics = []
  }
}

// Global instance
export const performanceMetrics = new PerformanceMetrics()

// Helper functions for easy tracking
export const trackAdminAssignment = (
  schoolId: string,
  targetUserId: string,
  assignedBy: string,
  role: string,
  success: boolean,
  duration: number,
  error?: string
) => {
  performanceMetrics.trackAdminAssignment({
    schoolId,
    targetUserId,
    assignedBy,
    role,
    success,
    duration,
    timestamp: new Date(),
    error
  })
}

export const trackAssetOperation = (
  operation: 'upload' | 'download' | 'delete',
  success: boolean,
  duration: number,
  options?: {
    assetKey?: string
    assetType?: string
    fileSize?: number
    error?: string
  }
) => {
  performanceMetrics.trackAssetOperation({
    operation,
    success,
    duration,
    timestamp: new Date(),
    ...options
  })
}

export const trackEndpoint = (
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  options?: {
    userId?: string
    error?: string
  }
) => {
  performanceMetrics.trackEndpoint({
    endpoint,
    method,
    statusCode,
    duration,
    timestamp: new Date(),
    ...options
  })
}

export const trackOperation = (
  operation: string,
  success: boolean,
  duration: number,
  options?: {
    error?: string
    metadata?: Record<string, any>
  }
) => {
  performanceMetrics.trackOperation({
    operation,
    success,
    duration,
    timestamp: new Date(),
    ...options
  })
}

// Export types
export type {
  AdminAssignmentMetric,
  AssetOperationMetric,
  EndpointMetric,
  OperationMetric
}