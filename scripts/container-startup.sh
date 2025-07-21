#!/bin/sh
# Container startup script for CamBright
# This script sets up the runtime environment and starts the application

set -e

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Set runtime environment variable to indicate we're in runtime phase
export RUNTIME_ENVIRONMENT=true

log_info "🚀 Starting CamBright container..."
log_info "📍 Working directory: $(pwd)"
log_info "🌍 Environment: ${NODE_ENV:-development}"
log_info "🔧 Runtime environment flag set: ${RUNTIME_ENVIRONMENT}"

# Validate critical environment variables
log_info "🔍 Validating environment variables..."

MISSING_VARS=""
OPTIONAL_MISSING=""

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
    MISSING_VARS="$MISSING_VARS DATABASE_URL"
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
    MISSING_VARS="$MISSING_VARS CLERK_SECRET_KEY"
fi

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    MISSING_VARS="$MISSING_VARS NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
fi

# Check optional environment variables
if [ -z "$REDIS_URL" ]; then
    OPTIONAL_MISSING="$OPTIONAL_MISSING REDIS_URL"
fi

if [ -z "$MINIO_ENDPOINT" ]; then
    OPTIONAL_MISSING="$OPTIONAL_MISSING MINIO_ENDPOINT"
fi

# Report missing variables
if [ -n "$MISSING_VARS" ]; then
    log_error "❌ Missing required environment variables: $MISSING_VARS"
    log_error "🛑 Cannot start application without required environment variables"
    exit 1
fi

if [ -n "$OPTIONAL_MISSING" ]; then
    log_warn "⚠️  Missing optional environment variables: $OPTIONAL_MISSING"
    log_warn "🔄 Application will run with reduced functionality"
fi

log_success "✅ Environment validation completed"

# Run database migrations if needed
log_info "🗄️  Checking database migrations..."
if command -v npx >/dev/null 2>&1; then
    if npx prisma migrate status >/dev/null 2>&1; then
        log_info "📊 Running database migrations..."
        npx prisma migrate deploy || {
            log_warn "⚠️  Database migration failed, but continuing startup..."
        }
    else
        log_warn "⚠️  Cannot check migration status, skipping migrations"
    fi
else
    log_warn "⚠️  npx not available, skipping database migrations"
fi

# Set up signal handlers for graceful shutdown
cleanup() {
    log_info "🛑 Received shutdown signal, cleaning up..."
    if [ -n "$APP_PID" ]; then
        log_info "🔄 Stopping application (PID: $APP_PID)..."
        kill -TERM "$APP_PID" 2>/dev/null || true
        wait "$APP_PID" 2>/dev/null || true
    fi
    log_success "✅ Cleanup completed"
    exit 0
}

trap cleanup SIGTERM SIGINT

# Start the application
log_info "🎯 Starting Next.js application..."
log_info "🌐 Application will be available on port 3000"

# Start the app in background to handle signals properly
pnpm start &
APP_PID=$!

log_success "🚀 Application started successfully (PID: $APP_PID)"
log_info "📡 Health checks available at:"
log_info "   - /api/health (general health)"
log_info "   - /api/health/ready (readiness probe)"
log_info "   - /api/health/live (liveness probe)"
log_info "   - /api/health/startup (startup probe)"

# Wait for the application to finish
wait "$APP_PID"
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    log_success "✅ Application exited normally"
else
    log_error "❌ Application exited with code $EXIT_CODE"
fi

exit $EXIT_CODE