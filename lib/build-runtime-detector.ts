/**
 * Build-time vs Runtime Detection Utilities
 * 
 * These utilities help distinguish between build-time and runtime execution
 * to prevent health checks and external service connections during Docker builds.
 */

/**
 * Detects if the current execution is happening during build time
 * @returns true if running during build phase, false otherwise
 */
export function isBuildTime(): boolean {
  // Check Next.js build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return true;
  }

  // Check if we're in production mode but without runtime environment marker
  if (process.env.NODE_ENV === 'production' && !process.env.RUNTIME_ENVIRONMENT) {
    return true;
  }

  // Check for common build-time indicators
  if (process.env.CI === 'true' && !process.env.RUNTIME_ENVIRONMENT) {
    return true;
  }

  return false;
}

/**
 * Detects if the current execution is happening at runtime (server-side)
 * @returns true if running at runtime on server, false otherwise
 */
export function isRuntimeEnvironment(): boolean {
  // Must not be build time and must be server-side
  return !isBuildTime() && typeof window === 'undefined';
}

/**
 * Detects if the current execution is happening in the browser
 * @returns true if running in browser, false otherwise
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Gets the current execution phase
 * @returns string indicating the current phase
 */
export function getCurrentPhase(): 'build' | 'runtime' | 'unknown' {
  if (isBuildTime()) {
    return 'build';
  }
  
  if (isBrowserEnvironment() || isRuntimeEnvironment()) {
    return 'runtime';
  }
  
  return 'unknown';
}

/**
 * Gets the detailed execution phase
 * @returns detailed string indicating the current phase
 */
export function getDetailedPhase(): 'build' | 'runtime-server' | 'runtime-browser' {
  if (isBuildTime()) {
    return 'build';
  }
  
  if (isBrowserEnvironment()) {
    return 'runtime-browser';
  }
  
  return 'runtime-server';
}

/**
 * Safely executes a function only during runtime (not build time)
 * @param fn Function to execute
 * @param fallback Optional fallback value to return during build time
 * @returns Result of function or fallback value
 */
export function executeAtRuntime<T>(
  fn: () => T | Promise<T>, 
  fallback?: T
): T | Promise<T> | undefined {
  if (isBuildTime()) {
    return fallback;
  }
  
  return fn();
}

/**
 * Logs a message with phase context
 * @param message Message to log
 * @param level Log level
 */
export function logWithPhase(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  const phase = getCurrentPhase();
  const prefixedMessage = `[${phase.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'warn':
      console.warn(prefixedMessage);
      break;
    case 'error':
      console.error(prefixedMessage);
      break;
    default:
      console.log(prefixedMessage);
  }
}