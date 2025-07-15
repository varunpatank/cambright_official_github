#!/usr/bin/env tsx
// Server-side startup health check script
// Can be run during deployment or server startup for monitoring

import { runStartupChecks } from '../lib/startup-checks'

const LOG_COLORS = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m'
}

function colorize(text: string, color: keyof typeof LOG_COLORS): string {
	return `${LOG_COLORS[color]}${text}${LOG_COLORS.reset}`
}

function logWithTimestamp(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
	const timestamp = new Date().toISOString()
	const prefix = level === 'error' ? colorize('[ERROR]', 'red') :
				   level === 'warn' ? colorize('[WARN]', 'yellow') :
				   colorize('[INFO]', 'blue')
	
	console.log(`${colorize(timestamp, 'cyan')} ${prefix} ${message}`)
}

function logHealthReport(report: any): void {
	const overallColor = report.overall === 'healthy' ? 'green' : 
						 report.overall === 'degraded' ? 'yellow' : 'red'
	
	logWithTimestamp(`🏥 Health Check Summary: ${colorize(report.overall.toUpperCase(), overallColor)}`)
	logWithTimestamp(`⏱️  Total Time: ${report.totalTime}ms`)
	logWithTimestamp(`❌ Critical Failures: ${report.criticalFailures}`)
	logWithTimestamp(`⚠️  Warnings: ${report.warnings}`)
	logWithTimestamp(`✅ Total Checks: ${report.checks.length}`)
	
	console.log('\n' + colorize('📋 Detailed Results:', 'bright'))
	console.log(colorize('='.repeat(80), 'cyan'))
	
	report.checks.forEach((check: any, index: number) => {
		const statusIcon = check.status === 'healthy' ? '✅' : 
						   check.status === 'warning' ? '⚠️' : '❌'
		const statusColor = check.status === 'healthy' ? 'green' : 
							check.status === 'warning' ? 'yellow' : 'red'
		const timeStr = check.responseTime ? ` (${check.responseTime}ms)` : ''
		
		console.log(`${statusIcon} ${colorize(check.service, 'bright')}${colorize(timeStr, 'cyan')}`)
		console.log(`   ${colorize(check.status.toUpperCase(), statusColor)}: ${check.message}`)
		
		if (index < report.checks.length - 1) {
			console.log()
		}
	})
	
	console.log(colorize('='.repeat(80), 'cyan'))
}

async function main(): Promise<void> {
	const startTime = Date.now()
	
	try {
		logWithTimestamp('🚀 Starting CamBright Health Check...')
		logWithTimestamp(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
		logWithTimestamp(`📍 Working Directory: ${process.cwd()}`)
		
		// Run health checks
		const report = await runStartupChecks()
		
		// Log detailed report
		logHealthReport(report)
		
		// Determine exit code
		let exitCode = 0
		let exitMessage = ''
		
		if (report.overall === 'unhealthy') {
			exitCode = 1
			exitMessage = colorize('🔴 CRITICAL: Health check failed! Application has critical service failures.', 'red')
		} else if (report.overall === 'degraded') {
			exitCode = process.env.NODE_ENV === 'production' ? 1 : 0
			const severity = process.env.NODE_ENV === 'production' ? 'CRITICAL' : 'WARNING'
			exitMessage = colorize(`🟡 ${severity}: Some services are unavailable. Application functionality may be limited.`, 'yellow')
		} else {
			exitMessage = colorize('🟢 SUCCESS: All services are healthy!', 'green')
		}
		
		const totalTime = Date.now() - startTime
		logWithTimestamp(`⏱️  Health check completed in ${totalTime}ms`)
		logWithTimestamp(exitMessage)
		
		// Log to structured format for monitoring systems
		if (process.env.STRUCTURED_LOGGING === 'true') {
			console.log('\n' + JSON.stringify({
				timestamp: new Date().toISOString(),
				event: 'health_check_complete',
				environment: process.env.NODE_ENV,
				overall_status: report.overall,
				total_time_ms: totalTime,
				critical_failures: report.criticalFailures,
				warnings: report.warnings,
				checks: report.checks.map((check: any) => ({
					service: check.service,
					status: check.status,
					response_time_ms: check.responseTime,
					message: check.message
				}))
			}, null, 2))
		}
		
		// Write to file if specified
		if (process.env.HEALTH_CHECK_LOG_FILE) {
			const fs = await import('fs/promises')
			const logData = {
				timestamp: new Date().toISOString(),
				environment: process.env.NODE_ENV,
				report,
				totalTime
			}
			
			try {
				await fs.writeFile(
					process.env.HEALTH_CHECK_LOG_FILE,
					JSON.stringify(logData, null, 2)
				)
				logWithTimestamp(`📝 Health check results written to ${process.env.HEALTH_CHECK_LOG_FILE}`)
			} catch (error) {
				logWithTimestamp(`❌ Failed to write health check log: ${error}`, 'error')
			}
		}
		
		process.exit(exitCode)
		
	} catch (error) {
		const totalTime = Date.now() - startTime
		logWithTimestamp(`❌ Health check script failed after ${totalTime}ms: ${error}`, 'error')
		
		if (error instanceof Error) {
			console.error(colorize(error.stack || error.message, 'red'))
		}
		
		process.exit(1)
	}
}

// Handle process signals gracefully
process.on('SIGINT', () => {
	logWithTimestamp('⏹️  Health check interrupted by SIGINT', 'warn')
	process.exit(130)
})

process.on('SIGTERM', () => {
	logWithTimestamp('⏹️  Health check terminated by SIGTERM', 'warn')
	process.exit(143)
})

// Run the script
if (require.main === module) {
	main().catch((error) => {
		console.error(colorize('💥 Unhandled error in health check script:', 'red'), error)
		process.exit(1)
	})
} 