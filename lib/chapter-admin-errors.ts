// Comprehensive error handling for Chapter Admin System
// Provides structured error types, user-friendly messages, and recovery strategies

import { logger, ErrorContext, ErrorCategory, RecoveryStrategy } from './structured-logger'

export enum ChapterAdminErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INVALID_USER = 'INVALID_USER',
  
  // School Management
  SCHOOL_NOT_FOUND = 'SCHOOL_NOT_FOUND',
  SCHOOL_INACTIVE = 'SCHOOL_INACTIVE',
  SCHOOL_ALREADY_EXISTS = 'SCHOOL_ALREADY_EXISTS',
  
  // Admin Management
  ADMIN_NOT_FOUND = 'ADMIN_NOT_FOUND',
  ADMIN_ALREADY_EXISTS = 'ADMIN_ALREADY_EXISTS',
  ADMIN_INACTIVE = 'ADMIN_INACTIVE',
  CANNOT_REMOVE_SELF = 'CANNOT_REMOVE_SELF',
  INVALID_ROLE = 'INVALID_ROLE',
  
  // Asset Management
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  ASSET_UPLOAD_FAILED = 'ASSET_UPLOAD_FAILED',
  ASSET_INVALID_TYPE = 'ASSET_INVALID_TYPE',
  ASSET_TOO_LARGE = 'ASSET_TOO_LARGE',
  ASSET_CORRUPTED = 'ASSET_CORRUPTED',
  
  // Data Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  MINIO_ERROR = 'MINIO_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Migration & Data Consistency
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  DATA_INCONSISTENCY = 'DATA_INCONSISTENCY',
  ORPHANED_DATA = 'ORPHANED_DATA',
  
  // Rate Limiting & Performance
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED'
}

export interface ChapterAdminError extends Error {
  code: ChapterAdminErrorCode
  statusCode: number
  userMessage: string
  context?: Record<string, any>
  recoverable: boolean
  retryable: boolean
}

export class ChapterAdminErrorBuilder {
  private error: Partial<ChapterAdminError> = {}

  constructor(code: ChapterAdminErrorCode) {
    this.error.code = code
    this.error.name = 'ChapterAdminError'
    this.error.recoverable = false
    this.error.retryable = false
  }

  message(message: string): this {
    this.error.message = message
    return this
  }

  userMessage(message: string): this {
    this.error.userMessage = message
    return this
  }

  statusCode(code: number): this {
    this.error.statusCode = code
    return this
  }

  context(context: Record<string, any>): this {
    this.error.context = { ...this.error.context, ...context }
    return this
  }

  recoverable(recoverable: boolean = true): this {
    this.error.recoverable = recoverable
    return this
  }

  retryable(retryable: boolean = true): this {
    this.error.retryable = retryable
    return this
  }

  cause(cause: Error): this {
    this.error.cause = cause
    this.error.stack = cause.stack
    return this
  }

  build(): ChapterAdminError {
    // Set defaults based on error code
    this.setDefaults()
    
    const error = new Error(this.error.message) as ChapterAdminError
    Object.assign(error, this.error)
    
    return error
  }

  private setDefaults(): void {
    const defaults = this.getErrorDefaults(this.error.code!)
    
    if (!this.error.message) this.error.message = defaults.message
    if (!this.error.userMessage) this.error.userMessage = defaults.userMessage
    if (!this.error.statusCode) this.error.statusCode = defaults.statusCode
    if (this.error.recoverable === undefined) this.error.recoverable = defaults.recoverable
    if (this.error.retryable === undefined) this.error.retryable = defaults.retryable
  }

