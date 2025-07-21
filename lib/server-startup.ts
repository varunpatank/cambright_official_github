// Server startup initialization
// Runs startup checks when the server starts, not on first request

import { runStartupChecks, StartupCheckSummary } from './startup-checks'
import { isBuildTime, isRuntimeEnvironment, logWithPhase, getCurrentPhase } from './build-runtime-detector'
import { validateEnvironment, getValidationSummary, validateServiceEnvironment } from './environment-validator'
import { 
  setServerPhase, 
  setEnvironmentValidation, 
  setHealthCheckResults,
  addRuntimeError,
  addRuntimeWarning,
  getRuntimeState 
} from './runtime-state-manager'
import { logger, logStartup, logDeploymentIssue } from './structured-logger'
import { withRecovery, errorRecoveryManager } from './error-recovery-manager'
import { deploymentMonitor } from './deployment-monitor'

interface ServerStartupState {
  isInitialized: boolean
  startupReport: StartupCheckSummary | null
  initializationError: Error | null
  initializationTime: number
}

// Global state to track server initialization
let serverState: ServerStartupState = {
  isInitialized: false,
  startupReport: null,
  initializationError: null,
  initializationTime: 0
}

// Initialize server on startup
export async function initializeServer(): Promise<void> {
  if (serverState.isInitialized) {
    return // Already initialized
  }

  const currentPhase = getCurrentPhase()
  const startTime = Date.now()
  
  // Skip health checks during build time
  if (isBuildTime()) {
    logWithPhase('Build time detected - skipping health checks and service connections', 'info')
    serverState.isInitialized = true
    serverState.initializationTime = Date.now() - startTime
    return
  }

  // Only run health checks at runtime
  if (!isRuntimeEnvironment()) {
    logWithPhase('Not in runtime environment - skipping server initialization', 'warn')
    return
  }
  
  try {
    logStartup('Starting server initialization...', 'info', { startTime })
    
    // Set server phase to runtime
    setServerPhase('runtime')
    
    // First, validate the runtime environment with recovery
    logStartup('🔍 Validating runtime environment...', 'info')
    
    const envValidation = await withRecovery(
      async () => validateEnvironment('runtime-server'),
      'environment-validation'
    )
    
    setEnvironmentValidation(envValidation)
    
    // Log environment validation results with structured logging
    const validationSummary = getValidationSummary(envValidation)
    if (envValidation.isValid) {
      logStartup(validationSummary, 'info', { validationResults: envValidation })
    } else {
      logDeploymentIssue(
        `Environment validation failed: ${validationSummary}`,
        'configuration',
        'fail-fast',
        'critical',
        new Error(validationSummary),
        ['application-startup'],
        [
          'Check environment variable configuration',
          'Verify .env file exists and is readable',
          'Compare with .env.example for required variables',
          'Check deployment configuration'
        ]
      )
    }
    
    // If environment validation fails, don't proceed with health checks
    if (!envValidation.isValid) {
      const error = new Error(`Environment validation failed: ${envValidation.missingRequired.join(', ')}`)
      serverState.initializationError = error
      setServerPhase('unknown')
      addRuntimeError(`Missing required environment variables: ${envValidation.missingRequired.join(', ')}`)
      
      logDeploymentIssue(
        'SERVER STARTUP FAILED - Required environment variables missing',
        'configuration',
        'fail-fast',
        'critical',
        error,
        ['application-startup'],
        [
          'Set missing environment variables',
          'Check deployment configuration',
          'Verify secrets management',
          'Review container environment setup'
        ]
      )
      
      if (process.env.NODE_ENV === 'production') {
        logStartup('🛑 Exiting due to missing required environment variables', 'fatal')
        process.exit(1)
      }
      
      throw error
    }
    
    // Add warnings for missing optional variables
    if (envValidation.warnings.length > 0) {
      envValidation.warnings.forEach(warning => addRuntimeWarning(warning))
    }
    
    // Validate individual services for graceful degradation with structured logging
    logStartup('🔧 Validating individual services...', 'info')
    const services = ['redis', 'minio', 'database', 'clerk']
    const serviceValidations = services.map(service => {
      const validation = validateServiceEnvironment(service)
      if (!validation.isAvailable && validation.canDegrade) {
        validation.warnings.forEach(warning => addRuntimeWarning(warning))
        logger.warn(`${service.toUpperCase()}: Service degraded`, {
          phase: 'runtime',
          category: 'startup',
          service,
          metadata: { warnings: validation.warnings, canDegrade: true }
        })
      } else if (!validation.isAvailable && !validation.canDegrade) {
        const error = `${service.toUpperCase()}: Missing critical configuration - ${validation.missingVars.join(', ')}`
        addRuntimeError(error)
        logDeploymentIssue(
          error,
          'configuration',
          'fail-fast',
          'critical',
          new Error(error),
          [service],
          [`Configure ${service.toUpperCase()} environment variables`, 'Check service availability', 'Verify network connectivity']
        )
      } else {
        logger.info(`${service.toUpperCase()}: Configuration valid`, {
          phase: 'runtime',
          category: 'startup',
          service,
          metadata: { configurationValid: true }
        })
      }
      return { service, validation }
    })
    
    // Check if any critical services are missing
    const criticalServiceFailures = serviceValidations.filter(
      sv => !sv.validation.isAvailable && !sv.validation.canDegrade
    )
    
    if (criticalServiceFailures.length > 0) {
      const error = new Error(`Critical services unavailable: ${criticalServiceFailures.map(sv => sv.service).join(', ')}`)
      serverState.initializationError = error
      setServerPhase('unknown')
      
      logDeploymentIssue(
        'SERVER STARTUP FAILED - Critical services unavailable',
        'configuration',
        'fail-fast',
        'critical',
        error,
        criticalServiceFailures.map(sv => sv.service),
        [
          'Check service configurations',
          'Verify environment variables',
          'Test service connectivity',
          'Review deployment setup'
        ]
      )
      
      if (process.env.NODE_ENV === 'production') {
        logStartup('🛑 Exiting due to critical service failures', 'fatal')
        process.exit(1)
      }
      
      throw error
    }
    
    // Run comprehensive startup checks with recovery
    logStartup('🏥 Running health checks...', 'info')
    const report = await withRecovery(
      async () => runStartupChecks(),
      'startup-health-checks'
    )
    
    serverState.startupReport = report
    serverState.initializationTime = Date.now() - startTime
    
    // Update runtime state with health check results
    setHealthCheckResults({
      overallStatus: report.overall === 'healthy' ? 'success' : report.overall === 'degraded' ? 'warning' : 'failed',
      totalChecks: report.checks.length,
      successCount: report.checks.filter(c => c.status === 'healthy').length,
      failedCount: report.checks.filter(c => c.status === 'unhealthy').length,
      warningCount: report.checks.filter(c => c.status === 'warning').length,
      skippedCount: 0,
      totalDuration: serverState.initializationTime,
      checks: report.checks.map(check => ({
        name: check.service,
        status: check.status === 'healthy' ? 'success' : check.status === 'warning' ? 'warning' : 'failed',
        message: check.message,
        duration: check.responseTime,
        error: check.status === 'unhealthy' ? check.message : undefined
      }))
    })
    
    // Log results with structured logging and clear formatting
    logStartup('📊 SERVER STARTUP HEALTH CHECK RESULTS', 'info', {
      totalTime: serverState.initializationTime,
      overallStatus: report.overall,
      criticalFailures: report.criticalFailures,
      warnings: report.warnings,
      totalChecks: report.checks.length
    })
    
    // Log individual service status with structured logging
    report.checks.forEach(check => {
      const level = check.status === 'healthy' ? 'info' : check.status === 'warning' ? 'warn' : 'error'
      logger.log(level, `${getStatusEmoji(check.status)} ${check.service}: ${check.message}`, {
        phase: 'runtime',
        category: 'health-check',
        service: check.service,
        duration: check.responseTime,
        metadata: { 
          status: check.status,
          healthCheckPhase: 'startup'
        }
      })
    })
    
    // Set initialization status based on results with structured logging
    if (report.overall === 'unhealthy') {
      const error = new Error(`Server startup failed: ${report.criticalFailures} critical service(s) unavailable`)
      serverState.initializationError = error
      
      logDeploymentIssue(
        'SERVER STARTUP FAILED - Critical services unavailable',
        'configuration',
        'fail-fast',
        'critical',
        error,
        ['application-startup'],
        [
          'Check critical service status',
          'Review health check results',
          'Verify service configurations',
          'Consider rollback if necessary'
        ]
      )
      
      // In production, we might want to exit the process
      if (process.env.NODE_ENV === 'production') {
        logStartup('🛑 Exiting due to critical startup failures in production', 'fatal')
        process.exit(1)
      }
    } else if (report.overall === 'degraded') {
      logger.warn('SERVER STARTED WITH WARNINGS - Some services unavailable', {
        phase: 'runtime',
        category: 'startup',
        metadata: { 
          degradedServices: report.checks.filter(c => c.status === 'warning').map(c => c.service),
          warningCount: report.warnings
        }
      })
    } else {
      logStartup('✅ SERVER STARTUP SUCCESSFUL - All services healthy', 'info', {
        healthyServices: report.checks.filter(c => c.status === 'healthy').map(c => c.service)
      })
    }
    
    serverState.isInitialized = true
    deploymentMonitor.updateHealthCheckTime()
    
  } catch (error) {
    serverState.initializationError = error instanceof Error ? error : new Error(String(error))
    serverState.initializationTime = Date.now() - startTime
    
    logDeploymentIssue(
      'SERVER INITIALIZATION FAILED',
      'configuration',
      'manual-intervention',
      'critical',
      serverState.initializationError,
      ['application-startup'],
      [
        'Check application logs for detailed error information',
        'Verify all environment variables are set correctly',
        'Check service dependencies are available',
        'Review deployment configuration',
        'Consider rollback to previous version'
      ]
    )
    
    // In production, exit on startup failure
    if (process.env.NODE_ENV === 'production') {
      logStartup('🛑 Exiting due to startup initialization failure', 'fatal')
      process.exit(1)
    }
    
    throw error
  }
}

// Get server startup state (for API endpoints)
export function getServerStartupState(): ServerStartupState {
  return { ...serverState }
}

// Check if server is ready to handle requests
export function isServerReady(): boolean {
  return serverState.isInitialized && !serverState.initializationError
}

// Get startup report (for health endpoints)
export function getStartupReport(): StartupCheckSummary | null {
  return serverState.startupReport
}

// Helper function to get status emoji
function getStatusEmoji(status: string): string {
  switch (status) {
    case 'healthy': return '✅'
    case 'warning': return '⚠️'
    case 'degraded': return '⚠️'
    case 'unhealthy': return '❌'
    default: return '❓'
  }
}

// Initialize server when this module is imported
// This ensures startup checks run when the server starts
if (typeof window === 'undefined') { // Only run on server side
  initializeServer().catch(error => {
    logWithPhase(`Failed to initialize server: ${error}`, 'error')
  })
}