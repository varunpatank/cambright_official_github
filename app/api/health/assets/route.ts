// Asset Integrity Health Check Endpoint
// Provides detailed health monitoring for the asset management system

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { minioClient } from '@/lib/minio'
import { logger } from '@/lib/structured-logger'
import { withTimeout } from '@/lib/api-error-handler'

export interface AssetHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  summary: {
    totalAssets: number
    activeAssets: number
    orphanedDbRecords: number
    orphanedFiles: number
    integrityIssues: number
    recentUploads24h: number
  }
  details: {
    assetTypeDistribution: Record<string, number>
    sizeDistribution: {
      small: number  // < 1MB
      medium: number // 1MB - 10MB
      large: number  // > 10MB
    }
    recentErrors: Array<{
      assetKey: string
      error: string
      timestamp: string
    }>
    performanceMetrics: {
      avgUploadTime: number
      avgDownloadTime: number
      storageUtilization: number
    }
  }
  recommendations: string[]
}

const ASSET_HEALTH_TIMEOUT = 10000 // 10 seconds for asset checks

export async function GET(request: NextRequest): Promise<NextResponse<AssetHealthResponse>> {
  const startTime = Date.now()
  
  try {
    // Run asset health checks
    const [
      assetStats,
      integrityCheck,
      performanceMetrics,
      recentErrors
    ] = await Promise.allSettled([
      withTimeout(getAssetStatistics(), ASSET_HEALTH_TIMEOUT, 'asset-statistics'),
      withTimeout(checkAssetIntegrity(), ASSET_HEALTH_TIMEOUT, 'asset-integrity'),
      withTimeout(getPerformanceMetrics(), ASSET_HEALTH_TIMEOUT, 'performance-metrics'),
      withTimeout(getRecentErrors(), ASSET_HEALTH_TIMEOUT, 'recent-errors')
    ])

    // Process results
    const stats = assetStats.status === 'fulfilled' ? assetStats.value : getDefaultStats()
    const integrity = integrityCheck.status === 'fulfilled' ? integrityCheck.value : getDefaultIntegrity()
    const performance = performanceMetrics.status === 'fulfilled' ? performanceMetrics.value : getDefaultPerformance()
    const errors = recentErrors.status === 'fulfilled' ? recentErrors.value : []

    // Calculate overall health status
    const totalIssues = integrity.orphanedDbRecords + integrity.orphanedFiles + integrity.integrityIssues
    const status = totalIssues > 10 ? 'unhealthy' : totalIssues > 5 ? 'degraded' : 'healthy'

    // Generate recommendations
    const recommendations = generateRecommendations(stats, integrity, performance, errors)

    const response: AssetHealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      summary: {
        totalAssets: stats.totalAssets,
        activeAssets: stats.activeAssets,
        orphanedDbRecords: integrity.orphanedDbRecords,
        orphanedFiles: integrity.orphanedFiles,
        integrityIssues: integrity.integrityIssues,
        recentUploads24h: stats.recentUploads24h
      },
      details: {
        assetTypeDistribution: stats.assetTypeDistribution,
        sizeDistribution: stats.sizeDistribution,
        recentErrors: errors,
        performanceMetrics: performance
      },
      recommendations
    }

    // Log health check results
    const duration = Date.now() - startTime
    logger.info(`Asset health check completed in ${duration}ms - Status: ${status}`, {
      phase: 'runtime',
      category: 'health-check',
      service: 'asset-manager',
      duration,
      metadata: {
        status,
        totalIssues,
        totalAssets: stats.totalAssets,
        activeAssets: stats.activeAssets
      }
    })

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503
    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Asset health check failed', {
      phase: 'runtime',
      category: 'health-check',
      service: 'asset-manager',
      duration,
      errorCategory: 'external-service',
      recoveryStrategy: 'retry',
      criticalityLevel: 'high'
    }, error as Error)

    const errorResponse: AssetHealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      summary: {
        totalAssets: 0,
        activeAssets: 0,
        orphanedDbRecords: 0,
        orphanedFiles: 0,
        integrityIssues: 1,
        recentUploads24h: 0
      },
      details: {
        assetTypeDistribution: {},
        sizeDistribution: { small: 0, medium: 0, large: 0 },
        recentErrors: [{
          assetKey: 'health-check-system',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }],
        performanceMetrics: {
          avgUploadTime: 0,
          avgDownloadTime: 0,
          storageUtilization: 0
        }
      },
      recommendations: ['Fix health check system errors', 'Check system connectivity']
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}

