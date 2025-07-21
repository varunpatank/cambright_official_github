'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface StartupCheckResult {
	service: string
	status: 'healthy' | 'unhealthy' | 'warning'
	message: string
	timestamp: string
	responseTime?: number
}

interface StartupCheckSummary {
	overall: 'healthy' | 'unhealthy' | 'degraded'
	checks: StartupCheckResult[]
	totalTime: number
	criticalFailures: number
	warnings: number
}

interface StartupCheckerProps {
	children: React.ReactNode
	showDetailedErrors?: boolean
}

type ErrorType = 'network' | 'server' | 'timeout' | 'unknown'

interface RetryState {
	attempt: number
	maxAttempts: number
	delay: number
	startTime: number
	lastError?: Error
	errorType?: ErrorType
}

export function StartupChecker({ children, showDetailedErrors = false }: StartupCheckerProps) {
	const [checkStatus, setCheckStatus] = useState<'checking' | 'completed' | 'failed'>('checking')
	const [healthReport, setHealthReport] = useState<StartupCheckSummary | null>(null)
	const [showDetails, setShowDetails] = useState(false)
	const [progress, setProgress] = useState(0)
	const [retryState, setRetryState] = useState<RetryState>({
		attempt: 0,
		maxAttempts: 5,
		delay: 1000,
		startTime: Date.now()
	})

	// Constants for timeout and retry configuration
	const STARTUP_TIMEOUT = 60000 // 60 seconds total timeout
	const BASE_DELAY = 1000 // 1 second base delay
	const MAX_DELAY = 10000 // 10 seconds max delay
	const BACKOFF_MULTIPLIER = 1.5

	// Helper function to determine error type
	const determineErrorType = useCallback((error: Error, response?: Response): ErrorType => {
		// Network errors (no response received)
		if (!response && (
			error.message.includes('fetch') ||
			error.message.includes('network') ||
			error.message.includes('Failed to fetch') ||
			error.name === 'TypeError'
		)) {
			return 'network'
		}

		// Timeout errors
		if (error.message.includes('timeout') || error.name === 'AbortError') {
			return 'timeout'
		}

		// Server errors (response received but with error status)
		if (response && response.status >= 500) {
			return 'server'
		}

		return 'unknown'
	}, [])

	// Helper function to calculate next retry delay with exponential backoff
	const calculateNextDelay = useCallback((attempt: number, baseDelay: number): number => {
		const exponentialDelay = baseDelay * Math.pow(BACKOFF_MULTIPLIER, attempt)
		const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5) // Add jitter
		return Math.min(jitteredDelay, MAX_DELAY)
	}, [])

	// Helper function to check if we should retry based on error type and attempt count
	const shouldRetry = useCallback((errorType: ErrorType, attempt: number, startTime: number): boolean => {
		const elapsedTime = Date.now() - startTime
		
		// Don't retry if we've exceeded the total timeout
		if (elapsedTime >= STARTUP_TIMEOUT) {
			return false
		}

		// Don't retry if we've exceeded max attempts
		if (attempt >= retryState.maxAttempts) {
			return false
		}

		// Retry for network errors, timeouts, and server errors
		// Don't retry for unknown errors (might be client-side issues)
		return errorType === 'network' || errorType === 'timeout' || errorType === 'server'
	}, [retryState.maxAttempts])

	useEffect(() => {
		let mounted = true
		let timeoutId: NodeJS.Timeout
		let abortController: AbortController
		
		// Check if health checks have already been run in this session
		const healthChecksKey = 'apcop_health_checks_completed'
		
		try {
			const hasRunHealthChecks = sessionStorage.getItem(healthChecksKey)
			
			if (hasRunHealthChecks) {
				setCheckStatus('completed')
				setProgress(100)
				return
			}
		} catch (error) {
			console.log('SessionStorage not available, running health checks')
		}
		
		const runChecks = async (currentRetryState: RetryState = retryState) => {
			if (!mounted) return

			try {
				const attemptLog = currentRetryState.attempt > 0 
					? ` (attempt ${currentRetryState.attempt + 1}/${currentRetryState.maxAttempts})`
					: ''
				console.log(`🔍 Fetching server startup status${attemptLog}...`)
				
				// Update progress based on retry attempts
				const baseProgress = Math.min((currentRetryState.attempt / currentRetryState.maxAttempts) * 50, 40)
				setProgress(baseProgress)
				
				// Simulate progress for better UX
				const progressInterval = setInterval(() => {
					setProgress(prev => Math.min(prev + 5, 90))
				}, 300)

				// Create abort controller for timeout handling
				abortController = new AbortController()
				const requestTimeout = Math.min(15000, STARTUP_TIMEOUT - (Date.now() - currentRetryState.startTime))
				
				timeoutId = setTimeout(() => {
					abortController.abort()
				}, requestTimeout)

				// Call the health API with timeout
				const response = await fetch('/api/health?detailed=true', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					signal: abortController.signal
				})

				clearTimeout(timeoutId)
				clearInterval(progressInterval)

				// Handle server still initializing
				if (response.status === 503) {
					const report = await response.json().catch(() => ({ status: 'initializing' }))
					
					if (report.status === 'initializing') {
						console.log('⏳ Server is still initializing, retrying...')
						
						const nextDelay = calculateNextDelay(currentRetryState.attempt, BASE_DELAY)
						const nextRetryState: RetryState = {
							...currentRetryState,
							attempt: currentRetryState.attempt + 1,
							delay: nextDelay,
							errorType: 'server'
						}
						
						if (shouldRetry('server', nextRetryState.attempt, currentRetryState.startTime)) {
							setRetryState(nextRetryState)
							setTimeout(() => {
								if (mounted) runChecks(nextRetryState)
							}, nextDelay)
							return
						}
					}
				}

				if (!response.ok) {
					const errorMsg = `Health check failed: ${response.status} ${response.statusText}`
					console.error('❌ Health check request failed:', {
						status: response.status,
						statusText: response.statusText,
						attempt: currentRetryState.attempt + 1
					})
					throw new Error(errorMsg)
				}

				const report = await response.json()
				
				console.log('📊 Server startup report received:', {
					overall: report.overall,
					totalTime: report.totalTime,
					serverStartupTime: report.serverStartupTime,
					criticalFailures: report.criticalFailures,
					warnings: report.warnings,
					checksCount: report.checks?.length || 0,
					attempts: currentRetryState.attempt + 1
				})
				
				// Log individual service statuses
				if (report.checks) {
					console.log('🔧 Service Status Details:')
					report.checks.forEach((check: StartupCheckResult) => {
						const emoji = check.status === 'healthy' ? '✅' : 
									  check.status === 'warning' ? '⚠️' : '❌'
						console.log(`  ${emoji} ${check.service}: ${check.message}`)
					})
				}
				
				if (mounted) {
					setProgress(100)
					setHealthReport(report)
					setCheckStatus('completed')
					
					// Mark health checks as completed for this session
					try {
						sessionStorage.setItem(healthChecksKey, 'true')
					} catch (error) {
						console.log('SessionStorage not available for marking completion')
					}
					
					// Show details automatically for failures or warnings in development
					if (report.overall === 'unhealthy') {
						console.error('🚨 Critical startup failures detected!')
						setShowDetails(true)
					} else if (report.overall === 'degraded' && showDetailedErrors) {
						console.warn('⚠️ Startup warnings detected in development mode')
						setShowDetails(true)
					}
				}
			} catch (error) {
				clearTimeout(timeoutId)
				
				if (!mounted) return

				const errorType = determineErrorType(error as Error, undefined)
				const nextRetryState: RetryState = {
					...currentRetryState,
					attempt: currentRetryState.attempt + 1,
					delay: calculateNextDelay(currentRetryState.attempt, currentRetryState.delay),
					lastError: error as Error,
					errorType
				}

				console.error(`💥 Startup check failed (${errorType} error):`, {
					error: (error as Error).message,
					attempt: nextRetryState.attempt,
					maxAttempts: nextRetryState.maxAttempts,
					nextDelay: nextRetryState.delay,
					elapsedTime: Date.now() - currentRetryState.startTime
				})

				if (shouldRetry(errorType, nextRetryState.attempt, currentRetryState.startTime)) {
					console.log(`🔄 Retrying in ${Math.round(nextRetryState.delay / 1000)}s... (${errorType} error)`)
					setRetryState(nextRetryState)
					
					setTimeout(() => {
						if (mounted) runChecks(nextRetryState)
					}, nextRetryState.delay)
				} else {
					console.error('❌ Max retries exceeded or timeout reached, giving up')
					setRetryState(nextRetryState)
					setCheckStatus('failed')
					setShowDetails(true)
				}
			}
		}

		runChecks()
		
		return () => {
			mounted = false
			if (timeoutId) clearTimeout(timeoutId)
			if (abortController) abortController.abort()
		}
	}, [showDetailedErrors, determineErrorType, calculateNextDelay, shouldRetry, retryState.maxAttempts])

	// Loading state
	if (checkStatus === 'checking') {
		const elapsedTime = Math.round((Date.now() - retryState.startTime) / 1000)
		const isRetrying = retryState.attempt > 0
		
		return (
			<div className="min-h-screen bg-n-8 flex items-center justify-center">
				<Card className="w-full max-w-md bg-n-7 border-n-6">
					<CardHeader className="text-center">
						<CardTitle className="text-n-1 flex items-center justify-center gap-2">
							{isRetrying ? (
								<>
									<Clock className="w-5 h-5 animate-spin" />
									Retrying Connection
								</>
							) : (
								<>
									<Clock className="w-5 h-5 animate-spin" />
									Initializing Application
								</>
							)}
						</CardTitle>
						<CardDescription className="text-n-3">
							{isRetrying 
								? `Attempt ${retryState.attempt + 1}/${retryState.maxAttempts} - Checking system health...`
								: 'Checking system health and connectivity...'
							}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Progress value={progress} className="w-full" />
						<p className="text-sm text-n-4 mt-2 text-center">
							{progress < 30 ? 'Connecting to server...' :
							 progress < 60 ? 'Fetching startup status...' :
							 progress < 90 ? 'Verifying service health...' :
							 'Finalizing initialization...'}
						</p>
						
						{/* Show retry information during retries */}
						{isRetrying && (
							<div className="mt-3 p-2 bg-n-6 rounded-lg">
								<div className="text-xs text-n-4 space-y-1">
									<div className="flex justify-between">
										<span>Elapsed time:</span>
										<span>{elapsedTime}s / {STARTUP_TIMEOUT / 1000}s</span>
									</div>
									{retryState.errorType && (
										<div className="flex justify-between">
											<span>Last issue:</span>
											<span className="capitalize text-yellow-400">{retryState.errorType} error</span>
										</div>
									)}
								</div>
							</div>
						)}
						
						<div className="text-xs text-n-5 mt-2 text-center">
							{isRetrying 
								? 'Retrying with exponential backoff...'
								: 'Server startup checks run automatically on boot'
							}
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Failed state
	if (checkStatus === 'failed') {
		const errorType = retryState.errorType || 'unknown'
		const elapsedTime = Math.round((Date.now() - retryState.startTime) / 1000)
		const isTimeout = elapsedTime >= STARTUP_TIMEOUT / 1000
		
		// Determine error-specific messaging
		const getErrorInfo = () => {
			switch (errorType) {
				case 'network':
					return {
						icon: <WifiOff className="w-5 h-5" />,
						title: 'Network Connection Failed',
						description: 'Unable to reach the server',
						causes: [
							'Internet connection issues',
							'Server is not running or unreachable',
							'Firewall or proxy blocking requests',
							'DNS resolution problems'
						],
						troubleshooting: 'Check your internet connection and try again. If the problem persists, the server may be down.'
					}
				case 'server':
					return {
						icon: <XCircle className="w-5 h-5" />,
						title: 'Server Error',
						description: 'Server responded with an error',
						causes: [
							'Database connection issues',
							'Missing environment variables',
							'External service unavailability',
							'Server configuration problems'
						],
						troubleshooting: 'The server is running but encountered an error during initialization. Check server logs for details.'
					}
				case 'timeout':
					return {
						icon: <Clock className="w-5 h-5" />,
						title: 'Server Startup Timeout',
						description: 'Server is taking too long to initialize',
						causes: [
							'Slow database connections',
							'Heavy server load',
							'Resource constraints',
							'Long-running initialization tasks'
						],
						troubleshooting: 'The server may still be starting up. Wait a moment and try again.'
					}
				default:
					return {
						icon: <XCircle className="w-5 h-5" />,
						title: 'Server Initialization Failed',
						description: 'Unable to connect to server or retrieve startup status',
						causes: [
							'Database connection issues',
							'Missing environment variables',
							'External service unavailability',
							'Network connectivity problems'
						],
						troubleshooting: 'Check the browser console and server logs for detailed error information.'
					}
			}
		}

		const errorInfo = getErrorInfo()

		return (
			<div className="min-h-screen bg-n-8 flex items-center justify-center p-4">
				<Card className="w-full max-w-2xl bg-n-7 border-red-500">
					<CardHeader className="text-center">
						<CardTitle className="text-red-400 flex items-center justify-center gap-2">
							{errorInfo.icon}
							{errorInfo.title}
						</CardTitle>
						<CardDescription className="text-n-3">
							{errorInfo.description}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Retry Information */}
						<div className="bg-n-6 p-3 rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								<AlertTriangle className="w-4 h-4 text-yellow-400" />
								<span className="text-sm font-medium text-n-2">Retry Information</span>
							</div>
							<div className="text-xs text-n-4 space-y-1">
								<div>Attempts: {retryState.attempt}/{retryState.maxAttempts}</div>
								<div>Time elapsed: {elapsedTime}s / {STARTUP_TIMEOUT / 1000}s</div>
								{isTimeout && <div className="text-yellow-400">⏰ Startup timeout reached</div>}
								{retryState.lastError && (
									<div className="text-red-400">Last error: {retryState.lastError.message}</div>
								)}
							</div>
						</div>

						<Alert className="bg-red-900/20 border-red-500">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription className="text-n-2">
								{errorInfo.troubleshooting}
								<details className="mt-2">
									<summary className="cursor-pointer text-sm font-medium">Possible causes:</summary>
									<ul className="mt-2 ml-4 list-disc text-sm">
										{errorInfo.causes.map((cause, index) => (
											<li key={index}>{cause}</li>
										))}
									</ul>
								</details>
							</AlertDescription>
						</Alert>
						
						<div className="bg-n-6 p-3 rounded-lg">
							<p className="text-sm text-n-3 mb-2">
								<strong>For developers:</strong> Check the browser console and server logs for detailed error information.
							</p>
							<p className="text-xs text-n-4">
								Run <code className="bg-n-5 px-1 rounded">pnpm health:check</code> in your terminal for detailed diagnostics.
							</p>
						</div>
						
						<div className="flex gap-2">
							<Button 
								onClick={() => window.location.reload()} 
								className="flex-1 bg-color-1 hover:bg-color-1/90 text-n-8"
							>
								Retry Connection
							</Button>
							<Button 
								variant="outline" 
								onClick={() => console.log('Opening browser dev tools...')}
								className="border-n-6 text-n-2 hover:bg-n-6"
							>
								View Console
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Critical failure state
	if (healthReport?.overall === 'unhealthy' && showDetails) {
		return (
			<div className="min-h-screen bg-n-8 flex items-center justify-center p-4">
				<Card className="w-full max-w-2xl bg-n-7 border-red-500">
					<CardHeader>
						<CardTitle className="text-red-400 flex items-center gap-2">
							<XCircle className="w-5 h-5" />
							Critical System Failures Detected
						</CardTitle>
						<CardDescription className="text-n-3">
							{healthReport.criticalFailures} critical service(s) failed to initialize
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert className="bg-red-900/20 border-red-500">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription className="text-n-2">
								The application cannot start due to critical service failures. Please contact your system administrator.
							</AlertDescription>
						</Alert>
						
						<div className="space-y-2 max-h-64 overflow-y-auto">
							{healthReport.checks.map((check, index) => (
								<div 
									key={index}
									className={`p-3 rounded-lg border ${
										check.status === 'healthy' 
											? 'bg-green-900/20 border-green-500' 
											: check.status === 'warning'
											? 'bg-yellow-900/20 border-yellow-500'
											: 'bg-red-900/20 border-red-500'
									}`}
								>
									<div className="flex items-center gap-2">
										{check.status === 'healthy' ? (
											<CheckCircle className="w-4 h-4 text-green-400" />
										) : check.status === 'warning' ? (
											<AlertTriangle className="w-4 h-4 text-yellow-400" />
										) : (
											<XCircle className="w-4 h-4 text-red-400" />
										)}
										<span className="font-medium text-n-1">{check.service}</span>
										{check.responseTime && (
											<span className="text-xs text-n-4">({check.responseTime}ms)</span>
										)}
									</div>
									<p className="text-sm text-n-3 mt-1">{check.message}</p>
								</div>
							))}
						</div>
						
						<div className="flex gap-2">
							<Button 
								onClick={() => window.location.reload()} 
								className="bg-color-1 hover:bg-color-1/90 text-n-8"
							>
								Retry
							</Button>
							<Button 
								variant="outline" 
								onClick={() => setShowDetails(false)}
								className="border-n-6 text-n-2 hover:bg-n-6"
							>
								Continue Anyway
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Show warning for degraded state
	if (healthReport?.overall === 'degraded' && (showDetails || healthReport.warnings > 2)) {
		const degradedWarning = (
			<Alert className="bg-yellow-900/20 border-yellow-500 mb-4">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription className="text-n-2 flex items-center justify-between">
					<span>
						Some services are unavailable ({healthReport.warnings} warnings). 
						Application functionality may be limited.
					</span>
					<Button 
						variant="ghost" 
						size="sm" 
						onClick={() => setShowDetails(!showDetails)}
						className="text-yellow-400 hover:text-yellow-300"
					>
						{showDetails ? 'Hide Details' : 'Show Details'}
					</Button>
				</AlertDescription>
			</Alert>
		)

		return (
			<div className="min-h-screen bg-n-8">
				<div className="container mx-auto px-4 py-4">
					{degradedWarning}
					
					{showDetails && (
						<Card className="mb-4 bg-n-7 border-n-6">
							<CardHeader>
								<CardTitle className="text-n-1">System Status Details</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid gap-2 max-h-48 overflow-y-auto">
									{healthReport.checks.map((check, index) => (
										<div 
											key={index}
											className={`p-2 rounded border ${
												check.status === 'healthy' 
													? 'bg-green-900/10 border-green-500/30' 
													: check.status === 'warning'
													? 'bg-yellow-900/10 border-yellow-500/30'
													: 'bg-red-900/10 border-red-500/30'
											}`}
										>
											<div className="flex items-center gap-2">
												{check.status === 'healthy' ? (
													<CheckCircle className="w-3 h-3 text-green-400" />
												) : check.status === 'warning' ? (
													<AlertTriangle className="w-3 h-3 text-yellow-400" />
												) : (
													<XCircle className="w-3 h-3 text-red-400" />
												)}
												<span className="text-sm font-medium text-n-1">{check.service}</span>
											</div>
											<p className="text-xs text-n-3 ml-5">{check.message}</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
				{children}
			</div>
		)
	}

	// Healthy state - render children normally
	return <>{children}</>
} 