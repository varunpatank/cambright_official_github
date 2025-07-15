# Health Check System

CamBright includes a comprehensive health check system that verifies database connections, external services, and critical application dependencies on startup.

## 🚀 Overview

The health check system provides:
- **Automatic startup verification** - Checks run when the application starts
- **API health endpoints** - `/api/health` for monitoring systems
- **CLI health scripts** - Manual verification during deployment
- **Real-time user feedback** - Visual status indicators for users
- **Comprehensive logging** - Structured logging for monitoring systems

## 📊 Health Check Components

### Services Monitored

1. **Database (PostgreSQL)** - Connection and query execution
2. **Clerk Authentication** - API connectivity and configuration
3. **MinIO Storage** - File upload and storage service  
4. **Redis Cache** - Connection test (optional, falls back to memory)
5. **File Storage** - Schools bucket initialization
6. **Tutor Service** - Cache and database connectivity
7. **External Data Files** - CSV files for quizzer functionality
8. **Environment Variables** - Required configuration validation

### Health States

- **🟢 Healthy** - All services operational
- **🟡 Degraded** - Some non-critical services unavailable  
- **🔴 Unhealthy** - Critical services failed (database, auth, etc.)

## 🛠️ Usage

### 1. Automatic Startup Checks

Health checks run automatically when the application starts. Users will see:

- **Loading screen** during health verification
- **Success state** - application loads normally
- **Warning banner** - for degraded services
- **Error screen** - for critical failures with retry options

### 2. API Health Endpoints

#### Quick Health Check
```bash
curl http://localhost:3000/api/health
```
Returns: `200` (healthy) or `503` (unhealthy)

#### Detailed Health Report  
```bash
curl http://localhost:3000/api/health?detailed=true
```
Returns comprehensive status with response times and error details.

### 3. CLI Health Scripts

#### Basic Health Check
```bash
pnpm health:check
```

#### Production Health Check
```bash  
pnpm health:check:prod
```

#### Structured JSON Output
```bash
pnpm health:check:json
```

### 4. Manual Health Check Script

```bash
# Run with custom options
tsx scripts/startup-health-check.ts

# With structured logging
STRUCTURED_LOGGING=true tsx scripts/startup-health-check.ts

# Write results to file
HEALTH_CHECK_LOG_FILE=/tmp/health.json tsx scripts/startup-health-check.ts
```

## 🔧 Configuration

### Environment Variables

#### Required for Health Checks
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

#### Optional Services
```env
# Redis (falls back to memory cache)
REDIS_URL=redis://localhost:6379

# MinIO (file uploads and storage)
MINIO_URL=http://localhost:9000/
MINIO_KEY_ID=your-access-key
MINIO_ACCESS_KEY=your-secret-key

# Health check configuration
STRUCTURED_LOGGING=true
HEALTH_CHECK_LOG_FILE=/var/log/health.json
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Startup Checker Configuration

```tsx
<StartupChecker showDetailedErrors={process.env.NODE_ENV === 'development'}>
  {children}
</StartupChecker>
```

Options:
- `showDetailedErrors`: Show detailed error information (recommended for development)

## 📈 Monitoring Integration

### Prometheus/Grafana

Use the structured JSON output for metrics:

```bash
# Generate health metrics
STRUCTURED_LOGGING=true pnpm health:check > /tmp/health.json
```

### Docker Health Checks

Add to `Dockerfile`:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD tsx scripts/startup-health-check.ts || exit 1
```

### Kubernetes Liveness/Readiness

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health?detailed=true
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```
❌ Database (PostgreSQL): Database connection failed: connect ECONNREFUSED
```

**Solutions:**
- Verify `DATABASE_URL` is correct
- Ensure database server is running
- Check network connectivity and firewall rules

#### Clerk Authentication Failed  
```
❌ Clerk Authentication: Missing Clerk environment variables
```

**Solutions:**
- Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- Verify keys are valid and not expired

#### Redis Connection Warning
```
⚠️ Redis Cache: Redis unavailable (using memory fallback)
```

**Solutions:**
- This is usually acceptable - application will use memory cache
- To fix: Set `REDIS_URL` and ensure Redis server is running

#### File Storage Initialization Failed
```
❌ File Storage (Schools): Failed to initialize schools file storage
```

**Solutions:**
- Check file system permissions
- Verify `data/schools` directory exists and is writable

### Exit Codes

The health check script uses standard exit codes:

- `0` - Success (healthy)
- `1` - Failure (unhealthy or degraded in production)
- `130` - Interrupted (SIGINT)
- `143` - Terminated (SIGTERM)

### Development vs Production

**Development Mode:**
- Shows detailed error information to users
- Degraded services don't cause exit code 1
- More verbose logging

**Production Mode:**  
- Minimal error details shown to users
- Degraded services cause deployment failure
- Structured logging for monitoring systems

## 🔍 Log Examples

### Successful Health Check
```
2024-01-15T10:30:00.000Z [INFO] 🚀 Starting CamBright Health Check...
2024-01-15T10:30:00.001Z [INFO] 🌍 Environment: production
2024-01-15T10:30:02.150Z [INFO] 🏥 Health Check Summary: HEALTHY
2024-01-15T10:30:02.150Z [INFO] ⏱️  Total Time: 2149ms
2024-01-15T10:30:02.150Z [INFO] ❌ Critical Failures: 0
2024-01-15T10:30:02.150Z [INFO] ⚠️  Warnings: 1
2024-01-15T10:30:02.150Z [INFO] ✅ Total Checks: 8
```

### Failed Health Check
```
2024-01-15T10:30:00.000Z [INFO] 🚀 Starting CamBright Health Check...
2024-01-15T10:30:05.000Z [ERROR] ❌ Health check script failed after 5000ms
❌ Database (PostgreSQL) (5000ms)
   UNHEALTHY: Database connection failed: Operation timed out
```

## 🚧 Advanced Usage

### Custom Health Checks

Add custom health checks to `lib/startup-checks.ts`:

```typescript
async function checkCustomService(): Promise<StartupCheckResult> {
  // Your custom health check logic
  return {
    service: 'Custom Service',
    status: 'healthy',
    message: 'Service is operational',
    timestamp: new Date().toISOString(),
    responseTime: 100
  }
}

// Add to runStartupChecks function
const checks = await Promise.allSettled([
  // ... existing checks
  checkCustomService()
])
```

### Health Check Webhooks

Configure webhook notifications for health check failures:

```bash
# Example webhook notification
if [ $? -ne 0 ]; then
  curl -X POST https://your-webhook-url.com/alerts \
    -H "Content-Type: application/json" \
    -d '{"message": "CamBright health check failed", "severity": "critical"}'
fi
``` 