  private getErrorDefaults(code: ChapterAdminErrorCode) {
    const defaults: Record<ChapterAdminErrorCode, {
      message: string
      userMessage: string
      statusCode: number
      recoverable: boolean
      retryable: boolean
    }> = {
      [ChapterAdminErrorCode.UNAUTHORIZED]: {
        message: 'User is not authenticated',
        userMessage: 'Please sign in to continue',
        statusCode: 401,
        recoverable: true,
        retryable: false
      },
      [ChapterAdminErrorCode.INSUFFICIENT_PERMISSIONS]: {
        message: 'User lacks required permissions',
        userMessage: 'You do not have permission to perform this action',
        statusCode: 403,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.SCHOOL_NOT_FOUND]: {
        message: 'School not found in database',
        userMessage: 'The requested school could not be found',
        statusCode: 404,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.ADMIN_ALREADY_EXISTS]: {
        message: 'User is already an admin for this school',
        userMessage: 'This user is already assigned as an admin for this school',
        statusCode: 409,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.ASSET_UPLOAD_FAILED]: {
        message: 'Failed to upload asset to storage',
        userMessage: 'File upload failed. Please try again',
        statusCode: 500,
        recoverable: true,
        retryable: true
      },
      [ChapterAdminErrorCode.DATABASE_ERROR]: {
        message: 'Database operation failed',
        userMessage: 'A system error occurred. Please try again later',
        statusCode: 500,
        recoverable: true,
        retryable: true
      },
      [ChapterAdminErrorCode.VALIDATION_ERROR]: {
        message: 'Input validation failed',
        userMessage: 'Please check your input and try again',
        statusCode: 400,
        recoverable: true,
        retryable: false
      },
      [ChapterAdminErrorCode.RATE_LIMIT_EXCEEDED]: {
        message: 'Too many requests',
        userMessage: 'You are making requests too quickly. Please wait and try again',
        statusCode: 429,
        recoverable: true,
        retryable: true
      },
      // Add defaults for all other error codes
      [ChapterAdminErrorCode.INVALID_USER]: {
        message: 'Invalid user identifier',
        userMessage: 'User information is invalid',
        statusCode: 400,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.SCHOOL_INACTIVE]: {
        message: 'School is inactive',
        userMessage: 'This school is currently inactive',
        statusCode: 400,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.SCHOOL_ALREADY_EXISTS]: {
        message: 'School already exists',
        userMessage: 'A school with this name already exists',
        statusCode: 409,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.ADMIN_NOT_FOUND]: {
        message: 'Chapter admin assignment not found',
        userMessage: 'Admin assignment not found',
        statusCode: 404,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.ADMIN_INACTIVE]: {
        message: 'Chapter admin assignment is inactive',
        userMessage: 'This admin assignment is no longer active',
        statusCode: 400,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.CANNOT_REMOVE_SELF]: {
        message: 'Cannot remove own admin privileges',
        userMessage: 'You cannot remove your own admin privileges',
        statusCode: 400,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.INVALID_ROLE]: {
        message: 'Invalid admin role specified',
        userMessage: 'The specified admin role is invalid',
        statusCode: 400,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.ASSET_NOT_FOUND]: {
        message: 'Asset not found',
        userMessage: 'The requested file could not be found',
        statusCode: 404,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.ASSET_INVALID_TYPE]: {
        message: 'Invalid asset type',
        userMessage: 'This file type is not supported',
        statusCode: 400,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.ASSET_TOO_LARGE]: {
        message: 'Asset file size exceeds limit',
        userMessage: 'File is too large. Please choose a smaller file',
        statusCode: 400,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.ASSET_CORRUPTED]: {
        message: 'Asset file is corrupted',
        userMessage: 'The file appears to be corrupted. Please try a different file',
        statusCode: 400,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.INVALID_INPUT]: {
        message: 'Invalid input provided',
        userMessage: 'Please check your input and try again',
        statusCode: 400,
        recoverable: true,
        retryable: false
      },
      [ChapterAdminErrorCode.MISSING_REQUIRED_FIELD]: {
        message: 'Required field is missing',
        userMessage: 'Please fill in all required fields',
        statusCode: 400,
        recoverable: true,
        retryable: false
      },
      [ChapterAdminErrorCode.MINIO_ERROR]: {
        message: 'File storage service error',
        userMessage: 'File storage is temporarily unavailable. Please try again later',
        statusCode: 503,
        recoverable: true,
        retryable: true
      },
      [ChapterAdminErrorCode.CACHE_ERROR]: {
        message: 'Cache service error',
        userMessage: 'System is running slower than usual. Please be patient',
        statusCode: 500,
        recoverable: true,
        retryable: true
      },
      [ChapterAdminErrorCode.EXTERNAL_SERVICE_ERROR]: {
        message: 'External service unavailable',
        userMessage: 'A required service is temporarily unavailable. Please try again later',
        statusCode: 503,
        recoverable: true,
        retryable: true
      },
      [ChapterAdminErrorCode.MIGRATION_FAILED]: {
        message: 'Data migration failed',
        userMessage: 'System update failed. Please contact support',
        statusCode: 500,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.DATA_INCONSISTENCY]: {
        message: 'Data inconsistency detected',
        userMessage: 'Data synchronization issue detected. Please refresh and try again',
        statusCode: 500,
        recoverable: true,
        retryable: true
      },
      [ChapterAdminErrorCode.ORPHANED_DATA]: {
        message: 'Orphaned data detected',
        userMessage: 'Some data references are broken. Please contact support',
        statusCode: 500,
        recoverable: false,
        retryable: false
      },
      [ChapterAdminErrorCode.OPERATION_TIMEOUT]: {
        message: 'Operation timed out',
        userMessage: 'The operation took too long. Please try again',
        statusCode: 408,
        recoverable: true,
        retryable: true
      },
      [ChapterAdminErrorCode.RESOURCE_EXHAUSTED]: {
        message: 'System resources exhausted',
        userMessage: 'System is currently overloaded. Please try again later',
        statusCode: 503,
        recoverable: true,
        retryable: true
      }
    }

    return defaults[code]
  }
}

