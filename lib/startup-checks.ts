// Startup checks utility for verifying database and service connectivity
// Ensures all critical services are available before application starts

import { db } from './db'
import { clerkClient } from '@clerk/nextjs/server'
// File storage no longer needed - schools are now in database
import { TutorService } from './tutor-service'

export interface StartupCheckResult {
	service: string
	status: 'healthy' | 'unhealthy' | 'warning'
	message: string
	timestamp: string
	responseTime?: number
}

export interface StartupCheckSummary {
	overall: 'healthy' | 'unhealthy' | 'degraded'
	checks: StartupCheckResult[]
	totalTime: number
	criticalFailures: number
	warnings: number
}

const TIMEOUT_MS = 10000 // 10 seconds timeout for each check

// Helper function to run a check with timeout
async function runWithTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number
): Promise<T> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error('Operation timed out'))
		}, timeoutMs)

		promise
			.then((result) => {
				clearTimeout(timer)
				resolve(result)
			})
			.catch((error) => {
				clearTimeout(timer)
				reject(error)
			})
	})
}

// Database connectivity check
async function checkDatabase(): Promise<StartupCheckResult> {
	const start = Date.now()
	try {
		await runWithTimeout(db.$queryRaw`SELECT 1`, TIMEOUT_MS)
		const responseTime = Date.now() - start
		
		return {
			service: 'Database (PostgreSQL)',
			status: 'healthy',
			message: 'Database connection successful',
			timestamp: new Date().toISOString(),
			responseTime
		}
	} catch (error) {
		const responseTime = Date.now() - start
		return {
			service: 'Database (PostgreSQL)',
			status: 'unhealthy',
			message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
			timestamp: new Date().toISOString(),
			responseTime
		}
	}
}

// Clerk authentication service check
async function checkClerkAuth(): Promise<StartupCheckResult> {
	const start = Date.now()
	try {
		// Verify Clerk configuration
		const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
		const secretKey = process.env.CLERK_SECRET_KEY
		
		if (!publishableKey || !secretKey) {
			return {
				service: 'Clerk Authentication',
				status: 'unhealthy',
				message: 'Missing Clerk environment variables',
				timestamp: new Date().toISOString(),
				responseTime: Date.now() - start
			}
		}

		// Test Clerk API connection by fetching user count (lightweight operation)
		await runWithTimeout(clerkClient.users.getCount(), TIMEOUT_MS)
		const responseTime = Date.now() - start

		return {
			service: 'Clerk Authentication',
			status: 'healthy',
			message: 'Clerk authentication service available',
			timestamp: new Date().toISOString(),
			responseTime
		}
	} catch (error) {
		const responseTime = Date.now() - start
		return {
			service: 'Clerk Authentication',
			status: 'unhealthy',
			message: `Clerk authentication check failed: ${error instanceof Error ? error.message : String(error)}`,
			timestamp: new Date().toISOString(),
			responseTime
		}
	}
}

// MinIO file storage check
async function checkMinIO(): Promise<StartupCheckResult> {
	const start = Date.now()
	try {
		const minioUrl = process.env.MINIO_URL
		const keyId = process.env.MINIO_KEY_ID
		const accessKey = process.env.MINIO_ACCESS_KEY
		
		if (!minioUrl || !keyId || !accessKey) {
			return {
				service: 'MinIO Storage',
				status: 'warning',
				message: 'MinIO not configured (file uploads will fail)',
				timestamp: new Date().toISOString(),
				responseTime: Date.now() - start
			}
		}

		// Test MinIO connection
		const { minioClient, BUCKET_NAME } = await import('@/lib/minio')
		
		// Check if bucket exists (this tests connectivity)
		const bucketExists = await minioClient.bucketExists(BUCKET_NAME)
		
		if (!bucketExists) {
			// Try to create bucket if it doesn't exist
			await minioClient.makeBucket(BUCKET_NAME)
		}

		return {
			service: 'MinIO Storage',
			status: 'healthy',
			message: 'MinIO connection and bucket access successful',
			timestamp: new Date().toISOString(),
			responseTime: Date.now() - start
		}
	} catch (error) {
		const responseTime = Date.now() - start
		return {
			service: 'MinIO Storage',
			status: 'warning',
			message: `MinIO check failed: ${error instanceof Error ? error.message : String(error)}`,
			timestamp: new Date().toISOString(),
			responseTime
		}
	}
}

// Redis connectivity check (optional service)
async function checkRedis(): Promise<StartupCheckResult> {
	const start = Date.now()
	try {
		const redisUrl = process.env.REDIS_URL
		
		if (!redisUrl) {
			return {
				service: 'Redis Cache',
				status: 'warning',
				message: 'Redis not configured (using memory cache fallback)',
				timestamp: new Date().toISOString(),
				responseTime: Date.now() - start
			}
		}

		// Try to import and test Redis connection
		const Redis = (await import('ioredis')).default
		const redis = new Redis(redisUrl, {
			connectTimeout: 5000,
			lazyConnect: true
		})

		await runWithTimeout(redis.ping(), TIMEOUT_MS)
		await redis.disconnect()
		
		const responseTime = Date.now() - start
		return {
			service: 'Redis Cache',
			status: 'healthy',
			message: 'Redis connection successful',
			timestamp: new Date().toISOString(),
			responseTime
		}
	} catch (error) {
		const responseTime = Date.now() - start
		return {
			service: 'Redis Cache',
			status: 'warning',
			message: `Redis unavailable (using memory fallback): ${error instanceof Error ? error.message : String(error)}`,
			timestamp: new Date().toISOString(),
			responseTime
		}
	}
}

