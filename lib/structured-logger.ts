// Structured logging system for build vs runtime phases
// Provides consistent logging format with error categorization and recovery strategies

import { getCurrentPhase, isBuildTime, isRuntimeEnvironment } from './build-runtime-detector'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
export type LogCategory = 
  | 'startup' 
  | 'health-check' 
  | 'database' 
  | 'cache' 
  | 'file-storage' 
  | 'auth' 
  | 'api' 
  | 'deployment' 
  | 'performance' 
  | 'security'

export type ErrorCategory = 
  | 'configuration' 
  | 'network' 
  | 'database' 
  | 'authentication' 
  | 'authorization' 
  | 'validation' 
  | 'external-service' 
  | 'file-system' 
  | 'memory' 
  | 'timeout'

export type RecoveryStrategy = 
  | 'retry' 
  | 'fallback' 
  | 'degrade' 
  | 'fail-fast' 
  | 'ignore' 
  | 'manual-intervention'

export interface LogContext {
  phase: 'build' | 'runtime' | 'unknown'
  category: LogCategory
  service?: string
  userId?: string
  requestId?: string
  sessionId?: string
  operation?: string
  duration?: number
  metadata?: Record<string, any>
}

export interface ErrorContext extends LogContext {
  errorCategory: ErrorCategory
  recoveryStrategy: RecoveryStrategy
  retryCount?: number
  maxRetries?: number
  canRecover?: boolean
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical'
  affectedFeatures?: string[]
  troubleshootingSteps?: string[]
}

export interface StructuredLogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    cause?: any
  }
  performance?: {
    duration: number
    memoryUsage?: NodeJS.MemoryUsage
    cpuUsage?: NodeJS.CpuUsage
  }
}

class StructuredLogger {
  private static instance: StructuredLogger
  private logBuffer: StructuredLogEntry[] = []
  private maxBufferSize = 1000
  private isProduction = process.env.NODE_ENV === 'production'

  private constructor() {}

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger()
    }
    return StructuredLogger.instance
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext,
    error?: Error,
    performance?: { duration: number }
  ): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...context,
        phase: getCurrentPhase()
      }
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? undefined : error.stack,
        cause: error.cause
      }
    }

    if (performance) {
      entry.performance = {
        duration: performance.duration,
        memoryUsage: this.isProduction ? undefined : process.memoryUsage(),
        cpuUsage: this.isProduction ? undefined : process.cpuUsage()
      }
    }

    return entry
  }

  private addToBuffer(entry: StructuredLogEntry): void {
    this.logBuffer.push(entry)
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift() // Remove oldest entry
    }
  }

  private formatForConsole(entry: StructuredLogEntry): string {
    const { timestamp, level, message, context, error } = entry
    const time = new Date(timestamp).toLocaleTimeString()
    const phase = context.phase.toUpperCase()
    const category = context.category.toUpperCase()
    
    let prefix = `[${time}] [${phase}] [${category}]`
    if (context.service) {
      prefix += ` [${context.service}]`
    }
    
    let output = `${prefix} ${message}`
    
    if (context.duration) {
      output += ` (${context.duration}ms)`
    }
    
    if (error) {
      output += `\n  Error: ${error.name}: ${error.message}`
      if (error.stack && !this.isProduction) {
        output += `\n  Stack: ${error.stack}`
      }
    }
    
    if (context.metadata && Object.keys(context.metadata).length > 0) {
      output += `\n  Metadata: ${JSON.stringify(context.metadata, null, 2)}`
    }
    
    return output
  }

  private outputToConsole(entry: StructuredLogEntry): void {
    const formatted = this.formatForConsole(entry)
    
    switch (entry.level) {
      case 'debug':
        if (!this.isProduction) console.debug(formatted)
        break
      case 'info':
        console.log(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
      case 'fatal':
        console.error(formatted)
        break
    }
  }

  log(level: LogLevel, message: string, context: LogContext, error?: Error): void {
    const entry = this.createLogEntry(level, message, context, error)
    this.addToBuffer(entry)
    this.outputToConsole(entry)
  }

  debug(message: string, context: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context: LogContext, error?: Error): void {
    this.log('warn', message, context, error)
  }

  error(message: string, context: ErrorContext, error?: Error): void {
    // Enhanced error logging with recovery information
    const enhancedMessage = this.enhanceErrorMessage(message, context)
    this.log('error', enhancedMessage, context, error)
  }

  fatal(message: string, context: ErrorContext, error?: Error): void {
    const enhancedMessage = this.enhanceErrorMessage(message, context)
    this.log('fatal', enhancedMessage, context, error)
    
    // In production, fatal errors should trigger immediate attention
    if (this.isProduction) {
      // Could integrate with monitoring services here
      this.triggerAlert('fatal', enhancedMessage, context, error)
    }
  }

  private enhanceErrorMessage(message: string, context: ErrorContext): string {
    let enhanced = message
    
    enhanced += ` [Category: ${context.errorCategory}]`
    enhanced += ` [Recovery: ${context.recoveryStrategy}]`
    enhanced += ` [Criticality: ${context.criticalityLevel}]`
    
    if (context.retryCount !== undefined && context.maxRetries !== undefined) {
      enhanced += ` [Retry: ${context.retryCount}/${context.maxRetries}]`
    }
    
    if (context.affectedFeatures && context.affectedFeatures.length > 0) {
      enhanced += ` [Affected: ${context.affectedFeatures.join(', ')}]`
    }
    
    return enhanced
  }

  private triggerAlert(level: LogLevel, message: string, context: ErrorContext, error?: Error): void {
    // Placeholder for monitoring/alerting integration
    // Could integrate with services like DataDog, New Relic, Sentry, etc.
    console.error(`🚨 ALERT [${level.toUpperCase()}]: ${message}`)
    
    if (context.troubleshootingSteps && context.troubleshootingSteps.length > 0) {
      console.error('🔧 Troubleshooting steps:')
      context.troubleshootingSteps.forEach((step, index) => {
        console.error(`   ${index + 1}. ${step}`)
      })
    }
  }

  // Performance logging with timing
  logPerformance(
    message: string, 
    context: LogContext, 
    startTime: number, 
    level: LogLevel = 'info'
  ): void {
    const duration = Date.now() - startTime
    const entry = this.createLogEntry(level, message, context, undefined, { duration })
    this.addToBuffer(entry)
    this.outputToConsole(entry)
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): StructuredLogEntry[] {
    return this.logBuffer.slice(-count)
  }

  // Get logs by category
  getLogsByCategory(category: LogCategory, count: number = 50): StructuredLogEntry[] {
    return this.logBuffer
      .filter(entry => entry.context.category === category)
      .slice(-count)
  }

  // Get error logs with recovery information
  getErrorLogs(count: number = 50): StructuredLogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level === 'error' || entry.level === 'fatal')
      .slice(-count)
  }

  // Clear log buffer (useful for testing)
  clearBuffer(): void {
    this.logBuffer = []
  }
}

