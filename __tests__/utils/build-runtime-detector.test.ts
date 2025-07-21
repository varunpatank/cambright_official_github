/**
 * Tests for build-time detection utilities
 */

import {
  isBuildTime,
  isRuntimeEnvironment,
  isBrowserEnvironment,
  getCurrentPhase,
  executeAtRuntime,
  logWithPhase,
} from '@/lib/build-runtime-detector';

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  // Reset console mocks
  console.log = mockConsole.log;
  console.warn = mockConsole.warn;
  console.error = mockConsole.error;
});

describe('Build-time Detection Utilities', () => {
  describe('isBuildTime', () => {
    it('should return true when NEXT_PHASE is phase-production-build', () => {
      const originalEnv = process.env.NEXT_PHASE;
      process.env.NEXT_PHASE = 'phase-production-build';
      
      expect(isBuildTime()).toBe(true);
      
      process.env.NEXT_PHASE = originalEnv;
    });

    it('should return true when NODE_ENV is production without RUNTIME_ENVIRONMENT', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalRuntimeEnv = process.env.RUNTIME_ENVIRONMENT;
      
      process.env.NODE_ENV = 'production';
      delete process.env.RUNTIME_ENVIRONMENT;
      
      expect(isBuildTime()).toBe(true);
      
      process.env.NODE_ENV = originalNodeEnv;
      process.env.RUNTIME_ENVIRONMENT = originalRuntimeEnv;
    });

    it('should return false when RUNTIME_ENVIRONMENT is set', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalRuntimeEnv = process.env.RUNTIME_ENVIRONMENT;
      
      process.env.NODE_ENV = 'production';
      process.env.RUNTIME_ENVIRONMENT = 'true';
      
      expect(isBuildTime()).toBe(false);
      
      process.env.NODE_ENV = originalNodeEnv;
      process.env.RUNTIME_ENVIRONMENT = originalRuntimeEnv;
    });
  });

  describe('isRuntimeEnvironment', () => {
    it('should return true when not build time and not in browser', () => {
      const originalWindow = (global as any).window;
      delete (global as any).window;
      
      // Mock isBuildTime to return false
      jest.doMock('@/lib/build-runtime-detector', () => ({
        ...jest.requireActual('@/lib/build-runtime-detector'),
        isBuildTime: () => false,
      }));
      
      expect(isRuntimeEnvironment()).toBe(true);
      
      (global as any).window = originalWindow;
    });
  });

  describe('getCurrentPhase', () => {
    it('should return "build" during build time', () => {
      const originalEnv = process.env.NEXT_PHASE;
      process.env.NEXT_PHASE = 'phase-production-build';
      
      expect(getCurrentPhase()).toBe('build');
      
      process.env.NEXT_PHASE = originalEnv;
    });

    it('should return "runtime-browser" in browser environment', () => {
      const originalWindow = (global as any).window;
      (global as any).window = {};
      
      expect(getCurrentPhase()).toBe('runtime-browser');
      
      (global as any).window = originalWindow;
    });
  });

  describe('executeAtRuntime', () => {
    it('should execute function during runtime', () => {
      const mockFn = jest.fn(() => 'runtime-result');
      const originalEnv = process.env.NEXT_PHASE;
      delete process.env.NEXT_PHASE;
      
      const result = executeAtRuntime(mockFn, 'fallback');
      
      expect(mockFn).toHaveBeenCalled();
      expect(result).toBe('runtime-result');
      
      process.env.NEXT_PHASE = originalEnv;
    });

    it('should return fallback during build time', () => {
      const mockFn = jest.fn(() => 'runtime-result');
      const originalEnv = process.env.NEXT_PHASE;
      process.env.NEXT_PHASE = 'phase-production-build';
      
      const result = executeAtRuntime(mockFn, 'fallback');
      
      expect(mockFn).not.toHaveBeenCalled();
      expect(result).toBe('fallback');
      
      process.env.NEXT_PHASE = originalEnv;
    });
  });

  describe('logWithPhase', () => {
    it('should log with phase prefix', () => {
      logWithPhase('test message');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('test message')
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/^\[.*\] test message$/)
      );
    });

    it('should use appropriate console method for different levels', () => {
      logWithPhase('warning message', 'warn');
      logWithPhase('error message', 'error');
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('warning message')
      );
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('error message')
      );
    });
  });
});