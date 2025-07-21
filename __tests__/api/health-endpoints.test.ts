/**
 * Tests for enhanced health check utilities and service validation
 */

import { validateServiceEnvironment } from '@/lib/environment-validator'

describe('Enhanced Health Check Utilities', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.DATABASE_URL
    delete process.env.REDIS_URL
    delete process.env.MINIO_URL
    delete process.env.MINIO_ACCESS_KEY
    delete process.env.MINIO_SECRET_KEY
    delete process.env.CLERK_SECRET_KEY
  })

  describe('Service Validation and Graceful Degradation', () => {
    it('should validate database service as critical', () => {
      // Missing database URL
      const result = validateServiceEnvironment('database')
      
      expect(result.isAvailable).toBe(false)
      expect(result.canDegrade).toBe(false)
      expect(result.missingVars).toContain('DATABASE_URL')
    })

    it('should validate database service as available when configured', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const result = validateServiceEnvironment('database')
      
      expect(result.isAvailable).toBe(true)
      expect(result.canDegrade).toBe(false)
      expect(result.missingVars).toHaveLength(0)
    })

    it('should validate Redis as optional with graceful degradation', () => {
      // Missing Redis URL
      const result = validateServiceEnvironment('redis')
      
      expect(result.isAvailable).toBe(false)
      expect(result.canDegrade).toBe(true)
      expect(result.missingVars).toContain('REDIS_URL')
      expect(result.warnings).toContain('Redis not configured - falling back to memory cache')
    })

    it('should validate Redis as available when configured', () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      
      const result = validateServiceEnvironment('redis')
      
      expect(result.isAvailable).toBe(true)
      expect(result.canDegrade).toBe(true)
      expect(result.missingVars).toHaveLength(0)
    })

    it('should validate MinIO as optional with graceful degradation', () => {
      // Missing MinIO configuration
      const result = validateServiceEnvironment('minio')
      
      expect(result.isAvailable).toBe(false)
      expect(result.canDegrade).toBe(true)
      expect(result.missingVars).toContain('MINIO_URL')
      expect(result.missingVars).toContain('MINIO_ACCESS_KEY')
      expect(result.missingVars).toContain('MINIO_SECRET_KEY')
      expect(result.warnings).toContain('MinIO not configured - file uploads may be limited')
    })

    it('should validate MinIO as available when fully configured', () => {
      process.env.MINIO_URL = 'http://localhost:9000'
      process.env.MINIO_ACCESS_KEY = 'minioadmin'
      process.env.MINIO_SECRET_KEY = 'minioadmin'
      
      const result = validateServiceEnvironment('minio')
      
      expect(result.isAvailable).toBe(true)
      expect(result.canDegrade).toBe(true)
      expect(result.missingVars).toHaveLength(0)
    })

    it('should validate Clerk as critical authentication service', () => {
      // Missing Clerk configuration
      const result = validateServiceEnvironment('clerk')
      
      expect(result.isAvailable).toBe(false)
      expect(result.canDegrade).toBe(false)
      expect(result.missingVars).toContain('CLERK_SECRET_KEY')
      // Note: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY might not be checked in server-side validation
      expect(result.missingVars.length).toBeGreaterThan(0)
    })

    it('should validate Clerk as available when configured', () => {
      process.env.CLERK_SECRET_KEY = 'sk_test_123'
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_123'
      
      const result = validateServiceEnvironment('clerk')
      
      expect(result.isAvailable).toBe(true)
      expect(result.canDegrade).toBe(false)
      expect(result.missingVars).toHaveLength(0)
    })

    it('should handle unknown service gracefully', () => {
      const result = validateServiceEnvironment('unknown-service')
      
      expect(result.warnings).toContain('Unknown service: unknown-service')
    })

    it('should validate multiple services with mixed availability', () => {
      // Set up partial configuration
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      process.env.CLERK_SECRET_KEY = 'sk_test_123'
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_123'
      // Redis and MinIO not configured
      
      const services = ['database', 'clerk', 'redis', 'minio']
      const results = services.map(service => ({
        service,
        validation: validateServiceEnvironment(service)
      }))
      
      // Database and Clerk should be available
      expect(results.find(r => r.service === 'database')?.validation.isAvailable).toBe(true)
      expect(results.find(r => r.service === 'clerk')?.validation.isAvailable).toBe(true)
      
      // Redis and MinIO should be unavailable but can degrade
      expect(results.find(r => r.service === 'redis')?.validation.isAvailable).toBe(false)
      expect(results.find(r => r.service === 'redis')?.validation.canDegrade).toBe(true)
      expect(results.find(r => r.service === 'minio')?.validation.isAvailable).toBe(false)
      expect(results.find(r => r.service === 'minio')?.validation.canDegrade).toBe(true)
    })
  })

  describe('Health Check Response Structure', () => {
    it('should provide consistent response structure for all services', () => {
      const services = ['database', 'clerk', 'redis', 'minio']
      
      services.forEach(service => {
        const result = validateServiceEnvironment(service)
        
        // All results should have consistent structure
        expect(result).toHaveProperty('isAvailable')
        expect(result).toHaveProperty('canDegrade')
        expect(result).toHaveProperty('missingVars')
        expect(result).toHaveProperty('warnings')
        expect(Array.isArray(result.missingVars)).toBe(true)
        expect(Array.isArray(result.warnings)).toBe(true)
      })
    })

    it('should provide appropriate status mapping', () => {
      // Test different service states
      const testCases = [
        {
          service: 'database',
          envVars: { DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' },
          expectedStatus: 'healthy'
        },
        {
          service: 'redis',
          envVars: {},
          expectedStatus: 'degraded'
        },
        {
          service: 'database',
          envVars: {},
          expectedStatus: 'unavailable'
        }
      ]
      
      testCases.forEach(({ service, envVars, expectedStatus }) => {
        // Clean up first to ensure clean state
        delete process.env.DATABASE_URL
        delete process.env.REDIS_URL
        
        // Set up environment
        Object.keys(envVars).forEach(key => {
          process.env[key] = envVars[key]
        })
        
        const result = validateServiceEnvironment(service)
        let actualStatus: string
        
        if (result.isAvailable) {
          actualStatus = 'healthy'
        } else if (result.canDegrade) {
          actualStatus = 'degraded'
        } else {
          actualStatus = 'unavailable'
        }
        
        expect(actualStatus).toBe(expectedStatus)
        
        // Clean up
        Object.keys(envVars).forEach(key => {
          delete process.env[key]
        })
      })
    })
  })
})