// Convenience functions for creating common errors
export function createChapterAdminError(code: ChapterAdminErrorCode): ChapterAdminErrorBuilder {
  return new ChapterAdminErrorBuilder(code)
}

export function createUnauthorizedError(message?: string): ChapterAdminError {
  return createChapterAdminError(ChapterAdminErrorCode.UNAUTHORIZED)
    .message(message || 'User is not authenticated')
    .build()
}

export function createPermissionError(requiredRole?: string): ChapterAdminError {
  const message = requiredRole 
    ? `Required role: ${requiredRole}` 
    : 'Insufficient permissions'
  
  return createChapterAdminError(ChapterAdminErrorCode.INSUFFICIENT_PERMISSIONS)
    .message(message)
    .context({ requiredRole })
    .build()
}

export function createSchoolNotFoundError(schoolId: string): ChapterAdminError {
  return createChapterAdminError(ChapterAdminErrorCode.SCHOOL_NOT_FOUND)
    .context({ schoolId })
    .build()
}

export function createValidationError(field: string, value: any, reason: string): ChapterAdminError {
  return createChapterAdminError(ChapterAdminErrorCode.VALIDATION_ERROR)
    .message(`Validation failed for field '${field}': ${reason}`)
    .userMessage(`Invalid ${field}: ${reason}`)
    .context({ field, value, reason })
    .build()
}

// Error logging with structured context
export function logChapterAdminError(
  error: ChapterAdminError,
  operation: string,
  userId?: string,
  additionalContext?: Record<string, any>
): void {
  const errorCategory = mapErrorCodeToCategory(error.code)
  const recoveryStrategy = mapErrorCodeToRecoveryStrategy(error.code)
  
  const context: ErrorContext = {
    phase: 'runtime',
    category: 'api',
    service: 'chapter-admin',
    operation,
    userId,
    errorCategory,
    recoveryStrategy,
    criticalityLevel: mapErrorCodeToCriticality(error.code),
    canRecover: error.recoverable,
    metadata: {
      errorCode: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
      ...error.context,
      ...additionalContext
    }
  }

  logger.error(error.message, context, error)
}

