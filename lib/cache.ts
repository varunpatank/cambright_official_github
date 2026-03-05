// Cache utility with Redis and memory fallback
// Supports both Redis (production) and in-memory cache (development)
// Redis is only used when REDIS_URL is explicitly set in environment variables

interface CacheInterface {
	get(key: string): Promise<string | null>
	setex(key: string, ttl: number, value: string): Promise<void>
	del(key: string): Promise<void>
	clear(): Promise<void>
}

// Redis cache implementation (lazy-loaded only when REDIS_URL is set)
class RedisCache implements CacheInterface {
	private redis: any
	private connected: boolean = false

	constructor(redisUrl: string) {
		// Dynamically import ioredis to avoid loading it when not needed
		const IoRedis = require('ioredis')
		this.redis = new IoRedis(redisUrl, {
			lazyConnect: true,
			maxRetriesPerRequest: 1,
			retryStrategy(times: number) {
				if (times > 3) return null // Stop retrying after 3 attempts
				return Math.min(times * 200, 2000)
			},
			enableOfflineQueue: false,
		})
		this.redis.on('error', (err: Error) => {
			if (this.connected) {
				console.warn('Redis connection error:', err.message)
			}
			this.connected = false
		})
		this.redis.on('connect', () => {
			this.connected = true
		})
		// Attempt connection but don't block
		this.redis.connect().catch(() => {
			this.connected = false
		})
	}

	async get(key: string): Promise<string | null> {
		if (!this.connected) return null
		try {
			return await this.redis.get(key)
		} catch (error) {
			return null
		}
	}

	async setex(key: string, ttl: number, value: string): Promise<void> {
		if (!this.connected) return
		try {
			await this.redis.setex(key, ttl, value)
		} catch (error) {
			// silently fail
		}
	}

	async del(key: string): Promise<void> {
		if (!this.connected) return
		try {
			await this.redis.del(key)
		} catch (error) {
			// silently fail
		}
	}

	async clear(): Promise<void> {
		if (!this.connected) return
		try {
			await this.redis.flushall()
		} catch (error) {
			// silently fail
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
		
		// Only use Redis when REDIS_URL is explicitly configured
		const redisUrl = process.env.REDIS_URL
		if (redisUrl) {
			try {
				this.redisCache = new RedisCache(redisUrl)
			} catch (error) {
				console.warn('Failed to initialize Redis, falling back to memory cache')
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