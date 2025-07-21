// Query performance monitoring and optimization utilities

interface QueryMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics
  private readonly slowQueryThreshold = 1000; // 1 second

  async trackQuery<T>(
    operation: string,
    query: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    const timestamp = new Date();
    
    try {
      const result = await query();
      const duration = Date.now() - start;
      
      this.addMetric({
        operation,
        duration,
        timestamp,
        success: true,
      });

      if (duration > this.slowQueryThreshold) {
        console.warn(`🐌 Slow query detected: ${operation} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      this.addMetric({
        operation,
        duration,
        timestamp,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      console.error(`❌ Query failed: ${operation} failed after ${duration}ms`, error);
      throw error;
    }
  }

  private addMetric(metric: QueryMetrics) {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  getSlowQueries(threshold = this.slowQueryThreshold) {
    return this.metrics.filter(m => m.duration > threshold);
  }

  getFailedQueries() {
    return this.metrics.filter(m => !m.success);
  }

  getAverageQueryTime(operation?: string) {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation && m.success)
      : this.metrics.filter(m => m.success);
    
    if (relevantMetrics.length === 0) return 0;
    
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / relevantMetrics.length;
  }

  getQueryStats() {
    const total = this.metrics.length;
    const successful = this.metrics.filter(m => m.success).length;
    const failed = total - successful;
    const slowQueries = this.getSlowQueries().length;
    
    return {
      total,
      successful,
      failed,
      slowQueries,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageQueryTime: this.getAverageQueryTime(),
    };
  }

  clearMetrics() {
    this.metrics = [];
  }
}

// Global instance
export const queryMonitor = new QueryPerformanceMonitor();

// Wrapper function for easy use
export const withQueryMonitoring = <T>(
  operation: string,
  query: () => Promise<T>
): Promise<T> => {
  return queryMonitor.trackQuery(operation, query);
};

// Database connection health check
export const checkDatabaseHealth = async () => {
  const { db } = await import('./db');
  
  try {
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    return {
      healthy: true,
      responseTime: duration,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
    };
  }
};

// Connection pool monitoring
export const getConnectionPoolStats = async () => {
  const { db } = await import('./db');
  
  try {
    // Test connection with a simple query
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    return {
      available: true,
      connectionTest: {
        success: true,
        responseTime,
        timestamp: new Date(),
      },
    };
  } catch (error) {
    return {
      available: false,
      connectionTest: {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      },
    };
  }
};