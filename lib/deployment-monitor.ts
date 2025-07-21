// Monitoring and alerting system for deployment issues
// Tracks deployment health and triggers alerts for critical issues

import { logger, LogLevel, ErrorCategory } from './structured-logger'
import { errorRecoveryManager, ErrorClassification } from './error-recovery-manager'
import { getRuntimeState } from './runtime-state-manager'

export interface DeploymentMetrics {
  startupTime: number
  healthCheckDuration: number
  errorCount: number
  warningCount: number
  criticalErrorCount: number
  recoveryAttempts: number
  successfulRecoveries: number
  failedRecoveries: number
  degradedServices: string[]
  unavailableServices: string[]
  lastHealthCheck: Date
  uptime: number
}

export interface AlertRule {
  id: string
  name: string
  condition: (metrics: DeploymentMetrics) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  cooldownMs: number
  lastTriggered?: Date
  enabled: boolean
  description: string
  actionRequired: string[]
}

export interface Alert {
  id: string
  ruleId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: Date
  metrics: DeploymentMetrics
  acknowledged: boolean
  resolved: boolean
  troubleshootingSteps: string[]
}

class DeploymentMonitor {
  private static instance: DeploymentMonitor
  private metrics: DeploymentMetrics
  private alerts: Alert[] = []
  private alertRules: Map<string, AlertRule> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null
  private startTime: Date = new Date()

  private constructor() {
    this.metrics = this.initializeMetrics()
    this.initializeAlertRules()
    this.startMonitoring()
  }

  static getInstance(): DeploymentMonitor {
    if (!DeploymentMonitor.instance) {
      DeploymentMonitor.instance = new DeploymentMonitor()
    }
    return DeploymentMonitor.instance
  }

  private initializeMetrics(): DeploymentMetrics {
    return {
      startupTime: 0,
      healthCheckDuration: 0,
      errorCount: 0,
      warningCount: 0,
      criticalErrorCount: 0,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      degradedServices: [],
      unavailableServices: [],
      lastHealthCheck: new Date(),
      uptime: 0
    }
  }

  private initializeAlertRules(): void {
    // Critical startup failure
    this.alertRules.set('startup-failure', {
      id: 'startup-failure',
      name: 'Application Startup Failure',
      condition: (metrics) => metrics.criticalErrorCount > 0 && metrics.startupTime === 0,
      severity: 'critical',
      cooldownMs: 300000, // 5 minutes
      enabled: true,
      description: 'Application failed to start successfully',
      actionRequired: [
        'Check application logs immediately',
        'Verify environment variables',
        'Check service dependencies',
        'Consider rollback if necessary'
      ]
    })

    // Slow startup
    this.alertRules.set('slow-startup', {
      id: 'slow-startup',
      name: 'Slow Application Startup',
      condition: (metrics) => metrics.startupTime > 60000, // 60 seconds
      severity: 'medium',
      cooldownMs: 600000, // 10 minutes
      enabled: true,
      description: 'Application startup is taking longer than expected',
      actionRequired: [
        'Check system resources',
        'Review startup process performance',
        'Monitor database connection times',
        'Check external service response times'
      ]
    })

    // High error rate
    this.alertRules.set('high-error-rate', {
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: (metrics) => metrics.errorCount > 10,
      severity: 'high',
      cooldownMs: 300000, // 5 minutes
      enabled: true,
      description: 'Application is experiencing a high number of errors',
      actionRequired: [
        'Review error logs for patterns',
        'Check service health',
        'Monitor system resources',
        'Consider scaling or rollback'
      ]
    })

    // Service degradation
    this.alertRules.set('service-degradation', {
      id: 'service-degradation',
      name: 'Service Degradation',
      condition: (metrics) => metrics.degradedServices.length > 0,
      severity: 'medium',
      cooldownMs: 600000, // 10 minutes
      enabled: true,
      description: 'One or more services are running in degraded mode',
      actionRequired: [
        'Check degraded service status',
        'Review service configuration',
        'Monitor impact on user experience',
        'Plan service restoration'
      ]
    })

    // Critical service unavailable
    this.alertRules.set('critical-service-down', {
      id: 'critical-service-down',
      name: 'Critical Service Unavailable',
      condition: (metrics) => metrics.unavailableServices.length > 0,
      severity: 'critical',
      cooldownMs: 180000, // 3 minutes
      enabled: true,
      description: 'Critical services are unavailable',
      actionRequired: [
        'Immediate investigation required',
        'Check service status and logs',
        'Verify network connectivity',
        'Consider emergency rollback'
      ]
    })

    // Recovery failure
    this.alertRules.set('recovery-failure', {
      id: 'recovery-failure',
      name: 'Recovery Attempts Failing',
      condition: (metrics) => metrics.failedRecoveries > 5,
      severity: 'high',
      cooldownMs: 300000, // 5 minutes
      enabled: true,
      description: 'Multiple recovery attempts are failing',
      actionRequired: [
        'Review recovery strategies',
        'Check underlying service issues',
        'Consider manual intervention',
        'Escalate to senior team members'
      ]
    })

    // Health check timeout
    this.alertRules.set('health-check-timeout', {
      id: 'health-check-timeout',
      name: 'Health Check Timeout',
      condition: (metrics) => Date.now() - metrics.lastHealthCheck.getTime() > 300000, // 5 minutes
      severity: 'medium',
      cooldownMs: 600000, // 10 minutes
      enabled: true,
      description: 'Health checks have not run recently',
      actionRequired: [
        'Check health check process',
        'Verify monitoring system status',
        'Review system resources',
        'Check for blocking operations'
      ]
    })
  }

