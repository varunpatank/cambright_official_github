// API Error Handler for Chapter Admin System
// Provides consistent error responses and logging for API endpoints

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { 
  ChapterAdminError, 
  ChapterAdminErrorCode, 
  isChapterAdminError, 
  logChapterAdminError,
  createChapterAdminError
} from './chapter-admin-errors'

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    requestId?: string
  }
}

export interface ApiSuccessResponse<T = any> {
  data: T
  timestamp: string
  requestId?: string
}

// Main error handler for API routes
export function handleApiError(
  error: unknown,
  operation: string,
  userId?: string,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  let chapterAdminError: ChapterAdminError

  // Convert various error types to ChapterAdminError
  if (isChapterAdminError(error)) {
    chapterAdminError = error
  } else if (error instanceof ZodError) {
    chapterAdminError = handleZodError(error)
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    chapterAdminError = handlePrismaError(error)
  } else if (error instanceof Error) {
    chapterAdminError = handleGenericError(error)
  } else {
    chapterAdminError = handleUnknownError(error)
  }

  // Log the error with context
  logChapterAdminError(chapterAdminError, operation, userId, { requestId })

  // Create API response
  const response: ApiErrorResponse = {
    error: {
      code: chapterAdminError.code,
      message: chapterAdminError.userMessage,
      timestamp: new Date().toISOString(),
      requestId
    }
  }

  // Add details for validation errors
  if (chapterAdminError.code === ChapterAdminErrorCode.VALIDATION_ERROR && chapterAdminError.context) {
    response.error.details = chapterAdminError.context
  }

  return NextResponse.json(response, { status: chapterAdminError.statusCode })
}

// Handle Zod validation errors
function handleZodError(error: ZodError): ChapterAdminError {
  const fieldErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }))

  return createChapterAdminError(ChapterAdminErrorCode.VALIDATION_ERROR)
    .message(`Validation failed: ${error.errors.length} error(s)`)
    .userMessage('Please check your input and try again')
    .context({ fieldErrors, zodError: error.errors })
    .cause(error)
    .build()
}

// Handle Prisma database errors
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): ChapterAdminError {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return createChapterAdminError(ChapterAdminErrorCode.ADMIN_ALREADY_EXISTS)
        .message(`Unique constraint violation: ${error.message}`)
        .userMessage('This record already exists')
        .context({ prismaCode: error.code, meta: error.meta })
        .cause(error)
        .build()

    case 'P2025': // Record not found
      return createChapterAdminError(ChapterAdminErrorCode.SCHOOL_NOT_FOUND)
        .message(`Record not found: ${error.message}`)
        .userMessage('The requested record was not found')
        .context({ prismaCode: error.code, meta: error.meta })
        .cause(error)
        .build()

    case 'P2003': // Foreign key constraint violation
      return createChapterAdminError(ChapterAdminErrorCode.DATA_INCONSISTENCY)
        .message(`Foreign key constraint violation: ${error.message}`)
        .userMessage('Data relationship error occurred')
        .context({ prismaCode: error.code, meta: error.meta })
        .cause(error)
        .build()

    case 'P2034': // Transaction failed
      return createChapterAdminError(ChapterAdminErrorCode.DATABASE_ERROR)
        .message(`Transaction failed: ${error.message}`)
        .userMessage('Database operation failed. Please try again')
        .context({ prismaCode: error.code, meta: error.meta })
        .cause(error)
        .retryable(true)
        .build()

    default:
      return createChapterAdminError(ChapterAdminErrorCode.DATABASE_ERROR)
        .message(`Database error: ${error.message}`)
        .userMessage('A database error occurred. Please try again later')
        .context({ prismaCode: error.code, meta: error.meta })
        .cause(error)
        .retryable(true)
        .build()
  }
}

// Handle generic JavaScript errors
function handleGenericError(error: Error): ChapterAdminError {
  // Check for specific error patterns
  if (error.message.includes('ECONNREFUSED')) {
    return createChapterAdminError(ChapterAdminErrorCode.EXTERNAL_SERVICE_ERROR)
      .message(`Connection refused: ${error.message}`)
      .userMessage('Service temporarily unavailable. Please try again later')
      .cause(error)
      .retryable(true)
      .build()
  }

  if (error.message.includes('timeout')) {
    return createChapterAdminError(ChapterAdminErrorCode.OPERATION_TIMEOUT)
      .message(`Operation timeout: ${error.message}`)
      .userMessage('The operation took too long. Please try again')
      .cause(error)
      .retryable(true)
      .build()
  }

  if (error.message.includes('ENOTFOUND')) {
    return createChapterAdminError(ChapterAdminErrorCode.EXTERNAL_SERVICE_ERROR)
      .message(`Service not found: ${error.message}`)
      .userMessage('Required service is unavailable. Please try again later')
      .cause(error)
      .retryable(true)
      .build()
  }

  // Default generic error
  return createChapterAdminError(ChapterAdminErrorCode.EXTERNAL_SERVICE_ERROR)
    .message(error.message)
    .userMessage('An unexpected error occurred. Please try again')
    .cause(error)
    .retryable(true)
    .build()
}

