// Tests for structured logging system
import { logger, logStartup, logHealthCheck, logDeploymentIssue } from '@/lib/structured-logger'
import { errorRecoveryManager, withRecovery } from '@/lib/error-recovery-manager'

// Mock console methods to capture output
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug
}

describe('Structured Logger', () => {
  beforeEach(() => {
    // Replace console methods with mocks
    console.log = mockConsole.log
    console.warn = mockConsole.warn
    console.error = mockConsole.error
    console.debug = mockConsole.debug
    
    // Clear all mocks
    jest.clearAllMocks()
    
    // Clear logger buffer
    logger.clearBuffer()
  })

  afterAll(() => {
    // Restore original console methods
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.debug = originalConsole.debug
  })

  describe('Basic Logging', () => {
    test('should log info messages with structured format', () => {
      logger.info('Test message', {
        phase: 'runtime',
        category: 'startup',
        service: 'test-service'
      })

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[STARTUP] [test-service] Test message')
      )
    })

    test('should log error messages with error details', () => {
      const testError = new Error('Test error')
      
      logger.error('Error occurred', {
        phase: 'runtime',
        category: 'deployment',
        errorCategory: 'configuration',
        recoveryStrategy: 'retry',
        criticalityLevel: 'high'
      }, testError)

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred [Category: configuration] [Recovery: retry] [Criticality: high]')
      )
    })

    test('should store logs in buffer', () => {
      logger.info('Test message', {
        phase: 'runtime',
        category: 'startup'
      })

      const recentLogs = logger.getRecentLogs(1)
      expect(recentLogs).toHaveLength(1)
      expect(recentLogs[0].message).toBe('Test message')
      expect(recentLogs[0].level).toBe('info')
    })
  })

  describe('Convenience Functions', () => {
    test('logStartup should log with startup category', () => {
      logStartup('Server starting', 'info', { port: 3000 })

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[STARTUP]')
      )
    })

    test('logHealthCheck should log with health-check category', () => {
      logHealthCheck('database', 'Connection successful', 'info', 150)

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[HEALTH-CHECK] [database]')
      )
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('(150ms)')
      )
    })

    test('logDeploymentIssue should log with deployment category and error details', () => {
      logDeploymentIssue(
        'Configuration error',
        'configuration',
        'fail-fast',
        'critical',
        new Error('Missing env var'),
        ['startup'],
        ['Check environment variables']
      )

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[DEPLOYMENT]')
      )
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[Category: configuration]')
      )
    })
  })

  describe('Log Filtering', () => {
    test('should filter logs by category', () => {
      logger.info('Startup message', { phase: 'runtime', category: 'startup' })
      logger.info('Health message', { phase: 'runtime', category: 'health-check' })
      logger.info('Another startup message', { phase: 'runtime', category: 'startup' })

      const startupLogs = logger.getLogsByCategory('startup')
      expect(startupLogs).toHaveLength(2)
      expect(startupLogs.every(log => log.context.category === 'startup')).toBe(true)
    })

    test('should filter error logs', () => {
      logger.info('Info message', { phase: 'runtime', category: 'startup' })
      logger.error('Error message', {
        phase: 'runtime',
        category: 'deployment',
        errorCategory: 'configuration',
        recoveryStrategy: 'retry',
        criticalityLevel: 'high'
      })
      logger.warn('Warning message', { phase: 'runtime', category: 'startup' })

      const errorLogs = logger.getErrorLogs()
      expect(errorLogs).toHaveLength(1)
      expect(errorLogs[0].level).toBe('error')
    })
  })
})

describe('Error Recovery Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Error Classification', () => {
    test('should classify database connection errors', () => {
      const error = new Error('ECONNREFUSED')
      const classification = errorRecoveryManager.classifyError(error)

      expect(classification.category).toBe('database')
      expect(classification.recoveryStrategy).toBe('retry')
      expect(classification.criticalityLevel).toBe('critical')
      expect(classification.canRecover).toBe(true)
    })

    test('should classify network errors', () => {
      const error = new Error('ENOTFOUND service.example.com')
      const classification = errorRecoveryManager.classifyError(error)

      expect(classification.category).toBe('network')
      expect(classification.recoveryStrategy).toBe('retry')
    })

    test('should classify configuration errors', () => {
      const error = new Error('Missing environment variable DATABASE_URL')
      const classification = errorRecoveryManager.classifyError(error)

      expect(classification.category).toBe('configuration')
      expect(classification.recoveryStrategy).toBe('fail-fast')
      expect(classification.canRecover).toBe(false)
    })
  })

  describe('Recovery Execution', () => {
    test('should retry failed operations', async () => {
      let attempts = 0
      const operation = jest.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('ECONNREFUSED')
        }
        return 'success'
      })

      const result = await withRecovery(operation, 'test-operation')

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    test('should fail after max retries', async () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('ECONNREFUSED')
      })

      await expect(withRecovery(operation, 'test-operation')).rejects.toThrow()
      expect(operation).toHaveBeenCalledTimes(6) // Initial + 5 retries (database category)
    })

    test('should not retry fail-fast errors', async () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('Missing environment variable')
      })

      await expect(withRecovery(operation, 'test-operation')).rejects.toThrow()
      expect(operation).toHaveBeenCalledTimes(1) // No retries for fail-fast
    })
  })
})

describe('Integration Tests', () => {
  test('should log recovery attempts with structured logging', async () => {
    let attempts = 0
    const operation = jest.fn().mockImplementation(() => {
      attempts++
      if (attempts < 2) {
        throw new Error('ECONNREFUSED')
      }
      return 'success'
    })

    await withRecovery(operation, 'integration-test')

    // Should have logged debug messages during execution
    expect(mockConsole.debug).toHaveBeenCalledWith(
      expect.stringContaining('Executing integration-test')
    )
  })

  test('should handle complex error scenarios', async () => {
    const operation = jest.fn().mockImplementation(() => {
      throw new Error('Database connection failed: ECONNREFUSED')
    })

    try {
      await withRecovery(operation, 'complex-test')
    } catch (error) {
      // Expected to fail after retries
    }

    // Should have logged multiple execution attempts
    expect(mockConsole.debug).toHaveBeenCalledWith(
      expect.stringContaining('Executing complex-test')
    )
    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining('complex-test failed after')
    )
  })
})