  private startMonitoring(): void {
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics()
      this.checkAlertRules()
    }, 30000)

    logger.info('Deployment monitoring started', {
      phase: 'runtime',
      category: 'deployment',
      metadata: { monitoringInterval: 30000 }
    })
  }

  private updateMetrics(): void {
    const runtimeState = getRuntimeState()
    const now = new Date()

    this.metrics.uptime = now.getTime() - this.startTime.getTime()
    
    if (runtimeState.healthCheckResults) {
      this.metrics.healthCheckDuration = runtimeState.healthCheckResults.totalDuration
      this.metrics.errorCount = runtimeState.healthCheckResults.failedCount
      this.metrics.warningCount = runtimeState.healthCheckResults.warningCount
    }

    this.metrics.criticalErrorCount = runtimeState.errors.length
    this.metrics.degradedServices = this.extractDegradedServices(runtimeState.warnings)
    this.metrics.unavailableServices = this.extractUnavailableServices(runtimeState.errors)

    // Update startup time if available
    if (runtimeState.phase === 'runtime' && this.metrics.startupTime === 0) {
      this.metrics.startupTime = this.metrics.uptime
    }
  }

  private extractDegradedServices(warnings: string[]): string[] {
    const services: string[] = []
    warnings.forEach(warning => {
      if (warning.includes('Redis')) services.push('redis')
      if (warning.includes('MinIO')) services.push('minio')
      if (warning.includes('Cache')) services.push('cache')
    })
    return [...new Set(services)] // Remove duplicates
  }

  private extractUnavailableServices(errors: string[]): string[] {
    const services: string[] = []
    errors.forEach(error => {
      if (error.includes('database') || error.includes('DATABASE_URL')) services.push('database')
      if (error.includes('Clerk') || error.includes('CLERK_SECRET_KEY')) services.push('auth')
      if (error.includes('critical') && error.includes('MinIO')) services.push('file-storage')
    })
    return [...new Set(services)] // Remove duplicates
  }

  private checkAlertRules(): void {
    const now = new Date()

    this.alertRules.forEach(rule => {
      if (!rule.enabled) return

      // Check cooldown period
      if (rule.lastTriggered && (now.getTime() - rule.lastTriggered.getTime()) < rule.cooldownMs) {
        return
      }

      // Check condition
      if (rule.condition(this.metrics)) {
        this.triggerAlert(rule)
        rule.lastTriggered = now
      }
    })
  }

  private triggerAlert(rule: AlertRule): void {
    const alert: Alert = {
      id: `${rule.id}-${Date.now()}`,
      ruleId: rule.id,
      severity: rule.severity,
      title: rule.name,
      message: rule.description,
      timestamp: new Date(),
      metrics: { ...this.metrics },
      acknowledged: false,
      resolved: false,
      troubleshootingSteps: rule.actionRequired
    }

    this.alerts.push(alert)

    // Log the alert
    logger.error(`🚨 DEPLOYMENT ALERT: ${alert.title}`, {
      phase: 'runtime',
      category: 'deployment',
      errorCategory: 'configuration',
      recoveryStrategy: 'manual-intervention',
      criticalityLevel: rule.severity === 'critical' ? 'critical' : 
                       rule.severity === 'high' ? 'high' : 'medium',
      troubleshootingSteps: alert.troubleshootingSteps,
      metadata: {
        alertId: alert.id,
        metrics: this.metrics
      }
    })

    // Send to external monitoring systems if configured
    this.sendToExternalMonitoring(alert)
  }

  private sendToExternalMonitoring(alert: Alert): void {
    // Placeholder for external monitoring integration
    // Could integrate with services like:
    // - DataDog
    // - New Relic
    // - Sentry
    // - PagerDuty
    // - Slack/Discord webhooks
    // - Email notifications

    if (process.env.MONITORING_WEBHOOK_URL) {
      this.sendWebhookAlert(alert)
    }

    if (process.env.SLACK_WEBHOOK_URL && alert.severity === 'critical') {
      this.sendSlackAlert(alert)
    }
  }

  private async sendWebhookAlert(alert: Alert): Promise<void> {
    try {
      const response = await fetch(process.env.MONITORING_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert,
          application: 'CamBright',
          environment: process.env.NODE_ENV,
          timestamp: alert.timestamp.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }

      logger.info('Alert sent to monitoring webhook', {
        phase: 'runtime',
        category: 'deployment',
        metadata: { alertId: alert.id }
      })
    } catch (error) {
      logger.error('Failed to send webhook alert', {
        phase: 'runtime',
        category: 'deployment',
        errorCategory: 'external-service',
        recoveryStrategy: 'ignore',
        criticalityLevel: 'low'
      }, error instanceof Error ? error : new Error(String(error)))
    }
  }

  private async sendSlackAlert(alert: Alert): Promise<void> {
    try {
      const slackMessage = {
        text: `🚨 Critical Deployment Alert: ${alert.title}`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Application', value: 'CamBright', short: true },
            { title: 'Environment', value: process.env.NODE_ENV || 'unknown', short: true },
            { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
            { title: 'Timestamp', value: alert.timestamp.toISOString(), short: true },
            { title: 'Message', value: alert.message, short: false },
            { title: 'Action Required', value: alert.troubleshootingSteps.join('\n• '), short: false }
          ]
        }]
      }

      const response = await fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      })

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status}`)
      }

      logger.info('Critical alert sent to Slack', {
        phase: 'runtime',
        category: 'deployment',
        metadata: { alertId: alert.id }
      })
    } catch (error) {
      logger.error('Failed to send Slack alert', {
        phase: 'runtime',
        category: 'deployment',
        errorCategory: 'external-service',
        recoveryStrategy: 'ignore',
        criticalityLevel: 'low'
      }, error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Public methods for external use
  recordRecoveryAttempt(): void {
    this.metrics.recoveryAttempts++
  }

  recordSuccessfulRecovery(): void {
    this.metrics.successfulRecoveries++
  }

  recordFailedRecovery(): void {
    this.metrics.failedRecoveries++
  }

  updateHealthCheckTime(): void {
    this.metrics.lastHealthCheck = new Date()
  }

  getMetrics(): DeploymentMetrics {
    return { ...this.metrics }
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts]
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      logger.info(`Alert acknowledged: ${alert.title}`, {
        phase: 'runtime',
        category: 'deployment',
        metadata: { alertId }
      })
      return true
    }
    return false
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      alert.acknowledged = true
      logger.info(`Alert resolved: ${alert.title}`, {
        phase: 'runtime',
        category: 'deployment',
        metadata: { alertId }
      })
      return true
    }
    return false
  }

  enableAlertRule(ruleId: string): boolean {
    const rule = this.alertRules.get(ruleId)
    if (rule) {
      rule.enabled = true
      return true
    }
    return false
  }

  disableAlertRule(ruleId: string): boolean {
    const rule = this.alertRules.get(ruleId)
    if (rule) {
      rule.enabled = false
      return true
    }
    return false
  }

  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values())
  }

  // Cleanup method
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    logger.info('Deployment monitoring stopped', {
      phase: 'runtime',
      category: 'deployment'
    })
  }
}

// Export singleton instance
export const deploymentMonitor = DeploymentMonitor.getInstance()

// Convenience functions
export function recordRecoveryAttempt(): void {
  deploymentMonitor.recordRecoveryAttempt()
}

export function recordSuccessfulRecovery(): void {
  deploymentMonitor.recordSuccessfulRecovery()
}

export function recordFailedRecovery(): void {
  deploymentMonitor.recordFailedRecovery()
}

export function getDeploymentMetrics(): DeploymentMetrics {
  return deploymentMonitor.getMetrics()
}

export function getActiveAlerts(): Alert[] {
  return deploymentMonitor.getActiveAlerts()
}