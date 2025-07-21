// Chapter Admin System Health Check Endpoint
// Provides comprehensive health monitoring for the chapter admin system

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { minioClient } from '@/lib/minio'
import { logger } from '@/lib/structured-logger'
import { withTimeout } from '@/lib/api-error-handler'

export interface HealthCheckResult {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  details?: any
  error?: string
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: HealthCheckResult[]
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
  }
}

// Health check timeout (5 seconds)
const HEALTH_CHECK_TIMEOUT = 5000

export async function GET(request: NextRequest): Promise<NextResponse<SystemHealthResponse>> {
  const startTime = Date.now()
  
  try {
    // Run all health checks in parallel with timeout
    const checks = await Promise.allSettled([
      withTimeout(checkDatabase(), HEALTH_CHECK_TIMEOUT, 'database-health'),
      withTimeout(checkMinIO(), HEALTH_CHECK_TIMEOUT, 'minio-health'),
      withTimeout(checkChapterAdminSystem(), HEALTH_CHECK_TIMEOUT, 'chapter-admin-health'),
      withTimeout(checkAssetManager(), HEALTH_CHECK_TIMEOUT, 'asset-manager-health'),
      withTimeout(checkSchoolSystem(), HEALTH_CHECK_TIMEOUT, 'school-system-health')
    ])

    // Process results
    const healthResults: HealthCheckResult[] = checks.map((result, index) => {
      const services = ['database', 'minio', 'chapter-admin', 'asset-manager', 'school-system']
      
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          service: services[index],
          status: 'unhealthy' as const,
          responseTime: HEALTH_CHECK_TIMEOUT,
          error: result.reason?.message || 'Health check timeout'
        }
      }
    })

    // Calculate overall status
    const summary = {
      total: healthResults.length,
      healthy: healthResults.filter(r => r.status === 'healthy').length,
      degraded: healthResults.filter(r => r.status === 'degraded').length,
      unhealthy: healthResults.filter(r => r.status === 'unhealthy').length
    }

    const overallStatus = summary.unhealthy > 0 
      ? 'unhealthy' 
      : summary.degraded > 0 
      ? 'degraded' 
      : 'healthy'

    const response: SystemHealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: healthResults,
      summary
    }

    // Log health check results
    const duration = Date.now() - startTime
    logger.info(`Health check completed in ${duration}ms - Status: ${overallStatus}`, {
      phase: 'runtime',
      category: 'health-check',
      service: 'chapter-admin-system',
      duration,
      metadata: {
        overallStatus,
        summary,
        healthResults: healthResults.map(r => ({ service: r.service, status: r.status }))
      }
    })

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Health check failed', {
      phase: 'runtime',
      category: 'health-check',
      service: 'chapter-admin-system',
      duration,
      errorCategory: 'external-service',
      recoveryStrategy: 'retry',
      criticalityLevel: 'high'
    }, error as Error)

    const errorResponse: SystemHealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: [{
        service: 'health-check-system',
        status: 'unhealthy',
        responseTime: duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      }],
      summary: {
        total: 1,
        healthy: 0,
        degraded: 0,
        unhealthy: 1
      }
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}

// Database connectivity and basic operations check
async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Test basic connectivity
    await db.$queryRaw`SELECT 1`
    
    // Test chapter admin table access
    const adminCount = await db.chapterAdmin.count({
      where: { isActive: true }
    })
    
    // Test school table access
    const schoolCount = await db.school.count({
      where: { isActive: true }
    })
    
    // Test asset manager table access
    const assetCount = await db.assetManager.count({
      where: { isActive: true }
    })

    const responseTime = Date.now() - startTime
    
    return {
      service: 'database',
      status: responseTime > 2000 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        activeAdmins: adminCount,
        activeSchools: schoolCount,
        activeAssets: assetCount,
        connectionPool: {
          // Add connection pool stats if available
        }
      }
    }
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

// MinIO connectivity and basic operations check
async function checkMinIO(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Test bucket existence
    const bucketName = process.env.MINIO_BUCKET_NAME || 'cambright-assets'
    const bucketExists = await minioClient.bucketExists(bucketName)
    
    if (!bucketExists) {
      return {
        service: 'minio',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: `Bucket ${bucketName} does not exist`
      }
    }

    // Test basic operations (list objects with limit)
    const objects = []
    const stream = minioClient.listObjects(bucketName, '', false)
    let objectCount = 0
    
    for await (const obj of stream) {
      objectCount++
      if (objectCount >= 5) break // Limit to avoid long operations
    }

    const responseTime = Date.now() - startTime
    
    return {
      service: 'minio',
      status: responseTime > 3000 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        bucketName,
        bucketExists,
        sampleObjectCount: objectCount,
        endpoint: process.env.MINIO_URL
      }
    }
  } catch (error) {
    return {
      service: 'minio',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'MinIO connection failed'
    }
  }
}

