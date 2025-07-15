// Cache utility with Redis and memory fallback
// Supports both Redis (production) and in-memory cache (development)

import { Redis } from 'ioredis'

interface CacheInterface {
	get(key: string): Promise<string | null>
	setex(key: string, ttl: number, value: string): Promise<void>
	del(key: string): Promise<void>
	clear(): Promise<void>
}

// Redis cache implementation
class RedisCache implements CacheInterface {
	private redis: Redis

	constructor() {
		this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
	}

	async get(key: string): Promise<string | null> {
		try {
			return await this.redis.get(key)
		} catch (error) {
			console.warn('Redis get error:', error)
			return null
		}
	}

	async setex(key: string, ttl: number, value: string): Promise<void> {
		try {
			await this.redis.setex(key, ttl, value)
		} catch (error) {
			console.warn('Redis setex error:', error)
		}
	}

	async del(key: string): Promise<void> {
		try {
			await this.redis.del(key)
		} catch (error) {
			console.warn('Redis del error:', error)
		}
	}

	async clear(): Promise<void> {
		try {
			await this.redis.flushall()
		} catch (error) {
			console.warn('Redis clear error:', error)
		}
	}
}

// Memory cache implementation (fallback)
class MemoryCache implements CacheInterface {
	private cache = new Map<string, { value: string; expires: number }>()

	async get(key: string): Promise<string | null> {
		const item = this.cache.get(key)
		if (!item) return null

		if (Date.now() > item.expires) {
			this.cache.delete(key)
			return null
		}

		return item.value
	}

	async setex(key: string, ttl: number, value: string): Promise<void> {
		const expires = Date.now() + ttl * 1000
		this.cache.set(key, { value, expires })
	}

	async del(key: string): Promise<void> {
		this.cache.delete(key)
	}

	async clear(): Promise<void> {
		this.cache.clear()
	}
}

// Smart cache that tries Redis first, falls back to memory
class SmartCache implements CacheInterface {
	private redisCache: RedisCache | null = null
	private memoryCache: MemoryCache

	constructor() {
		this.memoryCache = new MemoryCache()
		
		// Only use Redis in production or if explicitly configured
		if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
			try {
				this.redisCache = new RedisCache()
			} catch (error) {
				console.warn('Failed to initialize Redis, falling back to memory cache:', error)
			}
		}
	}

	async get(key: string): Promise<string | null> {
		if (this.redisCache) {
			const result = await this.redisCache.get(key)
			if (result !== null) return result
		}
		return this.memoryCache.get(key)
	}

	async setex(key: string, ttl: number, value: string): Promise<void> {
		if (this.redisCache) {
			await this.redisCache.setex(key, ttl, value)
		}
		// Always cache in memory as well for immediate access
		await this.memoryCache.setex(key, ttl, value)
	}

	async del(key: string): Promise<void> {
		if (this.redisCache) {
			await this.redisCache.del(key)
		}
		await this.memoryCache.del(key)
	}

	async clear(): Promise<void> {
		if (this.redisCache) {
			await this.redisCache.clear()
		}
		await this.memoryCache.clear()
	}
}

// Export singleton instance
export const cache = new SmartCache()

// Export types for use in other modules
export type { CacheInterface } 