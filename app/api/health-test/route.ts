import { NextRequest, NextResponse } from 'next/server'

// Simple test health endpoint
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'healthy',
      message: 'Test health endpoint working',
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Test health endpoint failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}