# Docker Deployment Configuration

## Overview

This document describes the Docker deployment configuration for CamBright, which has been updated to separate build-time and runtime operations to fix production deployment issues.

## Key Changes

### Problem Solved
- **Issue**: Docker builds were failing because health checks ran during build time, requiring production environment variables that weren't available during the build process.
- **Solution**: Implemented build-time detection to skip health checks during Docker build, and moved all health checks to runtime only.

### Architecture Changes
1. **Build-Time Safety**: Health checks are automatically skipped during Docker build
2. **Runtime Environment Detection**: Container startup script sets `RUNTIME_ENVIRONMENT=true`
3. **Proper Health Check Endpoints**: Multiple health check endpoints for different container orchestration needs
4. **Graceful Startup**: Container startup script handles environment validation and graceful shutdown

## Files Modified

### 1. Dockerfile
- **Multi-stage optimization**: Better layer caching with package files copied first
- **Security**: Non-root user (nextjs:nodejs) for running the application
- **Health checks**: Configured with proper startup period and retry logic
- **Startup script**: Uses custom startup script instead of direct `pnpm start`

### 2. Container Startup Script (`scripts/container-startup.sh`)
- **Environment validation**: Checks required and optional environment variables
- **Runtime flag**: Sets `RUNTIME_ENVIRONMENT=true` to indicate runtime phase
- **Database migrations**: Automatically runs Prisma migrations if available
- **Graceful shutdown**: Handles SIGTERM and SIGINT signals properly
- **Logging**: Structured logging with timestamps and color coding

### 3. Docker Health Check Script (`scripts/docker-health-check.sh`)
- **Retry logic**: Configurable retries with exponential backoff
- **Multiple endpoints**: Can check different health endpoints
- **Detailed logging**: Comprehensive error reporting and troubleshooting tips
- **Signal handling**: Graceful handling of interruption signals

### 4. Docker Compose Configuration
- **Health checks**: Proper readiness probe configuration
- **Dependencies**: Correct service dependency management
- **Environment**: Runtime environment flag set automatically

### 5. Build Script (`buildandpush.cmd`)
- **Error handling**: Checks for build and push failures
- **User feedback**: Clear success/failure messages
- **Usage instructions**: Helpful commands for running the built image

## Health Check Endpoints

The application provides multiple health check endpoints for different use cases:

### `/api/health`
- **Purpose**: General health status
- **Use case**: Manual health checks and monitoring

### `/api/health/ready`
- **Purpose**: Readiness probe for container orchestration
- **Use case**: Kubernetes readiness probes, load balancer health checks
- **Behavior**: Returns 200 when app can serve traffic

### `/api/health/live`
- **Purpose**: Liveness probe for container orchestration
- **Use case**: Docker health checks, Kubernetes liveness probes
- **Behavior**: Returns 200 when container is alive and responsive

### `/api/health/startup`
- **Purpose**: Startup probe for container orchestration
- **Use case**: Kubernetes startup probes during application initialization
- **Behavior**: Returns 200 when initialization is complete

## Environment Variables

### Required Variables
```bash
DATABASE_URL=postgresql://...           # Database connection string
CLERK_SECRET_KEY=sk_...                # Clerk authentication secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_... # Clerk public key
```

### Optional Variables
```bash
REDIS_URL=redis://localhost:6379       # Redis cache connection
MINIO_ENDPOINT=localhost:9000          # MinIO file storage
MINIO_ACCESS_KEY=minioadmin           # MinIO access credentials
MINIO_SECRET_KEY=minioadmin           # MinIO secret credentials
```

### Runtime Configuration
```bash
RUNTIME_ENVIRONMENT=true              # Set automatically by startup script
HEALTH_CHECK_TIMEOUT=10               # Health check timeout in seconds
HEALTH_CHECK_RETRIES=3                # Number of health check retries
HEALTH_CHECK_RETRY_DELAY=2            # Delay between retries in seconds
```

## Usage

### Building the Image
```bash
# Using the build script (Windows)
buildandpush.cmd

# Manual build
docker build -t ghcr.io/not-varram/cambright:latest .
```

