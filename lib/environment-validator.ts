/**
 * Environment Validation Utilities
 * 
 * Validates that required environment variables are available at runtime
 * and provides fallbacks for build-time execution.
 */

export interface EnvironmentValidationResult {
  isValid: boolean;
  missingRequired: string[];
  missingOptional: string[];
  warnings: string[];
  phase: 'build' | 'runtime-server' | 'runtime-browser';
}

/**
 * Required environment variables for runtime operation
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
] as const;

/**
 * Optional environment variables that enhance functionality
 */
const OPTIONAL_ENV_VARS = [
  'REDIS_URL',
  'MINIO_URL',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
] as const;

/**
 * Environment variables that should be available during build
 */
const BUILD_TIME_ENV_VARS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
] as const;

/**
 * Validates the current environment configuration
 * @param phase Current execution phase
 * @returns Validation result with details about missing variables
 */
export function validateEnvironment(
  phase: 'build' | 'runtime-server' | 'runtime-browser' = 'runtime-server'
): EnvironmentValidationResult {
  const result: EnvironmentValidationResult = {
    isValid: true,
    missingRequired: [],
    missingOptional: [],
    warnings: [],
    phase,
  };

  // During build time, only validate build-time variables
  if (phase === 'build') {
    for (const envVar of BUILD_TIME_ENV_VARS) {
      if (!process.env[envVar]) {
        result.warnings.push(`Build-time environment variable missing: ${envVar}`);
      }
    }
    
    // Build time is considered valid even with missing variables
    return result;
  }

  // Runtime validation - check all required variables
  if (phase === 'runtime-server') {
    for (const envVar of REQUIRED_ENV_VARS) {
      if (!process.env[envVar]) {
        result.missingRequired.push(envVar);
        result.isValid = false;
      }
    }

    for (const envVar of OPTIONAL_ENV_VARS) {
      if (!process.env[envVar]) {
        result.missingOptional.push(envVar);
      }
    }
  }

  // Browser runtime validation - only check public variables
  if (phase === 'runtime-browser') {
    const publicVars = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS].filter(
      var_ => var_.startsWith('NEXT_PUBLIC_')
    );
    
    for (const envVar of publicVars) {
      if (!process.env[envVar]) {
        if (REQUIRED_ENV_VARS.includes(envVar as any)) {
          result.missingRequired.push(envVar);
          result.isValid = false;
        } else {
          result.missingOptional.push(envVar);
        }
      }
    }
  }

  // Add warnings for missing optional variables
  if (result.missingOptional.length > 0) {
    result.warnings.push(
      `Optional environment variables missing: ${result.missingOptional.join(', ')}`
    );
  }

  return result;
}

/**
 * Gets a safe environment variable value with fallback
 * @param key Environment variable key
 * @param fallback Fallback value if not found
 * @param required Whether this variable is required
 * @returns Environment variable value or fallback
 */
export function getSafeEnvVar(
  key: string, 
  fallback: string = '', 
  required: boolean = false
): string {
  const value = process.env[key];
  
  if (!value) {
    if (required) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return fallback;
  }
  
  return value;
}

/**
 * Validates database connection string format
 * @param databaseUrl Database URL to validate
 * @returns true if valid format, false otherwise
 */
export function validateDatabaseUrl(databaseUrl?: string): boolean {
  if (!databaseUrl) return false;
  
  // Basic PostgreSQL URL validation
  const postgresUrlPattern = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+(\?.*)?$/;
  return postgresUrlPattern.test(databaseUrl);
}

/**
 * Validates Redis connection string format
 * @param redisUrl Redis URL to validate
 * @returns true if valid format, false otherwise
 */
export function validateRedisUrl(redisUrl?: string): boolean {
  if (!redisUrl) return false;
  
  // Basic Redis URL validation
  const redisUrlPattern = /^redis:\/\/([^:]*:[^@]*@)?[^:]+:\d+(\?.*)?$/;
  return redisUrlPattern.test(redisUrl);
}

