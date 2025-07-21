/**
 * Tests for environment validation utilities
 */

import {
  validateEnvironment,
  getSafeEnvVar,
  validateDatabaseUrl,
  validateRedisUrl,
  getValidationSummary,
  validateServiceEnvironment,
  getGracefulDegradationRecommendations,
} from '@/lib/environment-validator';

describe('Environment Validation Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should validate build phase successfully even with missing variables', () => {
      // Clear all environment variables except NODE_ENV
      process.env = { NODE_ENV: 'test' };
      
      const result = validateEnvironment('build');
      
      expect(result.isValid).toBe(true);
      expect(result.phase).toBe('build');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should fail runtime validation with missing required variables', () => {
      process.env = { NODE_ENV: 'test' };
      
      const result = validateEnvironment('runtime-server');
      
      expect(result.isValid).toBe(false);
      expect(result.missingRequired.length).toBeGreaterThan(0);
      expect(result.missingRequired).toContain('DATABASE_URL');
      expect(result.missingRequired).toContain('CLERK_SECRET_KEY');
    });

    it('should pass runtime validation with all required variables', () => {
      process.env = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        CLERK_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      };
      
      const result = validateEnvironment('runtime-server');
      
      expect(result.isValid).toBe(true);
      expect(result.missingRequired.length).toBe(0);
    });

    it('should identify missing optional variables', () => {
      process.env = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        CLERK_SECRET_KEY: 'sk_test_123',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      };
      
      const result = validateEnvironment('runtime-server');
      
      expect(result.isValid).toBe(true);
      expect(result.missingOptional.length).toBeGreaterThan(0);
      expect(result.missingOptional).toContain('REDIS_URL');
    });
  });

  describe('getSafeEnvVar', () => {
    it('should return environment variable value when set', () => {
      process.env.TEST_VAR = 'test-value';
      
      const result = getSafeEnvVar('TEST_VAR', 'fallback');
      
      expect(result).toBe('test-value');
    });

    it('should return fallback when variable not set', () => {
      delete process.env.TEST_VAR;
      
      const result = getSafeEnvVar('TEST_VAR', 'fallback');
      
      expect(result).toBe('fallback');
    });

    it('should throw error for missing required variable', () => {
      delete process.env.REQUIRED_VAR;
      
      expect(() => {
        getSafeEnvVar('REQUIRED_VAR', '', true);
      }).toThrow('Required environment variable REQUIRED_VAR is not set');
    });
  });

  describe('validateDatabaseUrl', () => {
    it('should validate correct PostgreSQL URLs', () => {
      const validUrls = [
        'postgresql://user:pass@localhost:5432/database',
        'postgresql://user:pass@host.com:5432/db?ssl=true',
      ];
      
      validUrls.forEach(url => {
        expect(validateDatabaseUrl(url)).toBe(true);
      });
    });

    it('should reject invalid database URLs', () => {
      const invalidUrls = [
        '',
        'invalid-url',
        'http://localhost:3000',
        'postgresql://incomplete',
      ];
      
      invalidUrls.forEach(url => {
        expect(validateDatabaseUrl(url)).toBe(false);
      });
    });
  });

  describe('validateRedisUrl', () => {
    it('should validate correct Redis URLs', () => {
      const validUrls = [
        'redis://localhost:6379',
        'redis://user:pass@host.com:6379',
        'redis://host:6379?db=1',
      ];
      
      validUrls.forEach(url => {
        expect(validateRedisUrl(url)).toBe(true);
      });
    });

    it('should reject invalid Redis URLs', () => {
      const invalidUrls = [
        '',
        'invalid-url',
        'http://localhost:6379',
        'redis://incomplete',
      ];
      
      invalidUrls.forEach(url => {
        expect(validateRedisUrl(url)).toBe(false);
      });
    });
  });

  describe('getValidationSummary', () => {
    it('should format validation summary correctly', () => {
      const result = {
        isValid: false,
        missingRequired: ['DATABASE_URL'],
        missingOptional: ['REDIS_URL'],
        warnings: ['Test warning'],
        phase: 'runtime-server' as const,
      };
      
      const summary = getValidationSummary(result);
      
      expect(summary).toContain('❌ INVALID');
      expect(summary).toContain('DATABASE_URL');
      expect(summary).toContain('REDIS_URL');
      expect(summary).toContain('Test warning');
    });

    it('should include graceful degradation recommendations', () => {
      const result = {
        isValid: true,
        missingRequired: [],
        missingOptional: ['REDIS_URL', 'MINIO_URL'],
        warnings: [],
        phase: 'runtime-server' as const,
      };
      
      const summary = getValidationSummary(result);
      
      expect(summary).toContain('Graceful degradation');
      expect(summary).toContain('in-memory caching');
      expect(summary).toContain('File uploads will be limited');
    });
  });

  describe('validateServiceEnvironment', () => {
    it('should validate Redis service correctly', () => {
      delete process.env.REDIS_URL;
      
      const result = validateServiceEnvironment('redis');
      
      expect(result.isAvailable).toBe(false);
      expect(result.canDegrade).toBe(true);
      expect(result.missingVars).toContain('REDIS_URL');
      expect(result.warnings[0]).toContain('falling back to memory cache');
    });

    it('should validate MinIO service correctly', () => {
      delete process.env.MINIO_URL;
      delete process.env.MINIO_ACCESS_KEY;
      
      const result = validateServiceEnvironment('minio');
      
      expect(result.isAvailable).toBe(false);
      expect(result.canDegrade).toBe(true);
      expect(result.missingVars).toContain('MINIO_URL');
      expect(result.missingVars).toContain('MINIO_ACCESS_KEY');
      expect(result.warnings[0]).toContain('file uploads may be limited');
    });

    it('should validate database service correctly', () => {
      delete process.env.DATABASE_URL;
      
      const result = validateServiceEnvironment('database');
      
      expect(result.isAvailable).toBe(false);
      expect(result.canDegrade).toBe(false);
      expect(result.missingVars).toContain('DATABASE_URL');
    });

    it('should validate Clerk service correctly', () => {
      delete process.env.CLERK_SECRET_KEY;
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      
      const result = validateServiceEnvironment('clerk');
      
      expect(result.isAvailable).toBe(false);
      expect(result.canDegrade).toBe(false);
      expect(result.missingVars).toContain('CLERK_SECRET_KEY');
      expect(result.missingVars).toContain('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    });

    it('should handle available services correctly', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      const result = validateServiceEnvironment('redis');
      
      expect(result.isAvailable).toBe(true);
      expect(result.missingVars.length).toBe(0);
    });

    it('should handle unknown services', () => {
      const result = validateServiceEnvironment('unknown-service');
      
      expect(result.warnings[0]).toContain('Unknown service');
    });
  });

  describe('getGracefulDegradationRecommendations', () => {
    it('should provide Redis degradation recommendation', () => {
      const recommendations = getGracefulDegradationRecommendations(['REDIS_URL']);
      
      expect(recommendations).toContain('Application will use in-memory caching instead of Redis');
    });

    it('should provide MinIO degradation recommendation', () => {
      const recommendations = getGracefulDegradationRecommendations(['MINIO_URL', 'MINIO_ACCESS_KEY']);
      
      expect(recommendations).toContain('File uploads will be limited without MinIO configuration');
    });

    it('should provide Clerk URL degradation recommendations', () => {
      const recommendations = getGracefulDegradationRecommendations([
        'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
        'NEXT_PUBLIC_CLERK_SIGN_UP_URL'
      ]);
      
      expect(recommendations).toContain('Using default Clerk sign-in URL');
      expect(recommendations).toContain('Using default Clerk sign-up URL');
    });

    it('should return empty array for no missing variables', () => {
      const recommendations = getGracefulDegradationRecommendations([]);
      
      expect(recommendations).toEqual([]);
    });

    it('should return empty array for unknown variables', () => {
      const recommendations = getGracefulDegradationRecommendations(['UNKNOWN_VAR']);
      
      expect(recommendations).toEqual([]);
    });
  });
});