### Running with Docker
```bash
# Run with environment file
docker run -d -p 3000:3000 --env-file .env ghcr.io/not-varram/cambright:latest

# Run with individual environment variables
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e CLERK_SECRET_KEY="sk_..." \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..." \
  ghcr.io/not-varram/cambright:latest
```

### Running with Docker Compose
```bash
# Development (builds locally)
docker-compose up -d

# Production (uses pre-built image)
# Uncomment the image line in docker-compose.yml
docker-compose up -d
```

## Health Check Configuration

### Docker Health Check
The Dockerfile includes a built-in health check:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /usr/local/bin/docker-health-check.sh
```

### Kubernetes Health Checks
```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: cambright
    image: ghcr.io/not-varram/cambright:latest
    ports:
    - containerPort: 3000
    livenessProbe:
      httpGet:
        path: /api/health/live
        port: 3000
      initialDelaySeconds: 60
      periodSeconds: 30
      timeoutSeconds: 10
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /api/health/ready
        port: 3000
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 5
      failureThreshold: 3
    startupProbe:
      httpGet:
        path: /api/health/startup
        port: 3000
      initialDelaySeconds: 10
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 30
```

## Troubleshooting

### Build Issues

#### "Health checks failing during build"
- **Cause**: Old Docker configuration running health checks during build
- **Solution**: Update to latest Dockerfile which skips health checks during build

#### "Missing environment variables during build"
- **Cause**: Build process trying to connect to services
- **Solution**: Build-time detection now prevents service connections during build

### Runtime Issues

#### "Container fails to start"
- **Check**: Environment variables are properly set
- **Check**: Database is accessible from container
- **Check**: Required services (Redis, MinIO) are available
- **Logs**: `docker logs <container-name>` for detailed error messages

#### "Health checks failing"
- **Check**: Application is fully started (may take up to 60 seconds)
- **Check**: Health endpoints are accessible: `curl http://localhost:3000/api/health/live`
- **Check**: No firewall blocking health check requests

#### "Database connection issues"
- **Check**: `DATABASE_URL` is correctly formatted
- **Check**: Database server is accessible from container network
- **Check**: Database credentials are correct

### Monitoring

#### Container Status
```bash
# Check container health
docker ps

# View health check logs
docker inspect <container-name> | grep Health -A 10

# Follow container logs
docker logs -f <container-name>
```

#### Application Logs
The startup script provides structured logging:
- `[INFO]` - General information
- `[WARN]` - Warnings (non-critical issues)
- `[ERROR]` - Errors (critical issues)
- `[SUCCESS]` - Successful operations

## Security Considerations

### Non-Root User
The container runs as a non-root user (`nextjs:nodejs`) for security:
- UID: 1001
- GID: 1001
- Home: `/app`

### File Permissions
- Application files: Owned by `nextjs:nodejs`
- Scripts: Executable by container user
- Sensitive files: Not included in image (via `.dockerignore`)

### Network Security
- Only port 3000 is exposed
- Health checks use internal networking
- No unnecessary services or ports

## Performance Optimization

### Build Optimization
- **Layer caching**: Package files copied before application code
- **Multi-stage potential**: Ready for multi-stage builds if needed
- **Dependency optimization**: Only production dependencies in final image

### Runtime Optimization
- **Health check intervals**: Balanced between responsiveness and resource usage
- **Startup period**: 60-second grace period for application initialization
- **Resource limits**: Can be configured via Docker/Kubernetes resource constraints

## Migration from Previous Configuration

### What Changed
1. **Health checks**: Moved from build-time to runtime-only
2. **Startup process**: Now uses custom startup script
3. **Environment validation**: Added comprehensive validation
4. **Error handling**: Improved error messages and recovery

### Migration Steps
1. Update Dockerfile to latest version
2. Rebuild Docker image
3. Update docker-compose.yml if using
4. Test health endpoints after deployment
5. Monitor startup logs for any issues

### Rollback Plan
If issues occur, you can temporarily:
1. Use previous Dockerfile version
2. Set health check endpoints to return 200 always
3. Skip environment validation in startup script
4. Use direct `pnpm start` instead of startup script