/**
 * Validates service-specific environment variables and provides graceful degradation
 * @param serviceName Name of the service to validate
 * @returns Service validation result
 */
export function validateServiceEnvironment(serviceName: string): {
  isAvailable: boolean;
  canDegrade: boolean;
  missingVars: string[];
  warnings: string[];
} {
  const result = {
    isAvailable: true,
    canDegrade: false,
    missingVars: [] as string[],
    warnings: [] as string[]
  };

  switch (serviceName.toLowerCase()) {
    case 'redis':
    case 'cache':
      result.canDegrade = true; // Redis is always optional
      if (!process.env.REDIS_URL) {
        result.isAvailable = false;
        result.missingVars.push('REDIS_URL');
        result.warnings.push('Redis not configured - falling back to memory cache');
      }
      break;

    case 'minio':
    case 'storage':
      result.canDegrade = true; // MinIO is always optional
      const minioVars = ['MINIO_URL', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY'];
      const missingMinioVars = minioVars.filter(v => !process.env[v]);
      if (missingMinioVars.length > 0) {
        result.isAvailable = false;
        result.missingVars.push(...missingMinioVars);
        result.warnings.push('MinIO not configured - file uploads may be limited');
      }
      break;

    case 'database':
      result.canDegrade = false; // Database is critical
      if (!process.env.DATABASE_URL) {
        result.isAvailable = false;
        result.missingVars.push('DATABASE_URL');
      } else if (!validateDatabaseUrl(process.env.DATABASE_URL)) {
        result.isAvailable = false;
        result.warnings.push('Database URL format is invalid');
      }
      break;

    case 'clerk':
    case 'auth':
      result.canDegrade = false; // Auth is critical
      const clerkVars = ['CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'];
      const missingClerkVars = clerkVars.filter(v => !process.env[v]);
      if (missingClerkVars.length > 0) {
        result.isAvailable = false;
        result.missingVars.push(...missingClerkVars);
      }
      break;

    default:
      result.warnings.push(`Unknown service: ${serviceName}`);
  }

  return result;
}

/**
 * Gets graceful degradation recommendations for missing optional services
 * @param missingOptional Array of missing optional environment variables
 * @returns Array of degradation recommendations
 */
export function getGracefulDegradationRecommendations(missingOptional: string[]): string[] {
  const recommendations: string[] = [];

  if (missingOptional.includes('REDIS_URL')) {
    recommendations.push('Application will use in-memory caching instead of Redis');
  }

  if (missingOptional.some(v => v.startsWith('MINIO_'))) {
    recommendations.push('File uploads will be limited without MinIO configuration');
  }

  if (missingOptional.includes('NEXT_PUBLIC_CLERK_SIGN_IN_URL')) {
    recommendations.push('Using default Clerk sign-in URL');
  }

  if (missingOptional.includes('NEXT_PUBLIC_CLERK_SIGN_UP_URL')) {
    recommendations.push('Using default Clerk sign-up URL');
  }

  return recommendations;
}

/**
 * Gets environment validation summary for logging
 * @param result Validation result
 * @returns Formatted summary string
 */
export function getValidationSummary(result: EnvironmentValidationResult): string {
  const { phase, isValid, missingRequired, missingOptional, warnings } = result;
  
  let summary = `Environment validation for ${phase}: `;
  
  if (isValid) {
    summary += '✅ VALID';
  } else {
    summary += '❌ INVALID';
  }
  
  if (missingRequired.length > 0) {
    summary += `\n  Missing required: ${missingRequired.join(', ')}`;
  }
  
  if (missingOptional.length > 0) {
    summary += `\n  Missing optional: ${missingOptional.join(', ')}`;
    
    // Add graceful degradation recommendations
    const recommendations = getGracefulDegradationRecommendations(missingOptional);
    if (recommendations.length > 0) {
      summary += `\n  Graceful degradation: ${recommendations.join('; ')}`;
    }
  }
  
  if (warnings.length > 0) {
    summary += `\n  Warnings: ${warnings.join('; ')}`;
  }
  
  return summary;
}