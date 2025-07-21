/**
 * Tests for build-time detection utilities
 */

import { 
  isBuildTime, 
  isRuntimeEnvironment, 
  isBrowserEnvironment, 
  getCurrentPhase 
} from '@/lib/build-runtime-detector';

import { 
  validateEnvironment, 
  getSafeEnvVar, 
  validateDatabaseUrl, 
  getBuildTimeDefaults 
} from '@/lib/environment-validator';

import { 
  initializeRuntimeState, 
  getRuntimeState, 
  updateServerPhase, 
  recordHealthCheckResults, 
  addRuntimeError, 
  addRuntimeWarning, 
  getInitializationDuration, 
  isReadyForTraffic, 
  canServeRequests, 
  getRuntimeStateSummary, 
  resetRuntimeState 
} from '@/lib/runtime-state-manager';

// Mock window for browser environment tests
const mockWindow = {} as any;

describe('Build-Runtime Detection', () => {
  const originalEnv = process.env;
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    delete (global as any).window;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.window = originalWindow;
  });

  describe('isBuildTime', () => {
    it('should detect Next.js build phase', () => {
      process.env.NEXT_PHASE = 'phase-production-build';
      expect(isBuildTime()).toBe(true);
    });

    it('should detect production without runtime marker', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.RUNTIME_ENVIRONMENT;
      expect(isBuildTime()).toBe(true);
    });

    it('should detect CI build environment', () => {
      process.env.CI = 'true';
      delete process.env.RUNTIME_ENVIRONMENT;
      expect(isBuildTime()).toBe(true);
    });

    it('should detect Docker build context', () => {
      process.env.DOCKER_BUILDKIT = '1';
      delete process.env.RUNTIME_ENVIRONMENT;
      expect(isBuildTime()).toBe(true);
    });

    it('should return false for runtime environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.RUNTIME_ENVIRONMENT = 'true';
      expect(isBuildTime()).toBe(false);
    });
  });

  describe('isRuntimeEnvironment', () => {
    it('should return true for server runtime', () => {
      process.env.NODE_ENV = 'production';
      process.env.RUNTIME_ENVIRONMENT = 'true';
      expect(isRuntimeEnvironment()).toBe(true);
    });

    it('should return false during build', () => {
      process.env.NEXT_PHASE = 'phase-production-build';
      expect(isRuntimeEnvironment()).toBe(false);
    });

    it('should return false in browser', () => {
      global.window = mockWindow;
      expect(isRuntimeEnvironment()).toBe(false);
    });
  });

  describe('isBrowserEnvironment', () => {
    it('should return true when window exists', () => {
      global.window = mockWindow;
      expect(isBrowserEnvironment()).toBe(true);
    });

    it('should return false on server', () => {
      expect(isBrowserEnvironment()).toBe(false);
    });
  });

  describe('getCurrentPhase', () => {
    it('should return "browser" in browser environment', () => {
      global.window = mockWindow;
      expect(getCurrentPhase()).toBe('browser');
    });

    it('should return "build" during build time', () => {
      process.env.NEXT_PHASE = 'phase-production-build';
      expect(getCurrentPhase()).toBe('build');
    });

    it('should return "runtime" for server runtime', () => {
      process.env.NODE_ENV = 'production';
      process.env.RUNTIME_ENVIRONMENT = 'true';
      expect(getCurrentPhase()).toBe('runtime');
    });
  });
});

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should validate build-time environment', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_123';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      
      const result = validateEnvironment('build');
      expect(result.isValid).toBe(true);
      expect(result.phase).toBe('build');
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn about missing runtime vars
    });

    it('should validate runtime environment', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.CLERK_SECRET_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_123';
      
      const result = validateEnvironment('runtime');
      expect(result.isValid).toBe(true);
      expect(result.phase).toBe('runtime');
    });

    it('should detect missing required variables', () => {
      const result = validateEnvironment('runtime');
      expect(result.isValid).toBe(false);
      expect(result.missingRequired).toContain('DATABASE_URL');
      expect(result.missingRequired).toContain('CLERK_SECRET_KEY');
    });
  });

  describe('getSafeEnvVar', () => {
    it('should return actual value when available', () => {
      process.env.TEST_VAR = 'actual_value';
      expect(getSafeEnvVar('TEST_VAR', 'fallback')).toBe('actual_value');
    });

    it('should return fallback during build', () => {
      process.env.NEXT_PHASE = 'phase-production-build';
      expect(getSafeEnvVar('MISSING_VAR', 'fallback')).toBe('fallback');
    });

    it('should return fallback for missing variable', () => {
      expect(getSafeEnvVar('MISSING_VAR', 'fallback')).toBe('fallback');
    });
  });

  describe('validateDatabaseUrl', () => {
    it('should validate PostgreSQL URL', () => {
      const result = validateDatabaseUrl('postgresql://user:pass@localhost:5432/db');
      expect(result.isValid).toBe(true);
      expect(result.protocol).toBe('postgresql:');
    });

    it('should reject invalid URL', () => {
      const result = validateDatabaseUrl('invalid-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid database URL format');
    });

    it('should reject unsupported protocol', () => {
      const result = validateDatabaseUrl('http://localhost:5432/db');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported database protocol');
    });
  });

  describe('getBuildTimeDefaults', () => {
    it('should return safe default values', () => {
      const defaults = getBuildTimeDefaults();
      expect(defaults.DATABASE_URL).toContain('postgresql://');
      expect(defaults.CLERK_SECRET_KEY).toContain('sk_build_');
      expect(defaults.REDIS_URL).toContain('redis://');
    });
  });
});