async function getAssetStatistics() {
  // Get basic asset statistics
  const totalAssets = await db.assets.count()
  const activeAssets = await db.assets.count({ where: { isActive: true } })
  
  // Get recent uploads (last 24 hours)
  const recentUploads24h = await db.assets.count({
    where: {
      isActive: true,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  })

  // Get asset type distribution
  const assetTypeStats = await db.assets.groupBy({
    by: ['type'],
    where: { isActive: true },
    _count: { type: true }
  })

  const assetTypeDistribution = assetTypeStats.reduce((acc, stat) => {
    acc[stat.type] = stat._count.type
    return acc
  }, {} as Record<string, number>)

  // Get size distribution
  const assets = await db.assets.findMany({
    where: { isActive: true },
    select: { size: true }
  })

  const sizeDistribution = assets.reduce(
    (acc, asset) => {
      const sizeMB = asset.size / (1024 * 1024)
      if (sizeMB < 1) acc.small++
      else if (sizeMB <= 10) acc.medium++
      else acc.large++
      return acc
    },
    { small: 0, medium: 0, large: 0 }
  )

  return {
    totalAssets,
    activeAssets,
    recentUploads24h,
    assetTypeDistribution,
    sizeDistribution
  }
}

async function checkAssetIntegrity() {
  const bucketName = process.env.MINIO_BUCKET_NAME || 'cambright-assets'
  
  // Check for orphaned database records (assets in DB but not in MinIO)
  const dbAssets = await db.assets.findMany({
    where: { isActive: true },
    select: { key: true, size: true },
    take: 100 // Limit for performance
  })

  let orphanedDbRecords = 0
  let integrityIssues = 0

  for (const asset of dbAssets) {
    try {
      const stat = await minioClient.statObject(bucketName, asset.key)
      
      // Check file size integrity
      if (stat.size !== asset.size) {
        integrityIssues++
      }
    } catch (error) {
      // File doesn't exist in MinIO
      orphanedDbRecords++
    }
  }

  // Check for orphaned files (files in MinIO but not in DB) - sample check
  const minioObjects = []
  const stream = minioClient.listObjects(bucketName, '', false)
  let objectCount = 0
  
  for await (const obj of stream) {
    minioObjects.push(obj.name)
    objectCount++
    if (objectCount >= 50) break // Limit for performance
  }

  const dbPaths = new Set(dbAssets.map(a => a.key))
  const orphanedFiles = minioObjects.filter(path => !dbPaths.has(path)).length

  return {
    orphanedDbRecords,
    orphanedFiles,
    integrityIssues
  }
}

async function getPerformanceMetrics() {
  // This would typically come from monitoring/metrics storage
  // For now, return mock data or basic calculations
  
  // Get recent asset operations from logs (if available)
  // This is a simplified version - in production you'd use proper metrics storage
  
  return {
    avgUploadTime: 2500, // ms
    avgDownloadTime: 150, // ms
    storageUtilization: 75 // percentage
  }
}

async function getRecentErrors() {
  // Get recent error logs related to assets
  // This would typically come from your logging system
  // For now, return empty array or check for recent failed operations
  
  const recentFailedAssets = await db.assets.findMany({
    where: {
      isActive: false,
      updatedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    },
    select: { key: true, updatedAt: true },
    take: 10
  })

  return recentFailedAssets.map(asset => ({
    assetKey: asset.key,
    error: 'Asset marked as inactive',
    timestamp: asset.updatedAt.toISOString()
  }))
}

function generateRecommendations(
  stats: any,
  integrity: any,
  performance: any,
  errors: any[]
): string[] {
  const recommendations: string[] = []

  // Storage recommendations
  if (performance.storageUtilization > 90) {
    recommendations.push('Storage utilization is high (>90%). Consider expanding storage capacity.')
  } else if (performance.storageUtilization > 80) {
    recommendations.push('Storage utilization is approaching capacity (>80%). Monitor closely.')
  }

  // Integrity recommendations
  if (integrity.orphanedDbRecords > 10) {
    recommendations.push(`Found ${integrity.orphanedDbRecords} orphaned database records. Run cleanup script.`)
  }

  if (integrity.orphanedFiles > 10) {
    recommendations.push(`Found ${integrity.orphanedFiles} orphaned files in storage. Run cleanup script.`)
  }

  if (integrity.integrityIssues > 5) {
    recommendations.push(`Found ${integrity.integrityIssues} file integrity issues. Investigate file corruption.`)
  }

  // Performance recommendations
  if (performance.avgUploadTime > 5000) {
    recommendations.push('Average upload time is high (>5s). Check network connectivity and storage performance.')
  }

  if (performance.avgDownloadTime > 1000) {
    recommendations.push('Average download time is high (>1s). Consider CDN or caching improvements.')
  }

  // Error recommendations
  if (errors.length > 5) {
    recommendations.push(`${errors.length} recent errors detected. Review error logs and fix underlying issues.`)
  }

  // Growth recommendations
  if (stats.recentUploads24h > 100) {
    recommendations.push('High upload volume detected. Monitor system performance and scaling needs.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Asset system is healthy. Continue regular monitoring.')
  }

  return recommendations
}

function getDefaultStats() {
  return {
    totalAssets: 0,
    activeAssets: 0,
    recentUploads24h: 0,
    assetTypeDistribution: {},
    sizeDistribution: { small: 0, medium: 0, large: 0 }
  }
}

function getDefaultIntegrity() {
  return {
    orphanedDbRecords: 0,
    orphanedFiles: 0,
    integrityIssues: 1 // Mark as having issues since we couldn't check
  }
}

function getDefaultPerformance() {
  return {
    avgUploadTime: 0,
    avgDownloadTime: 0,
    storageUtilization: 0
  }
}