import { NextRequest, NextResponse } from 'next/server'

// GET /api/health - Simplified health check endpoint
export async function GET(request: NextRequest) {
	const startTime = Date.now()
	
	try {
		const { searchParams } = new URL(request.url)
		const detailed = searchParams.get('detailed') === 'true'
		
		// Simple health check response
		const healthResponse = {
			status: 'healthy',
			message: 'Server is running',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			detailed: detailed
		}
		
		if (detailed) {
			healthResponse.detailed = true
			// Add basic system info for detailed response
			Object.assign(healthResponse, {
				nodeVersion: process.version,
				platform: process.platform,
				memory: {
					used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
					total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
				}
			})
		}
		
		return NextResponse.json(healthResponse, { status: 200 })
	} catch (error) {
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