// Handle completely unknown errors
function handleUnknownError(error: unknown): ChapterAdminError {
  const errorMessage = typeof error === 'string' ? error : 'Unknown error occurred'
  
  return createChapterAdminError(ChapterAdminErrorCode.EXTERNAL_SERVICE_ERROR)
    .message(`Unknown error: ${errorMessage}`)
    .userMessage('An unexpected error occurred. Please try again')
    .context({ originalError: error })
    .retryable(true)
    .build()
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  requestId?: string
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    data,
    timestamp: new Date().toISOString(),
    requestId
  }

  return NextResponse.json(response)
}

// Async error handler wrapper for API routes
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>,
  operation: string
) {
  return async (...args: T): Promise<NextResponse<R | ApiErrorResponse>> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Extract user ID from request if available
      const request = args.find(arg => arg && typeof arg === 'object' && 'headers' in arg)
      const userId = request?.headers?.get('x-user-id') || undefined
      const requestId = request?.headers?.get('x-request-id') || undefined

      return handleApiError(error, operation, userId, requestId)
    }
  }
}

// Validation helper for required fields
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })

  if (missingFields.length > 0) {
    throw createChapterAdminError(ChapterAdminErrorCode.MISSING_REQUIRED_FIELD)
      .message(`Missing required fields: ${missingFields.join(', ')}`)
      .userMessage(`Please provide: ${missingFields.join(', ')}`)
      .context({ missingFields, providedFields: Object.keys(data) })
      .build()
  }
}

// Permission validation helper
export function validatePermissions(
  hasPermission: boolean,
  requiredRole?: string,
  operation?: string
): void {
  if (!hasPermission) {
    throw createChapterAdminError(ChapterAdminErrorCode.INSUFFICIENT_PERMISSIONS)
      .message(`Permission denied for operation: ${operation || 'unknown'}`)
      .userMessage(requiredRole ? `Required role: ${requiredRole}` : 'Insufficient permissions')
      .context({ requiredRole, operation })
      .build()
  }
}

// Authentication validation helper
export function validateAuthentication(userId?: string | null): void {
  if (!userId) {
    throw createChapterAdminError(ChapterAdminErrorCode.UNAUTHORIZED)
      .message('User not authenticated')
      .userMessage('Please sign in to continue')
      .build()
  }
}

// Rate limiting helper
export function validateRateLimit(
  isRateLimited: boolean,
  resetTime?: Date
): void {
  if (isRateLimited) {
    throw createChapterAdminError(ChapterAdminErrorCode.RATE_LIMIT_EXCEEDED)
      .message('Rate limit exceeded')
      .userMessage('Too many requests. Please wait and try again')
      .context({ resetTime: resetTime?.toISOString() })
      .build()
  }
}

// Resource existence validation
export function validateResourceExists<T>(
  resource: T | null | undefined,
  resourceType: string,
  resourceId?: string
): asserts resource is T {
  if (!resource) {
    const errorCode = resourceType === 'school' 
      ? ChapterAdminErrorCode.SCHOOL_NOT_FOUND
      : resourceType === 'admin'
      ? ChapterAdminErrorCode.ADMIN_NOT_FOUND
      : resourceType === 'asset'
      ? ChapterAdminErrorCode.ASSET_NOT_FOUND
      : ChapterAdminErrorCode.VALIDATION_ERROR

    throw createChapterAdminError(errorCode)
      .message(`${resourceType} not found`)
      .userMessage(`The requested ${resourceType} could not be found`)
      .context({ resourceType, resourceId })
      .build()
  }
}

// File validation helper
export function validateFile(
  file: File | null | undefined,
  maxSize: number,
  allowedTypes: string[]
): void {
  if (!file) {
    throw createChapterAdminError(ChapterAdminErrorCode.MISSING_REQUIRED_FIELD)
      .message('No file provided')
      .userMessage('Please select a file to upload')
      .build()
  }

  if (file.size > maxSize) {
    throw createChapterAdminError(ChapterAdminErrorCode.ASSET_TOO_LARGE)
      .message(`File size ${file.size} exceeds limit ${maxSize}`)
      .userMessage(`File is too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`)
      .context({ fileSize: file.size, maxSize, fileName: file.name })
      .build()
  }

  if (!allowedTypes.includes(file.type)) {
    throw createChapterAdminError(ChapterAdminErrorCode.ASSET_INVALID_TYPE)
      .message(`File type ${file.type} not allowed`)
      .userMessage(`File type not supported. Allowed types: ${allowedTypes.join(', ')}`)
      .context({ fileType: file.type, allowedTypes, fileName: file.name })
      .build()
  }
}

// Async operation with timeout
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(createChapterAdminError(ChapterAdminErrorCode.OPERATION_TIMEOUT)
        .message(`Operation '${operationName}' timed out after ${timeoutMs}ms`)
        .userMessage('The operation took too long. Please try again')
        .context({ timeoutMs, operationName })
        .retryable(true)
        .build())
    }, timeoutMs)
  })

  return Promise.race([operation, timeoutPromise])
}