import { NextRequest, NextResponse } from 'next/server'
import { runStartupChecks, quickHealthCheck } from '@/lib/startup-checks'

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const detailed = searchParams.get('detailed') === 'true'
		
		if (detailed) {
			// Run comprehensive health checks
			const healthReport = await runStartupChecks()
			
			const statusCode = healthReport.overall === 'healthy' ? 200 : 
							   healthReport.overall === 'degraded' ? 206 : 503
			
			return NextResponse.json(healthReport, { status: statusCode })
		} else {
			// Quick health check for load balancers/monitoring
			const quickCheck = await quickHealthCheck()
			const statusCode = quickCheck.status === 'healthy' ? 200 : 503
			
			return NextResponse.json(quickCheck, { status: statusCode })
		}
	} catch (error) {
		console.error('Health check endpoint error:', error)
		
		return NextResponse.json(
			{
				status: 'unhealthy',
				message: 'Health check failed',
				error: error instanceof Error ? error.message : String(error),
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		)
	}
} 