function mapErrorCodeToCategory(code: ChapterAdminErrorCode): ErrorCategory {
  const mapping: Record<ChapterAdminErrorCode, ErrorCategory> = {
    [ChapterAdminErrorCode.UNAUTHORIZED]: 'authentication',
    [ChapterAdminErrorCode.INSUFFICIENT_PERMISSIONS]: 'authorization',
    [ChapterAdminErrorCode.INVALID_USER]: 'validation',
    [ChapterAdminErrorCode.SCHOOL_NOT_FOUND]: 'validation',
    [ChapterAdminErrorCode.SCHOOL_INACTIVE]: 'validation',
    [ChapterAdminErrorCode.SCHOOL_ALREADY_EXISTS]: 'validation',
    [ChapterAdminErrorCode.ADMIN_NOT_FOUND]: 'validation',
    [ChapterAdminErrorCode.ADMIN_ALREADY_EXISTS]: 'validation',
    [ChapterAdminErrorCode.ADMIN_INACTIVE]: 'validation',
    [ChapterAdminErrorCode.CANNOT_REMOVE_SELF]: 'validation',
    [ChapterAdminErrorCode.INVALID_ROLE]: 'validation',
    [ChapterAdminErrorCode.ASSET_NOT_FOUND]: 'file-system',
    [ChapterAdminErrorCode.ASSET_UPLOAD_FAILED]: 'file-system',
    [ChapterAdminErrorCode.ASSET_INVALID_TYPE]: 'validation',
    [ChapterAdminErrorCode.ASSET_TOO_LARGE]: 'validation',
    [ChapterAdminErrorCode.ASSET_CORRUPTED]: 'file-system',
    [ChapterAdminErrorCode.VALIDATION_ERROR]: 'validation',
    [ChapterAdminErrorCode.INVALID_INPUT]: 'validation',
    [ChapterAdminErrorCode.MISSING_REQUIRED_FIELD]: 'validation',
    [ChapterAdminErrorCode.DATABASE_ERROR]: 'database',
    [ChapterAdminErrorCode.MINIO_ERROR]: 'external-service',
    [ChapterAdminErrorCode.CACHE_ERROR]: 'external-service',
    [ChapterAdminErrorCode.EXTERNAL_SERVICE_ERROR]: 'external-service',
    [ChapterAdminErrorCode.MIGRATION_FAILED]: 'database',
    [ChapterAdminErrorCode.DATA_INCONSISTENCY]: 'database',
    [ChapterAdminErrorCode.ORPHANED_DATA]: 'database',
    [ChapterAdminErrorCode.RATE_LIMIT_EXCEEDED]: 'network',
    [ChapterAdminErrorCode.OPERATION_TIMEOUT]: 'timeout',
    [ChapterAdminErrorCode.RESOURCE_EXHAUSTED]: 'memory'
  }

  return mapping[code] || 'external-service'
}

function mapErrorCodeToRecoveryStrategy(code: ChapterAdminErrorCode): RecoveryStrategy {
  const mapping: Record<ChapterAdminErrorCode, RecoveryStrategy> = {
    [ChapterAdminErrorCode.UNAUTHORIZED]: 'fail-fast',
    [ChapterAdminErrorCode.INSUFFICIENT_PERMISSIONS]: 'fail-fast',
    [ChapterAdminErrorCode.INVALID_USER]: 'fail-fast',
    [ChapterAdminErrorCode.SCHOOL_NOT_FOUND]: 'fail-fast',
    [ChapterAdminErrorCode.SCHOOL_INACTIVE]: 'fail-fast',
    [ChapterAdminErrorCode.SCHOOL_ALREADY_EXISTS]: 'fail-fast',
    [ChapterAdminErrorCode.ADMIN_NOT_FOUND]: 'fail-fast',
    [ChapterAdminErrorCode.ADMIN_ALREADY_EXISTS]: 'fail-fast',
    [ChapterAdminErrorCode.ADMIN_INACTIVE]: 'fail-fast',
    [ChapterAdminErrorCode.CANNOT_REMOVE_SELF]: 'fail-fast',
    [ChapterAdminErrorCode.INVALID_ROLE]: 'fail-fast',
    [ChapterAdminErrorCode.ASSET_NOT_FOUND]: 'fail-fast',
    [ChapterAdminErrorCode.ASSET_UPLOAD_FAILED]: 'retry',
    [ChapterAdminErrorCode.ASSET_INVALID_TYPE]: 'fail-fast',
    [ChapterAdminErrorCode.ASSET_TOO_LARGE]: 'fail-fast',
    [ChapterAdminErrorCode.ASSET_CORRUPTED]: 'fail-fast',
    [ChapterAdminErrorCode.VALIDATION_ERROR]: 'fail-fast',
    [ChapterAdminErrorCode.INVALID_INPUT]: 'fail-fast',
    [ChapterAdminErrorCode.MISSING_REQUIRED_FIELD]: 'fail-fast',
    [ChapterAdminErrorCode.DATABASE_ERROR]: 'retry',
    [ChapterAdminErrorCode.MINIO_ERROR]: 'retry',
    [ChapterAdminErrorCode.CACHE_ERROR]: 'fallback',
    [ChapterAdminErrorCode.EXTERNAL_SERVICE_ERROR]: 'retry',
    [ChapterAdminErrorCode.MIGRATION_FAILED]: 'manual-intervention',
    [ChapterAdminErrorCode.DATA_INCONSISTENCY]: 'retry',
    [ChapterAdminErrorCode.ORPHANED_DATA]: 'manual-intervention',
    [ChapterAdminErrorCode.RATE_LIMIT_EXCEEDED]: 'retry',
    [ChapterAdminErrorCode.OPERATION_TIMEOUT]: 'retry',
    [ChapterAdminErrorCode.RESOURCE_EXHAUSTED]: 'degrade'
  }

  return mapping[code] || 'fail-fast'
}

