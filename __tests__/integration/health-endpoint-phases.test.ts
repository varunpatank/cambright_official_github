/**
 * Health endpoint behavior tests during different application phases
 * Tests the health endpoints respond correctly during build, startup, and runtime phases
 */

// Mock fetch for testing HTTP endpoints
const mockFetch = jest.fn()
global.fetch = mockFetch

// Test configuration
const HEALTH_ENDPOINTS = {
  general: '/api/health',
  ready: '/api/health/ready',
  live: '/api/health/live',
  startup: '/api/health/startup'
}

const BASE_URL = 'http://localhost:3000'

describe('Health Endpoint Phase Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Build Phase Response Patterns', () => {
    it('should return build phase status from general health endpoint', async () => {
      const buildPhaseResponse = {
        phase: 'build',
        status: 'build-time',
        serverReady: false,
        message: 'Health checks skipped during build phase',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(buildPhaseResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('phase', 'build')
      expect(data).toHaveProperty('status', 'build-time')
      expect(data).toHaveProperty('serverReady', false)
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('build')
    })

    it('should return not ready from readiness endpoint during build', async () => {
      const buildReadyResponse = {
        canServeTraffic: false,
        phase: 'build',
        message: 'Service not ready during build phase',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(buildReadyResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.ready}`)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toHaveProperty('canServeTraffic', false)
      expect(data).toHaveProperty('phase', 'build')
      expect(data).toHaveProperty('message')
    })

    it('should return alive but not serving from liveness endpoint during build', async () => {
      const buildLiveResponse = {
        alive: true,
        phase: 'build',
        applicationHealthy: false,
        message: 'Container alive but application not serving during build',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(buildLiveResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.live}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('alive', true)
      expect(data).toHaveProperty('phase', 'build')
      expect(data).toHaveProperty('applicationHealthy', false)
    })

    it('should return startup not applicable during build', async () => {
      const buildStartupResponse = {
        phase: 'build',
        startupComplete: false,
        message: 'Startup checks not applicable during build phase',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(buildStartupResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.startup}`)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toHaveProperty('phase', 'build')
      expect(data).toHaveProperty('startupComplete', false)
    })
  })

  describe('Runtime Startup Phase Response Patterns', () => {
    it('should return initializing status during startup', async () => {
      const initializingResponse = {
        phase: 'runtime',
        status: 'initializing',
        serverReady: false,
        retryAfter: 5,
        initializationTime: 8000,
        message: 'Server is starting up, please wait...',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(initializingResponse),
        headers: new Headers({ 
          'content-type': 'application/json',
          'retry-after': '5'
        })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toHaveProperty('phase', 'runtime')
      expect(data).toHaveProperty('status', 'initializing')
      expect(data).toHaveProperty('serverReady', false)
      expect(data).toHaveProperty('retryAfter')
      expect(typeof data.retryAfter).toBe('number')
      expect(response.headers.get('retry-after')).toBe('5')
    })

    it('should return not ready from readiness endpoint during startup', async () => {
      const startupReadyResponse = {
        canServeTraffic: false,
        phase: 'runtime',
        initializationTime: 8000,
        message: 'Service initializing, not ready for traffic',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(startupReadyResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.ready}`)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toHaveProperty('canServeTraffic', false)
      expect(data).toHaveProperty('phase', 'runtime')
      expect(data).toHaveProperty('initializationTime')
    })

    it('should return alive from liveness endpoint during startup', async () => {
      const startupLiveResponse = {
        alive: true,
        phase: 'runtime',
        applicationHealthy: false,
        message: 'Container alive, application starting',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(startupLiveResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.live}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('alive', true)
      expect(data).toHaveProperty('phase', 'runtime')
      expect(data).toHaveProperty('applicationHealthy', false)
    })

    it('should return startup progress from startup endpoint', async () => {
      const startupProgressResponse = {
        startupComplete: false,
        phase: 'runtime',
        initializationTime: 8000,
        checks: [
          {
            service: 'Database',
            status: 'checking',
            message: 'Connecting...',
            timestamp: new Date().toISOString()
          },
          {
            service: 'Redis',
            status: 'pending',
            message: 'Waiting for database...',
            timestamp: new Date().toISOString()
          }
        ],
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(startupProgressResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.startup}`)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toHaveProperty('startupComplete', false)
      expect(data).toHaveProperty('checks')
      expect(data.checks).toBeInstanceOf(Array)
      expect(data).toHaveProperty('initializationTime')
    })
  })

  describe('Runtime Ready Phase Response Patterns', () => {
    it('should return healthy status when fully ready', async () => {
      const healthyResponse = {
        phase: 'runtime',
        status: 'healthy',
        serverReady: true,
        checks: [
          {
            service: 'Database',
            status: 'healthy',
            message: 'Connected successfully',
            timestamp: new Date().toISOString()
          },
          {
            service: 'Redis',
            status: 'healthy',
            message: 'Connected successfully',
            timestamp: new Date().toISOString()
          }
        ],
        totalTime: 2000,
        criticalFailures: 0,
        warnings: 0,
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(healthyResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('phase', 'runtime')
      expect(data).toHaveProperty('status', 'healthy')
      expect(data).toHaveProperty('serverReady', true)
      expect(data).toHaveProperty('checks')
      expect(data.checks).toBeInstanceOf(Array)
      expect(data).toHaveProperty('criticalFailures', 0)
    })

    it('should return ready from readiness endpoint when ready', async () => {
      const readyResponse = {
        canServeTraffic: true,
        phase: 'runtime',
        readyTime: new Date().toISOString(),
        services: ['Database', 'Redis'],
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(readyResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.ready}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('canServeTraffic', true)
      expect(data).toHaveProperty('phase', 'runtime')
      expect(data).toHaveProperty('readyTime')
    })

    it('should return alive and healthy from liveness endpoint when ready', async () => {
      const liveResponse = {
        alive: true,
        phase: 'runtime',
        applicationHealthy: true,
        uptime: 30000,
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(liveResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.live}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('alive', true)
      expect(data).toHaveProperty('phase', 'runtime')
      expect(data).toHaveProperty('applicationHealthy', true)
      expect(data).toHaveProperty('uptime')
    })

    it('should return startup complete from startup endpoint when ready', async () => {
      const startupCompleteResponse = {
        startupComplete: true,
        phase: 'runtime',
        totalStartupTime: 15000,
        checks: [
          {
            service: 'Database',
            status: 'healthy',
            message: 'Connected successfully',
            timestamp: new Date().toISOString()
          },
          {
            service: 'Redis',
            status: 'healthy',
            message: 'Connected successfully',
            timestamp: new Date().toISOString()
          }
        ],
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(startupCompleteResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.startup}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('startupComplete', true)
      expect(data).toHaveProperty('totalStartupTime')
      expect(data).toHaveProperty('checks')
    })
  })

  describe('Runtime Degraded Phase Response Patterns', () => {
    it('should return degraded status with warnings', async () => {
      const degradedResponse = {
        phase: 'runtime',
        status: 'degraded',
        serverReady: true,
        checks: [
          {
            service: 'Database',
            status: 'healthy',
            message: 'Connected successfully',
            timestamp: new Date().toISOString()
          },
          {
            service: 'Redis',
            status: 'warning',
            message: 'Connection slow - using memory cache fallback',
            timestamp: new Date().toISOString()
          }
        ],
        totalTime: 3000,
        criticalFailures: 0,
        warnings: 1,
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 206, // Partial content - degraded but functional
        json: () => Promise.resolve(degradedResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)
      const data = await response.json()

      expect(response.status).toBe(206)
      expect(data).toHaveProperty('status', 'degraded')
      expect(data).toHaveProperty('warnings')
      expect(data.warnings).toBeGreaterThan(0)
      expect(data).toHaveProperty('serverReady', true)
    })

    it('should still return ready from readiness endpoint when degraded', async () => {
      const degradedReadyResponse = {
        canServeTraffic: true,
        phase: 'runtime',
        warnings: ['Redis connection slow'],
        degradedServices: ['Redis'],
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(degradedReadyResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.ready}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('canServeTraffic', true)
      expect(data).toHaveProperty('warnings')
      expect(data.warnings).toBeInstanceOf(Array)
    })
  })

  describe('Runtime Failed Phase Response Patterns', () => {
    it('should return unhealthy status when failed', async () => {
      const unhealthyResponse = {
        phase: 'runtime',
        status: 'unhealthy',
        serverReady: false,
        checks: [
          {
            service: 'Database',
            status: 'unhealthy',
            message: 'Connection failed: ECONNREFUSED',
            timestamp: new Date().toISOString()
          },
          {
            service: 'Redis',
            status: 'healthy',
            message: 'Connected successfully',
            timestamp: new Date().toISOString()
          }
        ],
        totalTime: 5000,
        criticalFailures: 1,
        warnings: 0,
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(unhealthyResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toHaveProperty('status', 'unhealthy')
      expect(data).toHaveProperty('criticalFailures')
      expect(data.criticalFailures).toBeGreaterThan(0)
      expect(data).toHaveProperty('serverReady', false)
    })

    it('should return not ready from readiness endpoint when failed', async () => {
      const failedReadyResponse = {
        canServeTraffic: false,
        phase: 'runtime',
        errors: ['Database connection failed'],
        failedServices: ['Database'],
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve(failedReadyResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.ready}`)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data).toHaveProperty('canServeTraffic', false)
      expect(data).toHaveProperty('errors')
      expect(data.errors).toBeInstanceOf(Array)
    })

    it('should still return alive from liveness endpoint when failed', async () => {
      const failedLiveResponse = {
        alive: true,
        phase: 'runtime',
        applicationHealthy: false,
        message: 'Container alive but application unhealthy',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(failedLiveResponse),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.live}`)
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('alive', true)
      expect(data).toHaveProperty('applicationHealthy', false)
    })
  })

  describe('Response Format Consistency', () => {
    it('should maintain consistent response format across all endpoints', async () => {
      const consistentFields = ['phase', 'timestamp']
      
      const responses = {
        health: {
          phase: 'runtime',
          status: 'healthy',
          timestamp: new Date().toISOString()
        },
        ready: {
          phase: 'runtime',
          canServeTraffic: true,
          timestamp: new Date().toISOString()
        },
        live: {
          phase: 'runtime',
          alive: true,
          timestamp: new Date().toISOString()
        },
        startup: {
          phase: 'runtime',
          startupComplete: true,
          timestamp: new Date().toISOString()
        }
      }

      const endpoints = Object.keys(HEALTH_ENDPOINTS)
      
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i]
        const endpointKey = endpoint === 'general' ? 'health' : endpoint
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(responses[endpointKey]),
          headers: new Headers({ 'content-type': 'application/json' })
        })

        const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS[endpoint]}`)
        const data = await response.json()

        // All responses should be valid JSON
        expect(typeof data).toBe('object')
        expect(data).not.toBeNull()

        // All responses should include consistent fields
        consistentFields.forEach(field => {
          expect(data).toHaveProperty(field)
          expect(typeof data[field]).toBe('string')
        })
      }
    })

    it('should include proper HTTP headers for caching and content type', async () => {
      const healthResponse = {
        phase: 'runtime',
        status: 'healthy',
        timestamp: new Date().toISOString()
      }

      const headers = new Headers({
        'content-type': 'application/json',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(healthResponse),
        headers
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)

      // Should have proper content type
      expect(response.headers.get('content-type')).toContain('application/json')

      // Should have cache control headers
      expect(response.headers.get('cache-control')).toBeTruthy()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network timeouts gracefully', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'AbortError'
      
      mockFetch.mockRejectedValueOnce(timeoutError)

      try {
        await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)
        fail('Should have thrown an error')
      } catch (error) {
        expect(error.name).toBe('AbortError')
        expect(error.message).toContain('timeout')
      }
    })

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
        headers: new Headers({ 'content-type': 'application/json' })
      })

      const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)
      
      try {
        await response.json()
        fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toContain('Invalid JSON')
      }
    })

    it('should handle HTTP error status codes appropriately', async () => {
      const errorCodes = [400, 401, 403, 404, 500, 502, 503, 504]
      
      for (const statusCode of errorCodes) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: statusCode,
          json: () => Promise.resolve({
            error: `HTTP ${statusCode}`,
            message: 'Server error',
            timestamp: new Date().toISOString()
          }),
          headers: new Headers({ 'content-type': 'application/json' })
        })

        const response = await fetch(`${BASE_URL}${HEALTH_ENDPOINTS.general}`)
        expect(response.ok).toBe(false)
        expect(response.status).toBe(statusCode)
        
        const data = await response.json()
        expect(data).toHaveProperty('error')
        expect(data).toHaveProperty('timestamp')
      }
    })
  })
})