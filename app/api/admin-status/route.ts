import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, isSuperAdmin } from '@/lib/admin'

// Make this route dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')

		if (!userId) {
			return NextResponse.json({ isAdmin: false, isSuperAdmin: false })
		}

		const adminStatus = isAdmin(userId)
		const superAdminStatus = isSuperAdmin(userId)
		
		return NextResponse.json({ 
			isAdmin: adminStatus, 
			isSuperAdmin: superAdminStatus,
			hasAdminAccess: adminStatus || superAdminStatus
		})
	} catch (error) {
		console.error('Error checking admin status:', error)
		return NextResponse.json({ isAdmin: false, isSuperAdmin: false }, { status: 500 })
	}
} 