// Database storage check for schools (file storage no longer used)
async function checkSchoolsInDatabase(): Promise<StartupCheckResult> {
	const start = Date.now()
	try {
		// Test that we can query schools from database
		await runWithTimeout(db.school.count(), TIMEOUT_MS)
		const responseTime = Date.now() - start
		
		return {
			service: 'Schools Database',
			status: 'healthy',
			message: 'Schools database query successful',
			timestamp: new Date().toISOString(),
			responseTime
		}
	} catch (error) {
		const responseTime = Date.now() - start
		return {
			service: 'Schools Database',
			status: 'unhealthy',
			message: `Schools database check failed: ${error instanceof Error ? error.message : String(error)}`,
			timestamp: new Date().toISOString(),
			responseTime
		}
	}
}

// Tutor service initialization check
async function checkTutorService(): Promise<StartupCheckResult> {
	const start = Date.now()
	try {
		// Test tutor service by checking cache initialization
		await runWithTimeout(TutorService.isTutor('test-user-id'), TIMEOUT_MS)
		const responseTime = Date.now() - start
		
		return {
			service: 'Tutor Service',
			status: 'healthy',
			message: 'Tutor service initialized successfully',
			timestamp: new Date().toISOString(),
			responseTime
		}
	} catch (error) {
		const responseTime = Date.now() - start
		return {
			service: 'Tutor Service',
			status: 'warning',
			message: `Tutor service check failed: ${error instanceof Error ? error.message : String(error)}`,
			timestamp: new Date().toISOString(),
			responseTime
		}
	}
}

// External data files check (for quizzer functionality)
async function checkExternalData(): Promise<StartupCheckResult> {
	const start = Date.now()
	try {
		// Check if critical data files are accessible
		const dataFiles = [
			'/data/chemistry-questions.csv',
			'/data/chemistry-mcq-options.csv',
			'/data/chemistry-markscheme.csv'
		]
		
		for (const file of dataFiles) {
			const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${file}`, {
				method: 'HEAD',
				signal: AbortSignal.timeout(5000)
			})
			
			if (!response.ok) {
				throw new Error(`Data file ${file} not accessible`)
			}
		}
		
		const responseTime = Date.now() - start
		return {
			service: 'External Data Files',
			status: 'healthy',
			message: 'All critical data files accessible',
			timestamp: new Date().toISOString(),
			responseTime
		}
	} catch (error) {
		const responseTime = Date.now() - start
		return {
			service: 'External Data Files',
			status: 'warning',
			message: `Some data files may be inaccessible: ${error instanceof Error ? error.message : String(error)}`,
			timestamp: new Date().toISOString(),
			responseTime
		}
	}
}

// Environment variables validation
function checkEnvironmentVariables(): StartupCheckResult {
	const start = Date.now()
	const required = ['DATABASE_URL', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY']
	const missing = required.filter(key => !process.env[key])
	
	const responseTime = Date.now() - start
	
	if (missing.length === 0) {
		return {
			service: 'Environment Variables',
			status: 'healthy',
			message: 'All required environment variables present',
			timestamp: new Date().toISOString(),
			responseTime
		}
	} else {
		return {
			service: 'Environment Variables',
			status: 'unhealthy',
			message: `Missing required environment variables: ${missing.join(', ')}`,
			timestamp: new Date().toISOString(),
			responseTime
		}
	}
}

// Run all startup checks
export async function runStartupChecks(): Promise<StartupCheckSummary> {
	const startTime = Date.now()
	
	console.log('🚀 Starting application health checks...')
	
	const checks = await Promise.allSettled([
		checkEnvironmentVariables(),
		checkDatabase(),
		checkClerkAuth(),
		checkMinIO(),
		checkRedis(),
		checkSchoolsInDatabase(),
		checkTutorService(),
		checkExternalData()
	])
	
	const results = checks.map((check, index) => {
		if (check.status === 'fulfilled') {
			return check.value
		} else {
			return {
				service: `Check ${index + 1}`,
				status: 'unhealthy' as const,
				message: `Check failed: ${check.reason}`,
				timestamp: new Date().toISOString()
			}
		}
	})
	
	const totalTime = Date.now() - startTime
	const criticalFailures = results.filter(r => 
		r.status === 'unhealthy' && 
		['Database (PostgreSQL)', 'Clerk Authentication', 'Environment Variables'].includes(r.service)
	).length
	const warnings = results.filter(r => r.status === 'warning').length
	const unhealthy = results.filter(r => r.status === 'unhealthy').length
	
	let overall: 'healthy' | 'unhealthy' | 'degraded'
	if (criticalFailures > 0) {
		overall = 'unhealthy'
	} else if (unhealthy > 0 || warnings > 0) {
		overall = 'degraded'
	} else {
		overall = 'healthy'
	}
	
	// Log results
	console.log(`\n📊 Startup Check Results (${totalTime}ms total):`)
	results.forEach(result => {
		const icon = result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
		const timeStr = result.responseTime ? ` (${result.responseTime}ms)` : ''
		console.log(`${icon} ${result.service}${timeStr}: ${result.message}`)
	})
	
	if (overall === 'unhealthy') {
		console.log('\n🔴 CRITICAL: Application has critical service failures!')
	} else if (overall === 'degraded') {
		console.log('\n🟡 WARNING: Application running with some services unavailable')
	} else {
		console.log('\n🟢 SUCCESS: All services healthy')
	}
	
	return {
		overall,
		checks: results,
		totalTime,
		criticalFailures,
		warnings
	}
}

// Quick health check for monitoring
export async function quickHealthCheck(): Promise<{ status: string; timestamp: string }> {
	try {
		await runWithTimeout(db.$queryRaw`SELECT 1`, 3000)
		return {
			status: 'healthy',
			timestamp: new Date().toISOString()
		}
	} catch (error) {
		return {
			status: 'unhealthy',
			timestamp: new Date().toISOString()
		}
	}
} 