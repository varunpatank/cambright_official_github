// Chapter Admin Audit Logging System
// Provides comprehensive audit trails for all admin operations

import { logger, LogContext } from './structured-logger'
import { ChapterAdminRole } from '@prisma/client'

export type AdminAction = 
  | 'ADMIN_ASSIGNED'
  | 'ADMIN_REMOVED' 
  | 'ADMIN_ROLE_CHANGED'
  | 'ADMIN_ACTIVATED'
  | 'ADMIN_DEACTIVATED'
  | 'SCHOOL_CREATED'
  | 'SCHOOL_UPDATED'
  | 'SCHOOL_DELETED'
  | 'SCHOOL_STATS_UPDATED'
  | 'SCHOOL_POST_CREATED'
  | 'SCHOOL_POST_UPDATED'
  | 'SCHOOL_POST_DELETED'
  | 'ASSET_UPLOADED'
  | 'ASSET_DOWNLOADED'
  | 'ASSET_DELETED'
  | 'PERMISSION_CHECK'
  | 'MIGRATION_STARTED'
  | 'MIGRATION_COMPLETED'
  | 'MIGRATION_FAILED'

export interface AdminAuditContext {
  // Actor information
  actorUserId: string
  actorRole?: ChapterAdminRole | 'SUPER_ADMIN' | 'SYSTEM'
  actorEmail?: string
  
  // Target information
  targetUserId?: string
  targetEmail?: string
  schoolId?: string
  schoolName?: string
  assetKey?: string
  postId?: string
  
  // Operation details
  action: AdminAction
  operation: string
  success: boolean
  duration?: number
  
  // Change tracking
  previousValues?: Record<string, any>
  newValues?: Record<string, any>
  
  // Request context
  requestId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  
  // Additional metadata
  metadata?: Record<string, any>
}

export interface PerformanceMetrics {
  operationName: string
  duration: number
  memoryUsage?: NodeJS.MemoryUsage
  dbQueryCount?: number
  cacheHits?: number
  cacheMisses?: number
  assetOperations?: number
}

class ChapterAdminAuditLogger {
  private static instance: ChapterAdminAuditLogger

  private constructor() {}

  static getInstance(): ChapterAdminAuditLogger {
    if (!ChapterAdminAuditLogger.instance) {
      ChapterAdminAuditLogger.instance = new ChapterAdminAuditLogger()
    }
    return ChapterAdminAuditLogger.instance
  }

  // Log admin assignment operations
  logAdminAssignment(context: AdminAuditContext): void {
    const logContext: LogContext = {
      phase: 'runtime',
      category: 'security',
      service: 'chapter-admin',
      operation: context.operation,
      userId: context.actorUserId,
      requestId: context.requestId,
      sessionId: context.sessionId,
      duration: context.duration,
      metadata: {
        action: context.action,
        actorRole: context.actorRole,
        targetUserId: context.targetUserId,
        targetEmail: context.targetEmail,
        schoolId: context.schoolId,
        schoolName: context.schoolName,
        success: context.success,
        previousValues: context.previousValues,
        newValues: context.newValues,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        ...context.metadata
      }
    }

    const message = this.formatAdminMessage(context)
    
    if (context.success) {
      logger.info(message, logContext)
    } else {
      logger.warn(`Failed: ${message}`, logContext)
    }
  }

  // Log school management operations
  logSchoolOperation(context: AdminAuditContext): void {
    const logContext: LogContext = {
      phase: 'runtime',
      category: 'api',
      service: 'school-management',
      operation: context.operation,
      userId: context.actorUserId,
      requestId: context.requestId,
      sessionId: context.sessionId,
      duration: context.duration,
      metadata: {
        action: context.action,
        actorRole: context.actorRole,
        schoolId: context.schoolId,
        schoolName: context.schoolName,
        success: context.success,
        previousValues: context.previousValues,
        newValues: context.newValues,
        ...context.metadata
      }
    }

    const message = this.formatSchoolMessage(context)
    logger.info(message, logContext)
  }

