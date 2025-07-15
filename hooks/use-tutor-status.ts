'use client'

import { useState, useEffect, useCallback } from 'react'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const CACHE_DURATION = 30000 // 30 seconds cache

// In-memory cache to reduce redundant API calls
const tutorStatusCache = new Map<string, { 
	isTutor: boolean; 
	timestamp: number 
}>()

// Export cache clearing function for use when tutor status changes
export const clearTutorStatusCache = (userId?: string) => {
	if (userId) {
		tutorStatusCache.delete(userId)
	} else {
		tutorStatusCache.clear()
	}
}

export function useTutorStatus(userId: string | null | undefined) {
	const [isTutor, setIsTutor] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [retryCount, setRetryCount] = useState(0)

	const checkTutorStatus = useCallback(async (attempt = 0) => {
		if (!userId) {
			setIsTutor(false)
			setIsLoading(false)
			return
		}

		// Check cache first
		const cached = tutorStatusCache.get(userId)
		if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
			setIsTutor(cached.isTutor)
			setIsLoading(false)
			return
		}

		try {
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

			const response = await fetch(
				`/api/tutor-status?userId=${encodeURIComponent(userId)}`,
				{ 
					signal: controller.signal,
					// Allow browser caching for 10 seconds
					next: { revalidate: 10 }
				}
			)
			
			clearTimeout(timeoutId)

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			}

			const data = await response.json()
			const tutorStatus = data.isTutor || false
			
			// Update cache
			tutorStatusCache.set(userId, {
				isTutor: tutorStatus,
				timestamp: Date.now()
			})
			
			setIsTutor(tutorStatus)
			setRetryCount(0) // Reset retry count on success
		} catch (error) {
			console.error('Failed to check tutor status:', error)
			
			// Retry logic
			if (attempt < MAX_RETRIES) {
				setRetryCount(attempt + 1)
				console.log(`Retrying tutor status check (${attempt + 1}/${MAX_RETRIES})...`)
				setTimeout(() => {
					checkTutorStatus(attempt + 1)
				}, RETRY_DELAY * (attempt + 1)) // Exponential backoff
				return
			}
			
			// Final fallback - set to false
			setIsTutor(false)
			setRetryCount(0)
		} finally {
			if (attempt === 0) {
				setIsLoading(false)
			}
		}
	}, [userId])

	useEffect(() => {
		setIsLoading(true)
		setRetryCount(0)
		checkTutorStatus()
	}, [checkTutorStatus])

	return { isTutor, isLoading, retryCount }
} 