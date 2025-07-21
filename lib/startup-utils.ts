/**
 * Startup Utilities Integration
 * 
 * Demonstrates how to use the build-time detection, environment validation,
 * and runtime state management utilities together.
 */

import { 
  isBuildTime, 
  isRuntimeEnvironment, 
  getCurrentPhase, 
  logWithPhase 
} from './build-runtime-detector';
import { 
  validateEnvironment, 
  getValidationSummary,
  validateServiceEnvironment 
} from './environment-validator';
import { 
  setServerPhase, 
  setEnvironmentValidation, 
  addRuntimeError, 
  addRuntimeWarning,
  getRuntimeState 
} from './runtime-state-manager';

/**
 * Performs startup validation and initialization
 * This function demonstrates the integration of all utilities
 */
export async function performStartupValidation(): Promise<{
  success: boolean;
  canProceed: boolean;
  phase: string;
  summary: string;
}> {
  const phase = getCurrentPhase();
  logWithPhase('Starting startup validation');

  // During build time, skip most validations
  if (isBuildTime()) {
    logWithPhase('Build time detected - performing minimal validation');
    
    const validation = validateEnvironment('build');
    const summary = getValidationSummary(validation);
    
    logWithPhase(summary);
    
    return {
      success: true,
      canProceed: true,
      phase,
      summary: 'Build time validation completed'
    };
  }

  // Runtime validation
  if (isRuntimeEnvironment()) {
    logWithPhase('Runtime environment detected - performing full validation');
    
    setServerPhase('runtime');
    
    const validation = validateEnvironment('runtime-server');
    setEnvironmentValidation(validation);
    
    const summary = getValidationSummary(validation);
    logWithPhase(summary);
    
    if (!validation.isValid) {
      validation.missingRequired.forEach(envVar => {
        addRuntimeError(`Missing required environment variable: ${envVar}`);
      });
      
      setServerPhase('unknown');
      
      return {
        success: false,
        canProceed: false,
        phase,
        summary: 'Runtime validation failed - missing required environment variables'
      };
    }
    
    // Add warnings for missing optional variables
    validation.warnings.forEach(warning => {
      addRuntimeWarning(warning);
    });
    
    // Validate individual services for graceful degradation
    logWithPhase('Validating individual services for graceful degradation');
    const services = ['redis', 'minio', 'database', 'clerk'];
    let hasServiceWarnings = false;
    
    services.forEach(service => {
      const serviceValidation = validateServiceEnvironment(service);
      if (!serviceValidation.isAvailable && serviceValidation.canDegrade) {
        serviceValidation.warnings.forEach(warning => {
          addRuntimeWarning(warning);
          hasServiceWarnings = true;
        });
        logWithPhase(`Service ${service}: ${serviceValidation.warnings.join(', ')}`, 'warn');
      } else if (!serviceValidation.isAvailable && !serviceValidation.canDegrade) {
        const error = `Service ${service}: Missing critical configuration - ${serviceValidation.missingVars.join(', ')}`;
        addRuntimeError(error);
        logWithPhase(error, 'error');
        
        setServerPhase('unknown');
        return {
          success: false,
          canProceed: false,
          phase,
          summary: `Service validation failed - ${service} is missing critical configuration`
        };
      } else {
        logWithPhase(`Service ${service}: Configuration valid`, 'info');
      }
    });
    
    setServerPhase('runtime');
    
    return {
      success: true,
      canProceed: true,
      phase,
      summary: 'Runtime validation completed successfully'
    };
  }

  // Browser environment
  logWithPhase('Browser environment detected - performing client validation');
  
  const validation = validateEnvironment('runtime-browser');
  const summary = getValidationSummary(validation);
  
  logWithPhase(summary);
  
  return {
    success: validation.isValid,
    canProceed: true,
    phase,
    summary: 'Browser validation completed'
  };
}

/**
 * Gets current startup status for API responses
 */
export function getStartupStatus() {
  const phase = getCurrentPhase();
  const state = getRuntimeState();
  
  return {
    phase,
    serverPhase: state.phase,
    readyForTraffic: state.readyForTraffic,
    errors: state.errors,
    warnings: state.warnings,
    environmentValidation: state.environmentValidation,
    healthCheckResults: state.healthCheckResults,
  };
}

/**
 * Safe initialization wrapper that only runs at runtime
 */
export function safeRuntimeInitialization<T>(
  initFn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  if (isBuildTime()) {
    logWithPhase('Skipping initialization during build time');
    return Promise.resolve(fallback);
  }
  
  logWithPhase('Running runtime initialization');
  return initFn().catch(error => {
    addRuntimeError(`Initialization failed: ${error.message}`);
    setServerPhase('unknown');
    throw error;
  });
}