describe('Runtime State Management', () => {
  beforeEach(() => {
    resetRuntimeState();
  });

  afterEach(() => {
    resetRuntimeState();
  });

  describe('initializeRuntimeState', () => {
    it('should initialize runtime state', () => {
      const state = initializeRuntimeState();
      expect(state.phase).toBe('starting');
      expect(state.readyForTraffic).toBe(false);
      expect(state.initializationStartTime).toBeGreaterThan(0);
    });
  });

  describe('updateServerPhase', () => {
    it('should update server phase', () => {
      initializeRuntimeState();
      updateServerPhase('initializing');
      
      const state = getRuntimeState();
      expect(state?.phase).toBe('initializing');
    });

    it('should update traffic readiness', () => {
      initializeRuntimeState();
      updateServerPhase('ready');
      
      expect(isReadyForTraffic()).toBe(true);
      expect(canServeRequests()).toBe(true);
    });
  });

  describe('recordHealthCheckResults', () => {
    it('should record successful health checks', () => {
      initializeRuntimeState();
      
      const results = {
        overall: 'success' as const,
        checks: [
          { name: 'database', status: 'success' as const, message: 'Connected' }
        ],
        totalDuration: 100,
        timestamp: Date.now()
      };
      
      recordHealthCheckResults(results);
      
      const state = getRuntimeState();
      expect(state?.phase).toBe('ready');
      expect(state?.healthCheckResults).toEqual(results);
    });

    it('should handle failed health checks', () => {
      initializeRuntimeState();
      
      const results = {
        overall: 'error' as const,
        checks: [
          { name: 'database', status: 'error' as const, message: 'Connection failed' }
        ],
        totalDuration: 100,
        timestamp: Date.now()
      };
      
      recordHealthCheckResults(results);
      
      const state = getRuntimeState();
      expect(state?.phase).toBe('failed');
    });
  });

  describe('error and warning handling', () => {
    it('should add runtime errors', () => {
      initializeRuntimeState();
      addRuntimeError('Test error');
      
      const state = getRuntimeState();
      expect(state?.errors).toContain('Test error');
      expect(state?.phase).toBe('failed');
    });

    it('should add runtime warnings', () => {
      initializeRuntimeState();
      addRuntimeWarning('Test warning');
      
      const state = getRuntimeState();
      expect(state?.warnings).toContain('Test warning');
    });
  });

  describe('getRuntimeStateSummary', () => {
    it('should return summary when state exists', () => {
      initializeRuntimeState();
      updateServerPhase('ready');
      
      const summary = getRuntimeStateSummary();
      expect(summary.phase).toBe('ready');
      expect(summary.ready).toBe(true);
      expect(summary.canServe).toBe(true);
    });

    it('should return default summary when no state', () => {
      const summary = getRuntimeStateSummary();
      expect(summary.phase).toBe('starting');
      expect(summary.ready).toBe(false);
      expect(summary.canServe).toBe(false);
    });
  });
});