  // Log asset operations
  logAssetOperation(context: AdminAuditContext): void {
    const logContext: LogContext = {
      phase: 'runtime',
      category: 'file-storage',
      service: 'asset-manager',
      operation: context.operation,
      userId: context.actorUserId,
      requestId: context.requestId,
      sessionId: context.sessionId,
      duration: context.duration,
      metadata: {
        action: context.action,
        assetKey: context.assetKey,
        schoolId: context.schoolId,
        success: context.success,
        ...context.metadata
      }
    }

    const message = this.formatAssetMessage(context)
    logger.info(message, logContext)
  }

  // Log permission checks
  logPermissionCheck(
    userId: string,
    operation: string,
    schoolId: string,
    requiredRole: string,
    hasPermission: boolean,
    actualRole?: string,
    requestId?: string
  ): void {
    const logContext: LogContext = {
      phase: 'runtime',
      category: 'security',
      service: 'chapter-admin',
      operation: 'permission-check',
      userId,
      requestId,
      metadata: {
        action: 'PERMISSION_CHECK',
        targetOperation: operation,
        schoolId,
        requiredRole,
        actualRole,
        hasPermission,
        success: hasPermission
      }
    }

    const message = `Permission check: ${operation} on school ${schoolId} - ${hasPermission ? 'GRANTED' : 'DENIED'} (required: ${requiredRole}, actual: ${actualRole || 'none'})`
    
    if (hasPermission) {
      logger.debug(message, logContext)
    } else {
      logger.warn(message, logContext)
    }
  }

  // Log performance metrics
  logPerformanceMetrics(metrics: PerformanceMetrics, userId?: string, requestId?: string): void {
    const logContext: LogContext = {
      phase: 'runtime',
      category: 'performance',
      service: 'chapter-admin',
      operation: metrics.operationName,
      userId,
      requestId,
      duration: metrics.duration,
      metadata: {
        memoryUsage: metrics.memoryUsage,
        dbQueryCount: metrics.dbQueryCount,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        assetOperations: metrics.assetOperations
      }
    }

    let level: 'info' | 'warn' | 'error' = 'info'
    let message = `Performance: ${metrics.operationName} completed in ${metrics.duration}ms`

    // Determine log level based on performance thresholds
    if (metrics.duration > 10000) { // > 10 seconds
      level = 'error'
      message += ' - CRITICAL SLOW OPERATION'
    } else if (metrics.duration > 5000) { // > 5 seconds
      level = 'warn'
      message += ' - SLOW OPERATION'
    } else if (metrics.duration > 2000) { // > 2 seconds
      level = 'warn'
      message += ' - MODERATE PERFORMANCE'
    }

    // Add memory warnings
    if (metrics.memoryUsage) {
      const heapUsedMB = metrics.memoryUsage.heapUsed / 1024 / 1024
      if (heapUsedMB > 500) { // > 500MB
        level = 'warn'
        message += ` - HIGH MEMORY USAGE (${Math.round(heapUsedMB)}MB)`
      }
    }

    logger.log(level, message, logContext)
  }

  // Log migration operations
  logMigrationOperation(
    operation: string,
    phase: 'started' | 'progress' | 'completed' | 'failed',
    details: {
      recordsProcessed?: number
      totalRecords?: number
      errors?: string[]
      duration?: number
      userId?: string
    }
  ): void {
    const action: AdminAction = phase === 'started' 
      ? 'MIGRATION_STARTED'
      : phase === 'completed'
      ? 'MIGRATION_COMPLETED'
      : 'MIGRATION_FAILED'

    const logContext: LogContext = {
      phase: 'runtime',
      category: 'database',
      service: 'migration',
      operation,
      userId: details.userId,
      duration: details.duration,
      metadata: {
        action,
        phase,
        recordsProcessed: details.recordsProcessed,
        totalRecords: details.totalRecords,
        errors: details.errors,
        success: phase === 'completed'
      }
    }

    let message = `Migration ${operation} - ${phase.toUpperCase()}`
    
    if (details.recordsProcessed !== undefined && details.totalRecords !== undefined) {
      message += ` (${details.recordsProcessed}/${details.totalRecords})`
    }

    if (details.errors && details.errors.length > 0) {
      message += ` - ${details.errors.length} errors`
    }

    const level = phase === 'failed' ? 'error' : phase === 'completed' ? 'info' : 'info'
    logger.log(level, message, logContext)
  }