// Export singleton instance
export const logger = StructuredLogger.getInstance()

// Convenience functions for common logging patterns
export function logStartup(message: string, level: LogLevel = 'info', metadata?: Record<string, any>): void {
  logger.log(level, message, {
    phase: getCurrentPhase(),
    category: 'startup',
    metadata
  })
}

export function logHealthCheck(
  service: string, 
  message: string, 
  level: LogLevel = 'info',
  duration?: number,
  metadata?: Record<string, any>
): void {
  logger.log(level, message, {
    phase: getCurrentPhase(),
    category: 'health-check',
    service,
    duration,
    metadata
  })
}

export function logDatabaseOperation(
  operation: string,
  message: string,
  level: LogLevel = 'info',
  duration?: number,
  error?: Error
): void {
  logger.log(level, message, {
    phase: getCurrentPhase(),
    category: 'database',
    operation,
    duration
  }, error)
}

export function logDeploymentIssue(
  message: string,
  errorCategory: ErrorCategory,
  recoveryStrategy: RecoveryStrategy,
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical',
  error?: Error,
  affectedFeatures?: string[],
  troubleshootingSteps?: string[]
): void {
  const context: ErrorContext = {
    phase: getCurrentPhase(),
    category: 'deployment',
    errorCategory,
    recoveryStrategy,
    criticalityLevel,
    affectedFeatures,
    troubleshootingSteps
  }
  
  logger.error(message, context, error)
}

// Error recovery helper
export function logRecoveryAttempt(
  operation: string,
  strategy: RecoveryStrategy,
  attempt: number,
  maxAttempts: number,
  error?: Error
): void {
  const context: ErrorContext = {
    phase: getCurrentPhase(),
    category: 'deployment',
    operation,
    errorCategory: 'configuration',
    recoveryStrategy: strategy,
    criticalityLevel: 'medium',
    retryCount: attempt,
    maxRetries: maxAttempts
  }
  
  logger.warn(`Recovery attempt ${attempt}/${maxAttempts} for ${operation}`, context, error)
}