function mapErrorCodeToCriticality(code: ChapterAdminErrorCode): 'low' | 'medium' | 'high' | 'critical' {
  const mapping: Record<ChapterAdminErrorCode, 'low' | 'medium' | 'high' | 'critical'> = {
    [ChapterAdminErrorCode.UNAUTHORIZED]: 'low',
    [ChapterAdminErrorCode.INSUFFICIENT_PERMISSIONS]: 'low',
    [ChapterAdminErrorCode.INVALID_USER]: 'low',
    [ChapterAdminErrorCode.SCHOOL_NOT_FOUND]: 'low',
    [ChapterAdminErrorCode.SCHOOL_INACTIVE]: 'low',
    [ChapterAdminErrorCode.SCHOOL_ALREADY_EXISTS]: 'low',
    [ChapterAdminErrorCode.ADMIN_NOT_FOUND]: 'low',
    [ChapterAdminErrorCode.ADMIN_ALREADY_EXISTS]: 'low',
    [ChapterAdminErrorCode.ADMIN_INACTIVE]: 'low',
    [ChapterAdminErrorCode.CANNOT_REMOVE_SELF]: 'low',
    [ChapterAdminErrorCode.INVALID_ROLE]: 'low',
    [ChapterAdminErrorCode.ASSET_NOT_FOUND]: 'low',
    [ChapterAdminErrorCode.ASSET_UPLOAD_FAILED]: 'medium',
    [ChapterAdminErrorCode.ASSET_INVALID_TYPE]: 'low',
    [ChapterAdminErrorCode.ASSET_TOO_LARGE]: 'low',
    [ChapterAdminErrorCode.ASSET_CORRUPTED]: 'medium',
    [ChapterAdminErrorCode.VALIDATION_ERROR]: 'low',
    [ChapterAdminErrorCode.INVALID_INPUT]: 'low',
    [ChapterAdminErrorCode.MISSING_REQUIRED_FIELD]: 'low',
    [ChapterAdminErrorCode.DATABASE_ERROR]: 'high',
    [ChapterAdminErrorCode.MINIO_ERROR]: 'medium',
    [ChapterAdminErrorCode.CACHE_ERROR]: 'low',
    [ChapterAdminErrorCode.EXTERNAL_SERVICE_ERROR]: 'medium',
    [ChapterAdminErrorCode.MIGRATION_FAILED]: 'critical',
    [ChapterAdminErrorCode.DATA_INCONSISTENCY]: 'high',
    [ChapterAdminErrorCode.ORPHANED_DATA]: 'medium',
    [ChapterAdminErrorCode.RATE_LIMIT_EXCEEDED]: 'low',
    [ChapterAdminErrorCode.OPERATION_TIMEOUT]: 'medium',
    [ChapterAdminErrorCode.RESOURCE_EXHAUSTED]: 'high'
  }

  return mapping[code] || 'medium'
}

// Graceful fallback utilities
export function withGracefulFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorCode: ChapterAdminErrorCode,
  operationName: string
): Promise<T> {
  return operation().catch((error) => {
    const chapterAdminError = createChapterAdminError(errorCode)
      .message(`${operationName} failed, using fallback`)
      .cause(error)
      .recoverable(true)
      .build()

    logChapterAdminError(chapterAdminError, operationName)
    return fallback
  })
}

export function isChapterAdminError(error: any): error is ChapterAdminError {
  return error && typeof error === 'object' && 'code' in error && Object.values(ChapterAdminErrorCode).includes(error.code)
}