  private formatAdminMessage(context: AdminAuditContext): string {
    const actor = context.actorEmail || context.actorUserId
    const target = context.targetEmail || context.targetUserId
    const school = context.schoolName || context.schoolId

    switch (context.action) {
      case 'ADMIN_ASSIGNED':
        return `${actor} assigned ${target} as admin for school ${school} with role ${context.newValues?.role}`
      
      case 'ADMIN_REMOVED':
        return `${actor} removed ${target} as admin from school ${school}`
      
      case 'ADMIN_ROLE_CHANGED':
        return `${actor} changed ${target}'s role from ${context.previousValues?.role} to ${context.newValues?.role} for school ${school}`
      
      case 'ADMIN_ACTIVATED':
        return `${actor} activated admin assignment for ${target} at school ${school}`
      
      case 'ADMIN_DEACTIVATED':
        return `${actor} deactivated admin assignment for ${target} at school ${school}`
      
      default:
        return `${actor} performed ${context.action} on ${target} for school ${school}`
    }
  }

  private formatSchoolMessage(context: AdminAuditContext): string {
    const actor = context.actorEmail || context.actorUserId
    const school = context.schoolName || context.schoolId

    switch (context.action) {
      case 'SCHOOL_CREATED':
        return `${actor} created school ${school}`
      
      case 'SCHOOL_UPDATED':
        return `${actor} updated school ${school}`
      
      case 'SCHOOL_DELETED':
        return `${actor} deleted school ${school}`
      
      case 'SCHOOL_STATS_UPDATED':
        const changes = []
        if (context.newValues?.volunteerHours !== context.previousValues?.volunteerHours) {
          changes.push(`volunteer hours: ${context.previousValues?.volunteerHours} → ${context.newValues?.volunteerHours}`)
        }
        if (context.newValues?.activeMembers !== context.previousValues?.activeMembers) {
          changes.push(`active members: ${context.previousValues?.activeMembers} → ${context.newValues?.activeMembers}`)
        }
        return `${actor} updated stats for school ${school}: ${changes.join(', ')}`
      
      case 'SCHOOL_POST_CREATED':
        return `${actor} created post for school ${school}`
      
      case 'SCHOOL_POST_UPDATED':
        return `${actor} updated post ${context.postId} for school ${school}`
      
      case 'SCHOOL_POST_DELETED':
        return `${actor} deleted post ${context.postId} from school ${school}`
      
      default:
        return `${actor} performed ${context.action} on school ${school}`
    }
  }

  private formatAssetMessage(context: AdminAuditContext): string {
    const actor = context.actorEmail || context.actorUserId
    const asset = context.assetKey
    const school = context.schoolName || context.schoolId

    switch (context.action) {
      case 'ASSET_UPLOADED':
        return `${actor} uploaded asset ${asset}${school ? ` for school ${school}` : ''}`
      
      case 'ASSET_DOWNLOADED':
        return `${actor} downloaded asset ${asset}`
      
      case 'ASSET_DELETED':
        return `${actor} deleted asset ${asset}${school ? ` from school ${school}` : ''}`
      
      default:
        return `${actor} performed ${context.action} on asset ${asset}`
    }
  }
}

// Export singleton instance
export const auditLogger = ChapterAdminAuditLogger.getInstance()

// Convenience functions for common audit operations
export function logAdminAssigned(
  actorUserId: string,
  targetUserId: string,
  schoolId: string,
  role: ChapterAdminRole,
  options: {
    actorEmail?: string
    targetEmail?: string
    schoolName?: string
    requestId?: string
    sessionId?: string
    duration?: number
  } = {}
): void {
  auditLogger.logAdminAssignment({
    actorUserId,
    targetUserId,
    schoolId,
    action: 'ADMIN_ASSIGNED',
    operation: 'assign-chapter-admin',
    success: true,
    newValues: { role },
    ...options
  })
}

