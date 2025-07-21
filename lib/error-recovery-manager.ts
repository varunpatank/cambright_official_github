// Error categorization and recovery strategies for deployment issues
// Provides systematic approach to handling different types of errors

import { logger, ErrorCategory, RecoveryStrategy, logRecoveryAttempt } from './structured-logger'

export interface ErrorRecoveryConfig {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  maxDelay: number
  timeoutMs: number
}

export interface RecoveryResult {
  success: boolean
  attempts: number
  finalError?: Error
  recoveryStrategy: RecoveryStrategy
  degradedMode?: boolean
  fallbackUsed?: boolean
}

export interface ErrorClassification {
  category: ErrorCategory
  recoveryStrategy: RecoveryStrategy
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical'
  canRecover: boolean
  affectedFeatures: string[]
  troubleshootingSteps: string[]
}

class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager
  private recoveryConfigs: Map<ErrorCategory, ErrorRecoveryConfig> = new Map()
  private errorClassifications: Map<string, ErrorClassification> = new Map()

  private constructor() {
    this.initializeRecoveryConfigs()
    this.initializeErrorClassifications()
  }

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager()
    }
    return ErrorRecoveryManager.instance
  }

  private initializeRecoveryConfigs(): void {
    // Configuration for different error categories
    this.recoveryConfigs.set('network', {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
      timeoutMs: 30000
    })

    this.recoveryConfigs.set('database', {
      maxRetries: 5,
      retryDelay: 2000,
      backoffMultiplier: 1.5,
      maxDelay: 15000,
      timeoutMs: 45000
    })

    this.recoveryConfigs.set('external-service', {
      maxRetries: 3,
      retryDelay: 1500,
      backoffMultiplier: 2,
      maxDelay: 12000,
      timeoutMs: 60000
    })

    this.recoveryConfigs.set('configuration', {
      maxRetries: 1,
      retryDelay: 0,
      backoffMultiplier: 1,
      maxDelay: 0,
      timeoutMs: 5000
    })

    this.recoveryConfigs.set('authentication', {
      maxRetries: 2,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 5000,
      timeoutMs: 20000
    })

    this.recoveryConfigs.set('file-system', {
      maxRetries: 3,
      retryDelay: 500,
      backoffMultiplier: 2,
      maxDelay: 4000,
      timeoutMs: 15000
    })

    this.recoveryConfigs.set('timeout', {
      maxRetries: 2,
      retryDelay: 2000,
      backoffMultiplier: 1.5,
      maxDelay: 8000,
      timeoutMs: 30000
    })
  }

  private initializeErrorClassifications(): void {
    // Database connection errors
    this.errorClassifications.set('ECONNREFUSED', {
      category: 'database',
      recoveryStrategy: 'retry',
      criticalityLevel: 'critical',
      canRecover: true,
      affectedFeatures: ['user-data', 'courses', 'progress-tracking'],
      troubleshootingSteps: [
        'Check database server status',
        'Verify DATABASE_URL environment variable',
        'Check network connectivity to database',
        'Verify database credentials'
      ]
    })

    this.errorClassifications.set('ENOTFOUND', {
      category: 'network',
      recoveryStrategy: 'retry',
      criticalityLevel: 'high',
      canRecover: true,
      affectedFeatures: ['external-services'],
      troubleshootingSteps: [
        'Check DNS resolution',
        'Verify service URLs in environment variables',
        'Check network connectivity',
        'Verify firewall settings'
      ]
    })

    this.errorClassifications.set('ETIMEDOUT', {
      category: 'timeout',
      recoveryStrategy: 'retry',
      criticalityLevel: 'medium',
      canRecover: true,
      affectedFeatures: ['slow-operations'],
      troubleshootingSteps: [
        'Check service response times',
        'Verify timeout configurations',
        'Monitor system resources',
        'Check for network latency issues'
      ]
    })

    // Authentication errors
    this.errorClassifications.set('CLERK_SECRET_KEY', {
      category: 'authentication',
      recoveryStrategy: 'fail-fast',
      criticalityLevel: 'critical',
      canRecover: false,
      affectedFeatures: ['user-authentication', 'user-management'],
      troubleshootingSteps: [
        'Verify CLERK_SECRET_KEY environment variable',
        'Check Clerk dashboard for API key status',
        'Ensure correct Clerk instance configuration'
      ]
    })

    // File storage errors
    this.errorClassifications.set('MINIO_CONNECTION', {
      category: 'file-system',
      recoveryStrategy: 'degrade',
      criticalityLevel: 'medium',
      canRecover: true,
      affectedFeatures: ['file-uploads', 'media-content'],
      troubleshootingSteps: [
        'Check MinIO server status',
        'Verify MinIO credentials',
        'Check bucket permissions',
        'Verify network connectivity to MinIO'
      ]
    })

    // Redis cache errors
    this.errorClassifications.set('REDIS_CONNECTION', {
      category: 'external-service',
      recoveryStrategy: 'fallback',
      criticalityLevel: 'low',
      canRecover: true,
      affectedFeatures: ['caching', 'performance-optimization'],
      troubleshootingSteps: [
        'Check Redis server status',
        'Verify REDIS_URL environment variable',
        'Test Redis connectivity',
        'Check Redis memory usage'
      ]
    })

    // Configuration errors
    this.errorClassifications.set('MISSING_ENV_VAR', {
      category: 'configuration',
      recoveryStrategy: 'fail-fast',
      criticalityLevel: 'critical',
      canRecover: false,
      affectedFeatures: ['application-startup'],
      troubleshootingSteps: [
        'Check environment variable configuration',
        'Verify .env file exists and is readable',
        'Compare with .env.example for required variables',
        'Check deployment configuration'
      ]
    })

    // Build-time errors
    this.errorClassifications.set('BUILD_TIME_SERVICE_ACCESS', {
      category: 'configuration',
      recoveryStrategy: 'degrade',
      criticalityLevel: 'high',
      canRecover: true,
      affectedFeatures: ['build-process'],
      troubleshootingSteps: [
        'Ensure services are not accessed during build time',
        'Check build-time detection logic',
        'Verify environment variable availability during build',
        'Review Docker build configuration'
      ]
    })
  }

  classifyError(error: Error | string): ErrorClassification {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorCode = typeof error === 'object' && 'code' in error ? String(error.code) : null

    // Check for specific error patterns
    if (errorCode && this.errorClassifications.has(errorCode)) {
      return this.errorClassifications.get(errorCode)!
    }

    // Pattern matching for common error types
    if (errorMessage.includes('ECONNREFUSED')) {
      return this.errorClassifications.get('ECONNREFUSED')!
    }

    if (errorMessage.includes('ENOTFOUND')) {
      return this.errorClassifications.get('ENOTFOUND')!
    }

    if (errorMessage.includes('ETIMEDOUT')) {
      return this.errorClassifications.get('ETIMEDOUT')!
    }

    if (errorMessage.includes('CLERK_SECRET_KEY') || errorMessage.includes('Clerk')) {
      return this.errorClassifications.get('CLERK_SECRET_KEY')!
    }

    if (errorMessage.includes('MinIO') || errorMessage.includes('minio')) {
      return this.errorClassifications.get('MINIO_CONNECTION')!
    }

    if (errorMessage.includes('Redis') || errorMessage.includes('redis')) {
      return this.errorClassifications.get('REDIS_CONNECTION')!
    }

    if (errorMessage.includes('environment variable') || errorMessage.includes('env')) {
      return this.errorClassifications.get('MISSING_ENV_VAR')!
    }

    if (errorMessage.includes('build time') || errorMessage.includes('build phase')) {
      return this.errorClassifications.get('BUILD_TIME_SERVICE_ACCESS')!
    }

    // Default classification for unknown errors
    return {
      category: 'external-service',
      recoveryStrategy: 'retry',
      criticalityLevel: 'medium',
      canRecover: true,
      affectedFeatures: ['unknown'],
      troubleshootingSteps: [
        'Check application logs for more details',
        'Verify system resources',
        'Check network connectivity',
        'Review recent configuration changes'
      ]
    }
  }

  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    operationName: string,
    errorClassification?: ErrorClassification
  ): Promise<RecoveryResult & { result?: T }> {
    let attempts = 0
    let lastError: Error | undefined
    let classification: ErrorClassification | undefined = errorClassification

    const startTime = Date.now()

    while (true) {
      attempts++

      try {
        logger.debug(`Executing ${operationName} (attempt ${attempts})`, {
          phase: 'runtime',
          category: 'deployment',
          operation: operationName,
          metadata: { attempt: attempts }
        })

        const result = await operation()

        if (attempts > 1) {
          logger.info(`${operationName} succeeded after ${attempts} attempts`, {
            phase: 'runtime',
            category: 'deployment',
            operation: operationName,
            duration: Date.now() - startTime,
            metadata: { attempts, recovered: true }
          })
        }

        return {
          success: true,
          attempts,
          recoveryStrategy: classification?.recoveryStrategy || 'retry',
          result
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (!classification) {
          classification = this.classifyError(lastError)
        }

        const config = this.recoveryConfigs.get(classification.category) || this.recoveryConfigs.get('external-service')!

        logRecoveryAttempt(operationName, classification.recoveryStrategy, attempts, config.maxRetries, lastError)

        // Check if we should continue retrying
        if (attempts >= config.maxRetries || classification.recoveryStrategy === 'fail-fast') {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.retryDelay * Math.pow(config.backoffMultiplier, attempts - 1),
          config.maxDelay
        )

        if (delay > 0) {
          logger.debug(`Waiting ${delay}ms before retry`, {
            phase: 'runtime',
            category: 'deployment',
            operation: operationName,
            metadata: { delay, attempt: attempts }
          })
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries exhausted
    logger.error(`${operationName} failed after ${attempts} attempts`, {
      phase: 'runtime',
      category: 'deployment',
      operation: operationName,
      errorCategory: classification.category,
      recoveryStrategy: classification.recoveryStrategy,
      criticalityLevel: classification.criticalityLevel,
      affectedFeatures: classification.affectedFeatures,
      troubleshootingSteps: classification.troubleshootingSteps,
      duration: Date.now() - startTime
    }, lastError)

    return {
      success: false,
      attempts,
      finalError: lastError,
      recoveryStrategy: classification.recoveryStrategy
    }
  }

  // Specific recovery methods for common scenarios
  async recoverDatabaseConnection(connectionFn: () => Promise<any>): Promise<RecoveryResult> {
    return this.executeWithRecovery(
      connectionFn,
      'database-connection',
      this.errorClassifications.get('ECONNREFUSED')
    )
  }

  async recoverExternalService(serviceFn: () => Promise<any>, serviceName: string): Promise<RecoveryResult> {
    return this.executeWithRecovery(
      serviceFn,
      `external-service-${serviceName}`,
      this.errorClassifications.get('ENOTFOUND')
    )
  }

  async recoverFileOperation(fileFn: () => Promise<any>, operation: string): Promise<RecoveryResult> {
    return this.executeWithRecovery(
      fileFn,
      `file-operation-${operation}`,
      this.errorClassifications.get('MINIO_CONNECTION')
    )
  }

  // Get recovery configuration for a specific error category
  getRecoveryConfig(category: ErrorCategory): ErrorRecoveryConfig | undefined {
    return this.recoveryConfigs.get(category)
  }

  // Update recovery configuration
  updateRecoveryConfig(category: ErrorCategory, config: Partial<ErrorRecoveryConfig>): void {
    const existing = this.recoveryConfigs.get(category) || {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
      timeoutMs: 30000
    }

    this.recoveryConfigs.set(category, { ...existing, ...config })
  }
}

// Export singleton instance
export const errorRecoveryManager = ErrorRecoveryManager.getInstance()

// Convenience functions
export async function withRecovery<T>(
  operation: () => Promise<T>,
  operationName: string,
  errorClassification?: ErrorClassification
): Promise<T> {
  const result = await errorRecoveryManager.executeWithRecovery(operation, operationName, errorClassification)
  
  if (!result.success) {
    throw result.finalError || new Error(`Operation ${operationName} failed after ${result.attempts} attempts`)
  }
  
  return result.result!
}

export function classifyError(error: Error | string): ErrorClassification {
  return errorRecoveryManager.classifyError(error)
}