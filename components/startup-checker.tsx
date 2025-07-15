'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
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

export function StartupChecker({ children, showDetailedErrors = false }: StartupCheckerProps) {
	const [checkStatus, setCheckStatus] = useState<'checking' | 'completed' | 'failed'>('checking')
	const [healthReport, setHealthReport] = useState<StartupCheckSummary | null>(null)
	const [showDetails, setShowDetails] = useState(false)
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		let mounted = true
		
		// Check if health checks have already been run in this session
		// This prevents health checks from running on every navigation/page load
		const healthChecksKey = 'apcop_health_checks_completed'
		
		try {
			const hasRunHealthChecks = sessionStorage.getItem(healthChecksKey)
			
			if (hasRunHealthChecks) {
				// Health checks already completed this session, skip them
				setCheckStatus('completed')
				setProgress(100)
				return
			}
		} catch (error) {
			// SessionStorage not available, continue with health checks
			console.log('SessionStorage not available, running health checks')
		}
		
		const runChecks = async () => {
			try {
				// Simulate progress for better UX
				const progressInterval = setInterval(() => {
					setProgress(prev => Math.min(prev + 10, 90))
				}, 200)

				// Call the health API instead of importing server-side code
				const response = await fetch('/api/health?detailed=true', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				})

				if (!response.ok) {
					throw new Error(`Health check failed: ${response.status} ${response.statusText}`)
				}

				const report: StartupCheckSummary = await response.json()
				
				if (mounted) {
					clearInterval(progressInterval)
					setProgress(100)
					setHealthReport(report)
					setCheckStatus('completed')
					
					// Mark health checks as completed for this session
					try {
						sessionStorage.setItem(healthChecksKey, 'true')
					} catch (error) {
						// SessionStorage not available, health checks will run again on next load
						console.log('SessionStorage not available for marking completion')
					}
					
					// Only show details automatically for critical failures
					if (report.overall === 'unhealthy') {
						setShowDetails(showDetailedErrors)
					}
				}
			} catch (error) {
				if (mounted) {
					console.error('Startup checks failed:', error)
					setCheckStatus('failed')
					setShowDetails(true)
				}
			}
		}

		runChecks()
		
		return () => {
			mounted = false
		}
	}, [showDetailedErrors])

	// Loading state
	if (checkStatus === 'checking') {
		return (
			<div className="min-h-screen bg-n-8 flex items-center justify-center">
				<Card className="w-full max-w-md bg-n-7 border-n-6">
					<CardHeader className="text-center">
						<CardTitle className="text-n-1 flex items-center justify-center gap-2">
							<Clock className="w-5 h-5 animate-spin" />
							Initializing Application
						</CardTitle>
						<CardDescription className="text-n-3">
							Checking system health and connectivity...
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Progress value={progress} className="w-full" />
						<p className="text-sm text-n-4 mt-2 text-center">
							Verifying database and service connections
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Failed state
	if (checkStatus === 'failed') {
		return (
			<div className="min-h-screen bg-n-8 flex items-center justify-center p-4">
				<Card className="w-full max-w-md bg-n-7 border-red-500">
					<CardHeader className="text-center">
						<CardTitle className="text-red-400 flex items-center justify-center gap-2">
							<XCircle className="w-5 h-5" />
							Startup Failed
						</CardTitle>
						<CardDescription className="text-n-3">
							Unable to initialize application services
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert className="bg-red-900/20 border-red-500">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription className="text-n-2">
								Application startup checks encountered critical errors. Please check your configuration and try again.
							</AlertDescription>
						</Alert>
						<Button 
							onClick={() => window.location.reload()} 
							className="w-full bg-color-1 hover:bg-color-1/90 text-n-8"
						>
							Retry
						</Button>
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