export function logAdminRemoved(
  actorUserId: string,
  targetUserId: string,
  schoolId: string,
  options: {
    actorEmail?: string
    targetEmail?: string
    schoolName?: string
    requestId?: string
    sessionId?: string
    duration?: number
  } = {}
): void {
  auditLogger.logAdminAssignment({
    actorUserId,
    targetUserId,
    schoolId,
    action: 'ADMIN_REMOVED',
    operation: 'remove-chapter-admin',
    success: true,
    ...options
  })
}

export function logSchoolStatsUpdated(
  actorUserId: string,
  schoolId: string,
  previousStats: { volunteerHours?: number; activeMembers?: number },
  newStats: { volunteerHours?: number; activeMembers?: number },
  options: {
    actorEmail?: string
    schoolName?: string
    requestId?: string
    sessionId?: string
    duration?: number
  } = {}
): void {
  auditLogger.logSchoolOperation({
    actorUserId,
    schoolId,
    action: 'SCHOOL_STATS_UPDATED',
    operation: 'update-school-stats',
    success: true,
    previousValues: previousStats,
    newValues: newStats,
    ...options
  })
}

export function logAssetUploaded(
  actorUserId: string,
  assetKey: string,
  options: {
    schoolId?: string
    schoolName?: string
    fileName?: string
    fileSize?: number
    mimeType?: string
    requestId?: string
    sessionId?: string
    duration?: number
  } = {}
): void {
  auditLogger.logAssetOperation({
    actorUserId,
    assetKey,
    action: 'ASSET_UPLOADED',
    operation: 'upload-asset',
    success: true,
    metadata: {
      fileName: options.fileName,
      fileSize: options.fileSize,
      mimeType: options.mimeType
    },
    ...options
  })
}

export function logPermissionDenied(
  userId: string,
  operation: string,
  schoolId: string,
  requiredRole: string,
  actualRole?: string,
  requestId?: string
): void {
  auditLogger.logPermissionCheck(
    userId,
    operation,
    schoolId,
    requiredRole,
    false,
    actualRole,
    requestId
  )
}

// Performance monitoring wrapper
export async function withPerformanceLogging<T>(
  operationName: string,
  operation: () => Promise<T>,
  userId?: string,
  requestId?: string
): Promise<T> {
  const startTime = Date.now()
  const startMemory = process.memoryUsage()
  
  try {
    const result = await operation()
    
    const duration = Date.now() - startTime
    const endMemory = process.memoryUsage()
    
    auditLogger.logPerformanceMetrics({
      operationName,
      duration,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
      }
    }, userId, requestId)
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    
    auditLogger.logPerformanceMetrics({
      operationName: `${operationName} (failed)`,
      duration
    }, userId, requestId)
    
    throw error
  }
}

// Migration logging helpers
export function logMigrationStarted(operation: string, totalRecords: number, userId?: string): void {
  auditLogger.logMigrationOperation(operation, 'started', { totalRecords, userId })
}

export function logMigrationProgress(
  operation: string, 
  recordsProcessed: number, 
  totalRecords: number,
  userId?: string
): void {
  auditLogger.logMigrationOperation(operation, 'progress', { 
    recordsProcessed, 
    totalRecords, 
    userId 
  })
}

export function logMigrationCompleted(
  operation: string, 
  recordsProcessed: number, 
  duration: number,
  userId?: string
): void {
  auditLogger.logMigrationOperation(operation, 'completed', { 
    recordsProcessed, 
    duration, 
    userId 
  })
}

export function logMigrationFailed(
  operation: string, 
  recordsProcessed: number, 
  errors: string[], 
  duration: number,
  userId?: string
): void {
  auditLogger.logMigrationOperation(operation, 'failed', { 
    recordsProcessed, 
    errors, 
    duration, 
    userId 
  })
}