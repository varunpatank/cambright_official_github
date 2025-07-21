# Design Document

## Overview

This design addresses the production deployment issue where Docker builds fail due to build-time health checks requiring runtime environment variables. The solution separates build-time operations from runtime operations, ensuring health checks only run when the container starts with proper environment variables.

## Architecture

### Current Problem
- Health checks run during Next.js build via `instrumentation.ts`
- Build process requires database connections and external services
- Production environment variables not available during Docker build
- Frontend receives inconsistent health status responses

### Proposed Solution
- Move health checks from build-time to runtime-only execution
- Implement proper build/runtime environment separation
- Add container readiness probes for orchestration
- Improve frontend error handling and retry logic

## Components and Interfaces

### 1. Build-Time Safety Layer

**Purpose**: Prevent health checks from running during build process

**Implementation**:
```typescript
// lib/build-runtime-detector.ts
export function isBuildTime(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build' || 
         process.env.NODE_ENV === 'production' && !process.env.RUNTIME_ENVIRONMENT
}

export function isRuntimeEnvironment(): boolean {
  return !isBuildTime() && typeof window === 'undefined'
}
```

### 2. Enhanced Server Startup Module

**Purpose**: Conditionally run health checks only at runtime

**Changes to `lib/server-startup.ts`**:
- Add build-time detection
- Skip health checks during build
- Implement delayed initialization for runtime
- Add startup state persistence

```typescript
// Modified initialization logic
export async function initializeServer(): Promise<void> {
  if (isBuildTime()) {
    console.log('🏗️  Build time detected - skipping health checks')
    return
  }
  
  // Existing health check logic...
}
```

### 3. Runtime Environment Validator

**Purpose**: Validate environment variables are available at runtime

**Implementation**:
```typescript
// lib/runtime-env-validator.ts
export function validateRuntimeEnvironment(): {
  isValid: boolean
  missingVars: string[]
  warnings: string[]
} {
  const required = ['DATABASE_URL', 'CLERK_SECRET_KEY']
  const optional = ['REDIS_URL', 'MINIO_URL']
  
  // Validation logic
}
```

### 4. Container Health Endpoints

**Purpose**: Provide proper health check endpoints for container orchestration

**New endpoints**:
- `/api/health/ready` - Readiness probe (app can serve traffic)
- `/api/health/live` - Liveness probe (container is alive)
- `/api/health/startup` - Startup probe (initialization complete)

### 5. Frontend Health Detection Improvements

**Purpose**: Better handle server initialization states and network issues

**Changes to `components/startup-checker.tsx`**:
- Add retry logic with exponential backoff
- Improve error differentiation (network vs server issues)
- Add timeout handling for slow startup
- Better loading state management

## Data Models

### Server State Model
```typescript
interface ServerRuntimeState {
  phase: 'build' | 'starting' | 'initializing' | 'ready' | 'failed'
  initializationStartTime: number
  healthCheckResults: StartupCheckSummary | null
  environmentValidation: EnvironmentValidationResult
  readyForTraffic: boolean
}
```

### Health Check Response Model
```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'initializing' | 'degraded'
  phase: 'build' | 'runtime'
  checks?: StartupCheckResult[]
  serverReady: boolean
  canServeTraffic: boolean
  initializationTime?: number
  retryAfter?: number // seconds to wait before retry
}
```

## Error Handling

### Build-Time Error Prevention
- Skip all external service connections during build
- Use environment variable defaults for build process
- Log build-time vs runtime phase clearly
- Fail gracefully if critical build dependencies missing

### Runtime Error Recovery
- Implement startup timeout (max 60 seconds)
- Retry failed health checks with exponential backoff
- Provide clear error messages for each failure type
- Allow degraded mode operation when possible

### Frontend Error Handling
- Distinguish between network errors and server errors
- Implement retry logic for transient failures
- Show appropriate loading states during startup
- Provide actionable error messages to users

## Testing Strategy

### Unit Tests
- Test build-time detection logic
- Test environment validation functions
- Test health check conditional execution
- Test frontend error handling scenarios

### Integration Tests
- Test Docker build without environment variables
- Test container startup with production environment
- Test health endpoint responses during different phases
- Test frontend behavior with various server states

### End-to-End Tests
- Test complete deployment pipeline
- Test container orchestration health checks
- Test user experience during server startup
- Test error recovery scenarios

## Implementation Phases

### Phase 1: Build-Time Safety
1. Implement build-time detection utilities
2. Modify server startup to skip health checks during build
3. Update Docker build process
4. Test build without environment variables

### Phase 2: Runtime Health Checks
1. Implement runtime environment validation
2. Add delayed health check initialization
3. Create new health check endpoints
4. Test runtime health check execution

### Phase 3: Frontend Improvements
1. Enhance startup checker with retry logic
2. Improve error handling and user feedback
3. Add timeout and loading state management
4. Test frontend behavior with various server states

### Phase 4: Container Integration
1. Add Docker health check configuration
2. Implement Kubernetes readiness/liveness probes
3. Test container orchestration integration
4. Document deployment procedures

## Configuration Changes

### Environment Variables
```bash
# New runtime detection variable
RUNTIME_ENVIRONMENT=true  # Set by container startup script

# Health check configuration
HEALTH_CHECK_TIMEOUT=30000
HEALTH_CHECK_RETRY_ATTEMPTS=3
STARTUP_TIMEOUT=60000
```

### Docker Configuration
```dockerfile
# Add health check to Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health/live || exit 1

# Add startup script to set runtime environment
COPY scripts/container-startup.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/container-startup.sh
CMD ["/usr/local/bin/container-startup.sh"]
```

### Next.js Configuration
```javascript
// next.config.js - ensure instrumentation only runs at runtime
const nextConfig = {
  experimental: {
    instrumentationHook: process.env.NEXT_PHASE !== 'phase-production-build'
  }
}
```

## Monitoring and Observability

### Logging Enhancements
- Clear phase identification in all logs
- Structured logging for health check results
- Performance metrics for startup time
- Error categorization and tracking

### Metrics Collection
- Startup time distribution
- Health check success/failure rates
- Frontend error rates by type
- Container restart frequency

### Alerting
- Critical health check failures
- Startup timeout alerts
- High error rates from frontend
- Container orchestration issues