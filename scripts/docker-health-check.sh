#!/bin/sh
# Docker health check script for CamBright
# This script performs health checks for Docker containers

set -e

# Configuration
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:3000/api/health/live}"
TIMEOUT="${HEALTH_CHECK_TIMEOUT:-10}"
MAX_RETRIES="${HEALTH_CHECK_RETRIES:-3}"
RETRY_DELAY="${HEALTH_CHECK_RETRY_DELAY:-2}"

# Colors for logging (if supported)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

log_info() {
    echo -e "${BLUE}[HEALTH]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_warn() {
    echo -e "${YELLOW}[HEALTH]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_error() {
    echo -e "${RED}[HEALTH]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_success() {
    echo -e "${GREEN}[HEALTH]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

# Function to perform health check
perform_health_check() {
    local attempt=$1
    
    log_info "🔍 Health check attempt $attempt/$MAX_RETRIES"
    log_info "📡 Checking endpoint: $HEALTH_ENDPOINT"
    
    # Use curl with timeout and follow redirects
    if curl -f -s -m "$TIMEOUT" "$HEALTH_ENDPOINT" >/dev/null 2>&1; then
        log_success "✅ Health check passed"
        return 0
    else
        local exit_code=$?
        case $exit_code in
            7)
                log_error "❌ Connection refused - service not ready"
                ;;
            22)
                log_error "❌ HTTP error - service returned error status"
                ;;
            28)
                log_error "❌ Timeout - service took too long to respond"
                ;;
            *)
                log_error "❌ Health check failed with exit code: $exit_code"
                ;;
        esac
        return $exit_code
    fi
}

# Main health check logic with retries
main() {
    log_info "🏥 Starting Docker health check..."
    log_info "🌍 Environment: ${NODE_ENV:-unknown}"
    log_info "⚙️  Configuration:"
    log_info "   - Endpoint: $HEALTH_ENDPOINT"
    log_info "   - Timeout: ${TIMEOUT}s"
    log_info "   - Max retries: $MAX_RETRIES"
    log_info "   - Retry delay: ${RETRY_DELAY}s"
    
    for attempt in $(seq 1 $MAX_RETRIES); do
        if perform_health_check "$attempt"; then
            log_success "🎉 Container is healthy!"
            exit 0
        fi
        
        if [ "$attempt" -lt "$MAX_RETRIES" ]; then
            log_warn "⏳ Waiting ${RETRY_DELAY}s before retry..."
            sleep "$RETRY_DELAY"
        fi
    done
    
    log_error "💀 Health check failed after $MAX_RETRIES attempts"
    log_error "🔧 Troubleshooting tips:"
    log_error "   - Check if the application is starting up"
    log_error "   - Verify environment variables are set correctly"
    log_error "   - Check application logs for startup errors"
    log_error "   - Ensure database and external services are available"
    
    exit 1
}

# Handle signals gracefully
trap 'log_warn "⏹️  Health check interrupted"; exit 130' INT
trap 'log_warn "⏹️  Health check terminated"; exit 143' TERM

# Run the health check
main "$@"