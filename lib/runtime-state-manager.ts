/**
 * Runtime State Management
 * 
 * Manages the application's runtime state including initialization status,
 * health check results, and server readiness.
 */

import { EnvironmentValidationResult } from './environment-validator';

export type ServerPhase = 'build' | 'runtime' | 'unknown';
export type DetailedServerPhase = 'build' | 'starting' | 'initializing' | 'ready' | 'failed';

export interface StartupCheckResult {
  name: string;
  status: 'success' | 'failed' | 'warning' | 'skipped';
  message: string;
  duration?: number;
  error?: string;
}

export interface StartupCheckSummary {
  overallStatus: 'success' | 'failed' | 'warning';
  totalChecks: number;
  successCount: number;
  failedCount: number;
  warningCount: number;
  skippedCount: number;
  totalDuration: number;
  checks: StartupCheckResult[];
}

export interface ServerRuntimeState {
  phase: ServerPhase;
  initializationStartTime: number;
  initializationEndTime?: number;
  healthCheckResults: StartupCheckSummary | null;
  environmentValidation: EnvironmentValidationResult | null;
  readyForTraffic: boolean;
  lastHealthCheck?: number;
  errors: string[];
  warnings: string[];
}

/**
 * Global runtime state instance
 */
let runtimeState: ServerRuntimeState = {
  phase: 'runtime',
  initializationStartTime: Date.now(),
  healthCheckResults: null,
  environmentValidation: null,
  readyForTraffic: false,
  errors: [],
  warnings: [],
};

/**
 * Gets the current runtime state
 * @returns Current server runtime state
 */
export function getRuntimeState(): ServerRuntimeState {
  return { ...runtimeState };
}

/**
 * Updates the server phase
 * @param phase New phase to set
 */
export function setServerPhase(phase: ServerPhase): void {
  const previousPhase = runtimeState.phase;
  runtimeState.phase = phase;
  
  // Set end time when reaching runtime state
  if (phase === 'runtime' && !runtimeState.initializationEndTime) {
    runtimeState.initializationEndTime = Date.now();
  }
  
  // Update traffic readiness
  runtimeState.readyForTraffic = phase === 'runtime';
  
  console.log(`Server phase changed: ${previousPhase} → ${phase}`);
}

/**
 * Updates the health check results
 * @param results Health check summary
 */
export function setHealthCheckResults(results: StartupCheckSummary): void {
  runtimeState.healthCheckResults = results;
  runtimeState.lastHealthCheck = Date.now();
  
  // Update phase based on health check results
  if (results.overallStatus === 'failed') {
    setServerPhase('unknown');
  } else if (results.overallStatus === 'success') {
    setServerPhase('runtime');
  }
}

/**
 * Updates the environment validation results
 * @param validation Environment validation result
 */
export function setEnvironmentValidation(validation: EnvironmentValidationResult): void {
  runtimeState.environmentValidation = validation;
  
  // Add warnings from environment validation
  if (validation.warnings.length > 0) {
    runtimeState.warnings.push(...validation.warnings);
  }
  
  // Add errors for missing required variables
  if (validation.missingRequired.length > 0) {
    runtimeState.errors.push(
      `Missing required environment variables: ${validation.missingRequired.join(', ')}`
    );
  }
}

/**
 * Adds an error to the runtime state
 * @param error Error message
 */
export function addRuntimeError(error: string): void {
  runtimeState.errors.push(error);
  console.error(`Runtime error: ${error}`);
}

/**
 * Adds a warning to the runtime state
 * @param warning Warning message
 */
export function addRuntimeWarning(warning: string): void {
  runtimeState.warnings.push(warning);
  console.warn(`Runtime warning: ${warning}`);
}

/**
 * Clears all errors and warnings
 */
export function clearRuntimeMessages(): void {
  runtimeState.errors = [];
  runtimeState.warnings = [];
}

/**
 * Gets the initialization duration in milliseconds
 * @returns Duration or null if not completed
 */
export function getInitializationDuration(): number | null {
  if (!runtimeState.initializationEndTime) {
    return null;
  }
  
  return runtimeState.initializationEndTime - runtimeState.initializationStartTime;
}

/**
 * Checks if the server is ready to serve traffic
 * @returns true if ready, false otherwise
 */
export function isServerReady(): boolean {
  return runtimeState.readyForTraffic && runtimeState.phase === 'runtime';
}

/**
 * Checks if the server is in a failed state
 * @returns true if failed, false otherwise
 */
export function isServerFailed(): boolean {
  return runtimeState.phase === 'unknown';
}

/**
 * Gets a health status summary for API responses
 * @returns Health status object
 */
export function getHealthStatus(): {
  status: 'healthy' | 'unhealthy' | 'initializing' | 'degraded';
  phase: ServerPhase;
  serverReady: boolean;
  canServeTraffic: boolean;
  initializationTime?: number;
  retryAfter?: number;
  checks?: StartupCheckResult[];
  errors?: string[];
  warnings?: string[];
} {
  const state = getRuntimeState();
  const initDuration = getInitializationDuration();
  
  let status: 'healthy' | 'unhealthy' | 'initializing' | 'degraded';
  let retryAfter: number | undefined;
  
  switch (state.phase) {
    case 'runtime':
      status = state.warnings.length > 0 ? 'degraded' : 'healthy';
      break;
    case 'unknown':
      status = 'unhealthy';
      retryAfter = 30; // Suggest retry after 30 seconds
      break;
    case 'build':
      status = 'initializing';
      retryAfter = 10; // Check again in 10 seconds
      break;
    default:
      status = 'unhealthy';
  }
  
  return {
    status,
    phase: state.phase,
    serverReady: isServerReady(),
    canServeTraffic: state.readyForTraffic,
    initializationTime: initDuration || undefined,
    retryAfter,
    checks: state.healthCheckResults?.checks,
    errors: state.errors.length > 0 ? state.errors : undefined,
    warnings: state.warnings.length > 0 ? state.warnings : undefined,
  };
}

/**
 * Resets the runtime state (useful for testing)
 */
export function resetRuntimeState(): void {
  runtimeState = {
    phase: 'runtime',
    initializationStartTime: Date.now(),
    healthCheckResults: null,
    environmentValidation: null,
    readyForTraffic: false,
    errors: [],
    warnings: [],
  };
}

/**
 * Creates a startup check result
 * @param name Check name
 * @param status Check status
 * @param message Check message
 * @param duration Optional duration in milliseconds
 * @param error Optional error message
 * @returns Startup check result
 */
export function createStartupCheckResult(
  name: string,
  status: 'success' | 'failed' | 'warning' | 'skipped',
  message: string,
  duration?: number,
  error?: string
): StartupCheckResult {
  return {
    name,
    status,
    message,
    duration,
    error,
  };
}

/**
 * Creates a startup check summary from individual results
 * @param checks Array of startup check results
 * @returns Startup check summary
 */
export function createStartupCheckSummary(checks: StartupCheckResult[]): StartupCheckSummary {
  const successCount = checks.filter(c => c.status === 'success').length;
  const failedCount = checks.filter(c => c.status === 'failed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const skippedCount = checks.filter(c => c.status === 'skipped').length;
  
  const totalDuration = checks.reduce((sum, check) => sum + (check.duration || 0), 0);
  
  let overallStatus: 'success' | 'failed' | 'warning';
  if (failedCount > 0) {
    overallStatus = 'failed';
  } else if (warningCount > 0) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'success';
  }
  
  return {
    overallStatus,
    totalChecks: checks.length,
    successCount,
    failedCount,
    warningCount,
    skippedCount,
    totalDuration,
    checks,
  };
}