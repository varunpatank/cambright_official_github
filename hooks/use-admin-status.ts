'use client'

import { useState, useEffect } from 'react'

const CACHE_DURATION = 30000 // 30 seconds cache

// In-memory cache to reduce redundant API calls
const adminStatusCache = new Map<string, { 
	isAdmin: boolean;
	isSuperAdmin: boolean; 
	timestamp: number 
}>()

// Export cache clearing function for use when admin status changes
export const clearAdminStatusCache = (userId?: string) => {
	if (userId) {
		adminStatusCache.delete(userId)
	} else {
		adminStatusCache.clear()
	}
}

export function useAdminStatus(userId: string | null | undefined) {
	const [isAdmin, setIsAdmin] = useState(false)
	const [isSuperAdmin, setIsSuperAdmin] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAdminStatus = async () => {
			if (!userId) {
				setIsAdmin(false)
				setIsSuperAdmin(false)
				setIsLoading(false)
				return
			}

			// Check cache first
			const cached = adminStatusCache.get(userId)
			if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
				setIsAdmin(cached.isAdmin)
				setIsSuperAdmin(cached.isSuperAdmin)
				setIsLoading(false)
				return
			}

			try {
				const response = await fetch(
					`/api/admin-status?userId=${encodeURIComponent(userId)}`,
					{
						// Allow browser caching for 10 seconds
						next: { revalidate: 10 }
					}
				)
				const data = await response.json()
				const adminStatus = {
					isAdmin: data.isAdmin || false,
					isSuperAdmin: data.isSuperAdmin || false
				}
				
				// Update cache
				adminStatusCache.set(userId, {
					...adminStatus,
					timestamp: Date.now()
				})
				
				setIsAdmin(adminStatus.isAdmin)
				setIsSuperAdmin(adminStatus.isSuperAdmin)
			} catch (error) {
				console.error('Failed to check admin status:', error)
				setIsAdmin(false)
				setIsSuperAdmin(false)
			} finally {
				setIsLoading(false)
			}
		}

		checkAdminStatus()
	}, [userId])

	return { isAdmin, isSuperAdmin, hasAdminAccess: isAdmin || isSuperAdmin, isLoading }
} 