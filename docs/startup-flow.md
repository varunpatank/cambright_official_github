# Server Startup Flow Documentation

## Overview

The application now performs comprehensive health checks during server startup rather than on first user request. This ensures that critical services are verified before the application begins serving traffic.

## How It Works

### 1. Server Initialization (instrumentation.ts)
- Next.js calls the `register()` function when the server starts
- This triggers `initializeServer()` from `lib/server-startup.ts`
- All startup checks run before any HTTP requests are handled

### 2. Startup Checks (lib/startup-checks.ts)
The following services are verified during startup:
- **Database connectivity** (PostgreSQL/Prisma)
- **Clerk authentication service**
- **MinIO file storage**
- **Redis cache** (optional)
- **Schools data in database**
- **Tutor service initialization**
- **External data files**
- **Environment variables**

### 3. Frontend Health Display (components/startup-checker.tsx)
- Fetches startup results from `/api/health?detailed=true`
- Shows detailed error information with clear logging
- Provides actionable error messages and troubleshooting steps
- Only runs once per browser session to avoid repeated checks

### 4. Health API Endpoint (app/api/health/route.ts)
- Returns pre-computed startup check results
- No longer runs checks on-demand (performance improvement)
- Provides both quick and detailed health status

## Benefits

### ✅ **Faster User Experience**
- No waiting for health checks on first page load
- Immediate feedback if services are unavailable
- Cached results prevent repeated expensive checks

### ✅ **Better Error Visibility**
- Clear console logging with emojis and structured output
- Detailed error messages with troubleshooting hints
- Development vs production appropriate error levels

### ✅ **Improved Reliability**
- Server won't start if critical services are unavailable
- Early detection of configuration issues
- Graceful degradation for non-critical services

### ✅ **Enhanced Monitoring**
- Structured startup logs for monitoring systems
- Health endpoints for load balancers
- Detailed timing information for performance analysis

## Usage

### Development
```bash
# Start development server (startup checks run automatically)
npm run dev

# Manual health check
npm run health:check

# Test startup flow
npm run test:startup
```

### Production
```bash
# Build and start (startup checks run automatically)
npm run build
npm start

# Production health check
npm run health:check:prod

# Structured logging for monitoring
npm run health:check:json
```

## Configuration

### Environment Variables
Ensure these critical environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `MINIO_*` - MinIO configuration variables
- `REDIS_URL` - Redis connection (optional)

### Startup Behavior
- **Development**: Server continues with warnings, shows detailed errors
- **Production**: Server exits on critical failures, minimal error exposure

### Timeouts
- Each service check: 10 seconds timeout
- Total startup process: No overall timeout (depends on service availability)

## Troubleshooting

### Common Issues

#### 🔴 Database Connection Failed
```
❌ Database: Connection failed after 10000ms
```
**Solutions:**
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL server is running
- Check network connectivity
- Run `npx prisma db push` to ensure schema is up to date

#### 🔴 Clerk Authentication Failed
```
❌ Clerk Auth: Invalid API key or network error
```
**Solutions:**
- Verify `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Check Clerk dashboard for API key status
- Ensure network access to Clerk services

#### 🔴 MinIO Storage Failed
```
❌ MinIO: Connection refused or invalid credentials
```
**Solutions:**
- Check MinIO server status
- Verify `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- Ensure MinIO bucket exists and is accessible

### Debug Commands

```bash
# Detailed health check with full output
npm run health:check

# JSON formatted output for parsing
STRUCTURED_LOGGING=true npm run health:check

# Test specific startup flow components
npm run test:startup

# Check server logs during startup
npm run dev 2>&1 | grep -E "(✅|❌|⚠️)"
```

### Browser Console Logging

The frontend provides detailed console logging:

```javascript
// Successful startup
🔍 Fetching server startup status...
📊 Server startup report received: {overall: "healthy", totalTime: 1250, ...}
🔧 Service Status Details:
  ✅ Database: Connected successfully
  ✅ Clerk Auth: Authentication service healthy
  ✅ MinIO: File storage operational

// Failed startup
❌ Health check request failed: {status: 503, statusText: "Service Unavailable"}
🚨 Critical startup failures detected!
💥 Startup check request failed: Error: Health check failed: 503 Service Unavailable
```

## API Reference

### GET /api/health
Quick health check for monitoring systems.

**Response:**
```json
{
  "status": "healthy" | "unhealthy",
  "message": "string",
  "timestamp": "ISO string"
}
```

### GET /api/health?detailed=true
Comprehensive health report with startup check results.

**Response:**
```json
{
  "overall": "healthy" | "degraded" | "unhealthy",
  "checks": [
    {
      "service": "Database",
      "status": "healthy" | "warning" | "unhealthy",
      "message": "Connection successful",
      "timestamp": "ISO string",
      "responseTime": 150
    }
  ],
  "totalTime": 1250,
  "criticalFailures": 0,
  "warnings": 0,
  "serverStartupTime": 1250,
  "serverReady": true,
  "reportGeneratedAt": "ISO string"
}
```

## Migration from Previous Version

### What Changed
1. **Startup checks moved from first request to server startup**
2. **Enhanced error logging and user feedback**
3. **Cached results for better performance**
4. **Production-ready error handling**

### Breaking Changes
- None - the API remains the same
- Frontend behavior is improved but compatible

### Recommended Actions
1. Update monitoring systems to use new health endpoint structure
2. Review server startup logs for any new warnings
3. Test deployment process with new startup behavior
4. Update documentation for your team about new error messages