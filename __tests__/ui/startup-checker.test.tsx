import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { StartupChecker } from '@/components/startup-checker'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

// Mock console methods to avoid noise in tests
const originalConsole = { ...console }
beforeEach(() => {
  console.log = jest.fn()
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterEach(() => {
  Object.assign(console, originalConsole)
  jest.clearAllMocks()
  mockSessionStorage.getItem.mockClear()
  mockSessionStorage.setItem.mockClear()
})

describe('StartupChecker', () => {
  const TestChild = () => <div data-testid="test-child">Test Content</div>

  beforeEach(() => {
    jest.useFakeTimers()
    mockSessionStorage.getItem.mockReturnValue(null) // No cached health checks
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should show loading state initially', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <StartupChecker>
        <TestChild />
      </StartupChecker>
    )

    expect(screen.getByText('Initializing Application')).toBeInTheDocument()
    expect(screen.getByText('Checking system health and connectivity...')).toBeInTheDocument()
    expect(screen.getByText('Connecting to server...')).toBeInTheDocument()
  })

  it('should render children when health checks pass', async () => {
    const mockHealthReport = {
      overall: 'healthy',
      checks: [],
      totalTime: 1000,
      criticalFailures: 0,
      warnings: 0,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockHealthReport),
    })

    render(
      <StartupChecker>
        <TestChild />
      </StartupChecker>
    )

    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('apcop_health_checks_completed', 'true')
  })

  it('should implement retry logic with exponential backoff for network errors', async () => {
    // First two calls fail with network error, third succeeds
    mockFetch
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          overall: 'healthy',
          checks: [],
          totalTime: 1000,
          criticalFailures: 0,
          warnings: 0,
        }),
      })

    render(
      <StartupChecker>
        <TestChild />
      </StartupChecker>
    )

    // Should show initial loading
    expect(screen.getByText('Initializing Application')).toBeInTheDocument()

    // Wait for first failure and retry
    await act(async () => {
      await jest.runOnlyPendingTimersAsync()
    })

    // Fast-forward through retry delays
    await act(async () => {
      jest.advanceTimersByTime(5000) // Allow time for retries
      await jest.runOnlyPendingTimersAsync()
    })

    // Should eventually succeed and show children
    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('should handle server errors (503) with retry logic', async () => {
    // First call returns 503 (server initializing), second succeeds
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ status: 'initializing' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          overall: 'healthy',
          checks: [],
          totalTime: 1000,
          criticalFailures: 0,
          warnings: 0,
        }),
      })

    render(
      <StartupChecker>
        <TestChild />
      </StartupChecker>
    )

    // Wait for initial request and retry
    await act(async () => {
      await jest.runOnlyPendingTimersAsync()
    })

    // Fast-forward through retry delay
    await act(async () => {
      jest.advanceTimersByTime(3000)
      await jest.runOnlyPendingTimersAsync()
    })

    // Should eventually succeed
    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should show appropriate error messages for different error types', async () => {
    // Network error
    mockFetch.mockRejectedValue(new Error('Failed to fetch'))

    render(
      <StartupChecker>
        <TestChild />
      </StartupChecker>
    )

    // Fast-forward through all retries
    await act(async () => {
      jest.advanceTimersByTime(60000) // Exceed timeout
    })

    await waitFor(() => {
      expect(screen.getByText('Network Connection Failed')).toBeInTheDocument()
      expect(screen.getByText('Unable to reach the server')).toBeInTheDocument()
    })
  })

  it('should show timeout error when startup takes too long', async () => {
    // Mock AbortController to simulate timeout
    const mockAbortController = {
      abort: jest.fn(),
      signal: { aborted: false }
    }
    global.AbortController = jest.fn(() => mockAbortController) as any

    // Mock a request that gets aborted due to timeout
    mockFetch.mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error('The operation was aborted')
          error.name = 'AbortError'
          reject(error)
        }, 15000) // Simulate request timeout
      })
    })

    render(
      <StartupChecker>
        <TestChild />
      </StartupChecker>
    )

    // Fast-forward through the request timeout and retries
    await act(async () => {
      jest.advanceTimersByTime(70000) // Exceed total timeout
    })

    await waitFor(() => {
      expect(screen.getByText('Server Startup Timeout')).toBeInTheDocument()
    })
  })

  it('should skip health checks if already completed in session', async () => {
    mockSessionStorage.getItem.mockReturnValue('true') // Health checks already completed

    render(
      <StartupChecker>
        <TestChild />
      </StartupChecker>
    )

    // Should immediately show children without calling fetch
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should show degraded state warning when there are warnings', async () => {
    const mockHealthReport = {
      overall: 'degraded',
      checks: [
        {
          service: 'Database',
          status: 'healthy',
          message: 'Connected successfully',
          timestamp: new Date().toISOString(),
        },
        {
          service: 'Redis',
          status: 'warning',
          message: 'Connection slow',
          timestamp: new Date().toISOString(),
        },
      ],
      totalTime: 2000,
      criticalFailures: 0,
      warnings: 1,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockHealthReport),
    })

    render(
      <StartupChecker showDetailedErrors>
        <TestChild />
      </StartupChecker>
    )

    await waitFor(() => {
      expect(screen.getByText(/Some services are unavailable/)).toBeInTheDocument()
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })
  })

  it('should show critical failure state for unhealthy status', async () => {
    const mockHealthReport = {
      overall: 'unhealthy',
      checks: [
        {
          service: 'Database',
          status: 'unhealthy',
          message: 'Connection failed',
          timestamp: new Date().toISOString(),
        },
      ],
      totalTime: 1000,
      criticalFailures: 1,
      warnings: 0,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockHealthReport),
    })

    render(
      <StartupChecker>
        <TestChild />
      </StartupChecker>
    )

    await waitFor(() => {
      expect(screen.getByText('Critical System Failures Detected')).toBeInTheDocument()
      expect(screen.getByText('Database')).toBeInTheDocument()
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })

    // Should not render children in critical failure state
    expect(screen.queryByTestId('test-child')).not.toBeInTheDocument()
  })
})