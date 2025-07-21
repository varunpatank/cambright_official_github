# Use Node.js 20 on Alpine
FROM node:20-alpine

# Install required system packages
RUN apk add --no-cache git curl

# Create non-root user before any file operations
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Create app directory and assign ownership
RUN mkdir /app && chown nextjs:nodejs /app
WORKDIR /app

# Switch to non-root user
USER nextjs

# Copy package files with ownership
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml ./
COPY --chown=nextjs:nodejs prisma ./prisma/

# Switch back to root to install global dependencies
USER root
RUN npm i -g pnpm

# Switch back to app user for install/build
USER nextjs
RUN pnpm install --frozen-lockfile

# Copy application source with ownership
COPY --chown=nextjs:nodejs . .

# Generate Prisma client and apply patches
RUN pnpm run postinstall

# Build the application
RUN pnpm run build

# Switch to root to install scripts with correct permissions
USER root
COPY --chown=nextjs:nodejs scripts/container-startup.sh /usr/local/bin/container-startup.sh
COPY --chown=nextjs:nodejs scripts/docker-health-check.sh /usr/local/bin/docker-health-check.sh
RUN chmod +x /usr/local/bin/container-startup.sh /usr/local/bin/docker-health-check.sh

# Switch back to app user
USER nextjs

# Expose the port Next.js uses
EXPOSE 3000

# Docker health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /usr/local/bin/docker-health-check.sh

# Use startup script
CMD ["/usr/local/bin/container-startup.sh"]