// Chapter Admin System specific checks
async function checkChapterAdminSystem(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Check for data consistency
    const admins = await db.chapterAdmin.findMany({
      where: { isActive: true },
      include: { school: true },
      take: 10
    })

    // Check for orphaned admin records (admins without schools)
    const orphanedAdmins = admins.filter(admin => !admin.school || !admin.school.isActive)
    
    // Check role distribution
    const roleStats = await db.chapterAdmin.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: { role: true }
    })

    const responseTime = Date.now() - startTime
    
    const hasOrphanedData = orphanedAdmins.length > 0
    
    return {
      service: 'chapter-admin',
      status: hasOrphanedData ? 'degraded' : responseTime > 1000 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        totalActiveAdmins: admins.length,
        orphanedAdmins: orphanedAdmins.length,
        roleDistribution: roleStats.reduce((acc, stat) => {
          acc[stat.role] = stat._count.role
          return acc
        }, {} as Record<string, number>),
        dataConsistency: {
          hasOrphanedData,
          orphanedAdminIds: orphanedAdmins.map(a => a.id)
        }
      }
    }
  } catch (error) {
    return {
      service: 'chapter-admin',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Chapter admin system check failed'
    }
  }
}

// Asset Manager System checks
async function checkAssetManager(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Check asset records vs actual files
    const recentAssets = await db.assetManager.findMany({
      where: { 
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    // Check for asset integrity (sample check)
    let integrityIssues = 0
    const bucketName = process.env.MINIO_BUCKET_NAME || 'cambright-assets'
    
    for (const asset of recentAssets.slice(0, 3)) { // Check only first 3 for performance
      try {
        const stat = await minioClient.statObject(bucketName, asset.minioPath)
        if (stat.size !== asset.fileSize) {
          integrityIssues++
        }
      } catch {
        integrityIssues++
      }
    }

    // Check asset type distribution
    const assetTypeStats = await db.assetManager.groupBy({
      by: ['assetType'],
      where: { isActive: true },
      _count: { assetType: true }
    })

    const responseTime = Date.now() - startTime
    
    return {
      service: 'asset-manager',
      status: integrityIssues > 0 ? 'degraded' : responseTime > 2000 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        totalActiveAssets: recentAssets.length,
        integrityIssues,
        assetTypeDistribution: assetTypeStats.reduce((acc, stat) => {
          acc[stat.assetType] = stat._count.assetType
          return acc
        }, {} as Record<string, number>),
        recentAssetKeys: recentAssets.map(a => a.key)
      }
    }
  } catch (error) {
    return {
      service: 'asset-manager',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Asset manager check failed'
    }
  }
}

// School System checks
async function checkSchoolSystem(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Check school data consistency
    const schools = await db.school.findMany({
      where: { isActive: true },
      include: {
        chapterAdmins: { where: { isActive: true } },
        posts: { take: 1 },
        imageAsset: true,
        bannerAsset: true
      },
      take: 10
    })

    // Check for schools without admins
    const schoolsWithoutAdmins = schools.filter(school => school.chapterAdmins.length === 0)
    
    // Check for broken asset references
    const schoolsWithBrokenAssets = schools.filter(school => 
      (school.imageAssetKey && !school.imageAsset) ||
      (school.bannerAssetKey && !school.bannerAsset)
    )

    const responseTime = Date.now() - startTime
    
    const hasDataIssues = schoolsWithoutAdmins.length > 0 || schoolsWithBrokenAssets.length > 0
    
    return {
      service: 'school-system',
      status: hasDataIssues ? 'degraded' : responseTime > 1500 ? 'degraded' : 'healthy',
      responseTime,
      details: {
        totalActiveSchools: schools.length,
        schoolsWithoutAdmins: schoolsWithoutAdmins.length,
        schoolsWithBrokenAssets: schoolsWithBrokenAssets.length,
        averageAdminsPerSchool: schools.reduce((sum, s) => sum + s.chapterAdmins.length, 0) / schools.length,
        dataConsistency: {
          hasDataIssues,
          schoolsWithoutAdminIds: schoolsWithoutAdmins.map(s => s.id),
          schoolsWithBrokenAssetIds: schoolsWithBrokenAssets.map(s => s.id)
        }
      }
    }
  } catch (error) {
    return {
      service: 'school-system',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'School system check failed'
    }
  }
}