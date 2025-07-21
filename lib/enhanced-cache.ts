// Enhanced caching strategy for chapter admin system
// Provides specialized caching for schools, permissions, and assets

import { cache, CacheInterface } from '@/lib/cache'
import { ChapterAdminRole } from '@prisma/client'

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  SCHOOL_DATA: 300,        // 5 minutes
  PERMISSIONS: 180,        // 3 minutes
  ASSET_METADATA: 600,     // 10 minutes
  USER_PROFILE: 300,       // 5 minutes
  SCHOOL_POSTS: 120,       // 2 minutes
  COURSE_DATA: 300,        // 5 minutes
  STATISTICS: 60,          // 1 minute
} as const

// Cache key prefixes
const CACHE_KEYS = {
  SCHOOL: 'school',
  SCHOOL_LIST: 'school:list',
  PERMISSIONS: 'permissions',
  ASSET: 'asset',
  USER_SCHOOLS: 'user:schools',
  SCHOOL_ADMINS: 'school:admins',
  SCHOOL_POSTS: 'school:posts',
  COURSE: 'course',
  USER_PROGRESS: 'user:progress',
  STATISTICS: 'stats',
} as const

interface SchoolCacheData {
  id: string
  name: string
  description?: string
  location?: string
  isActive: boolean
  volunteerHours: number
  activeMembers: number
  imageAssetKey?: string
  bannerAssetKey?: string
  createdAt: Date
  updatedAt: Date
}

interface PermissionCacheData {
  userId: string
  schoolId: string
  role: ChapterAdminRole
  isActive: boolean
}

interface AssetMetadataCache {
  key: string
  fileName: string
  mimeType: string
  fileSize: number
  assetType: string
  uploadedBy: string
  createdAt: Date
}

export class EnhancedCache {
  private cache: CacheInterface

  constructor(cacheInstance: CacheInterface = cache) {
    this.cache = cacheInstance
  }

  // School data caching
  async getSchool(schoolId: string): Promise<SchoolCacheData | null> {
    const key = `${CACHE_KEYS.SCHOOL}:${schoolId}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setSchool(schoolId: string, data: SchoolCacheData): Promise<void> {
    const key = `${CACHE_KEYS.SCHOOL}:${schoolId}`
    await this.cache.setex(key, CACHE_TTL.SCHOOL_DATA, JSON.stringify(data))
  }

  async getSchoolsList(filters?: string): Promise<SchoolCacheData[] | null> {
    const key = filters 
      ? `${CACHE_KEYS.SCHOOL_LIST}:${Buffer.from(filters).toString('base64')}`
      : CACHE_KEYS.SCHOOL_LIST
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setSchoolsList(data: SchoolCacheData[], filters?: string): Promise<void> {
    const key = filters 
      ? `${CACHE_KEYS.SCHOOL_LIST}:${Buffer.from(filters).toString('base64')}`
      : CACHE_KEYS.SCHOOL_LIST
    await this.cache.setex(key, CACHE_TTL.SCHOOL_DATA, JSON.stringify(data))
  }

  // Permission caching
  async getUserPermissions(userId: string): Promise<PermissionCacheData[] | null> {
    const key = `${CACHE_KEYS.PERMISSIONS}:user:${userId}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setUserPermissions(userId: string, permissions: PermissionCacheData[]): Promise<void> {
    const key = `${CACHE_KEYS.PERMISSIONS}:user:${userId}`
    await this.cache.setex(key, CACHE_TTL.PERMISSIONS, JSON.stringify(permissions))
  }

  async getSchoolPermission(userId: string, schoolId: string): Promise<PermissionCacheData | null> {
    const key = `${CACHE_KEYS.PERMISSIONS}:${userId}:${schoolId}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setSchoolPermission(userId: string, schoolId: string, permission: PermissionCacheData): Promise<void> {
    const key = `${CACHE_KEYS.PERMISSIONS}:${userId}:${schoolId}`
    await this.cache.setex(key, CACHE_TTL.PERMISSIONS, JSON.stringify(permission))
  }

  // Asset metadata caching
  async getAssetMetadata(assetKey: string): Promise<AssetMetadataCache | null> {
    const key = `${CACHE_KEYS.ASSET}:${assetKey}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setAssetMetadata(assetKey: string, metadata: AssetMetadataCache): Promise<void> {
    const key = `${CACHE_KEYS.ASSET}:${assetKey}`
    await this.cache.setex(key, CACHE_TTL.ASSET_METADATA, JSON.stringify(metadata))
  }

  // User schools caching
  async getUserSchools(userId: string): Promise<SchoolCacheData[] | null> {
    const key = `${CACHE_KEYS.USER_SCHOOLS}:${userId}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setUserSchools(userId: string, schools: SchoolCacheData[]): Promise<void> {
    const key = `${CACHE_KEYS.USER_SCHOOLS}:${userId}`
    await this.cache.setex(key, CACHE_TTL.SCHOOL_DATA, JSON.stringify(schools))
  }

  // School admins caching
  async getSchoolAdmins(schoolId: string): Promise<any[] | null> {
    const key = `${CACHE_KEYS.SCHOOL_ADMINS}:${schoolId}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setSchoolAdmins(schoolId: string, admins: any[]): Promise<void> {
    const key = `${CACHE_KEYS.SCHOOL_ADMINS}:${schoolId}`
    await this.cache.setex(key, CACHE_TTL.PERMISSIONS, JSON.stringify(admins))
  }

  // School posts caching
  async getSchoolPosts(schoolId: string, page = 1): Promise<any[] | null> {
    const key = `${CACHE_KEYS.SCHOOL_POSTS}:${schoolId}:${page}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setSchoolPosts(schoolId: string, posts: any[], page = 1): Promise<void> {
    const key = `${CACHE_KEYS.SCHOOL_POSTS}:${schoolId}:${page}`
    await this.cache.setex(key, CACHE_TTL.SCHOOL_POSTS, JSON.stringify(posts))
  }

  // Course data caching
  async getCourse(courseId: string): Promise<any | null> {
    const key = `${CACHE_KEYS.COURSE}:${courseId}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setCourse(courseId: string, course: any): Promise<void> {
    const key = `${CACHE_KEYS.COURSE}:${courseId}`
    await this.cache.setex(key, CACHE_TTL.COURSE_DATA, JSON.stringify(course))
  }

  // User progress caching
  async getUserProgress(userId: string, courseId?: string): Promise<any[] | null> {
    const key = courseId 
      ? `${CACHE_KEYS.USER_PROGRESS}:${userId}:${courseId}`
      : `${CACHE_KEYS.USER_PROGRESS}:${userId}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setUserProgress(userId: string, progress: any[], courseId?: string): Promise<void> {
    const key = courseId 
      ? `${CACHE_KEYS.USER_PROGRESS}:${userId}:${courseId}`
      : `${CACHE_KEYS.USER_PROGRESS}:${userId}`
    await this.cache.setex(key, CACHE_TTL.COURSE_DATA, JSON.stringify(progress))
  }

  // Statistics caching
  async getStatistics(type: string, identifier?: string): Promise<any | null> {
    const key = identifier 
      ? `${CACHE_KEYS.STATISTICS}:${type}:${identifier}`
      : `${CACHE_KEYS.STATISTICS}:${type}`
    const cached = await this.cache.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async setStatistics(type: string, data: any, identifier?: string): Promise<void> {
    const key = identifier 
      ? `${CACHE_KEYS.STATISTICS}:${type}:${identifier}`
      : `${CACHE_KEYS.STATISTICS}:${type}`
    await this.cache.setex(key, CACHE_TTL.STATISTICS, JSON.stringify(data))
  }

  // Cache invalidation methods
  async invalidateSchool(schoolId: string): Promise<void> {
    const keys = [
      `${CACHE_KEYS.SCHOOL}:${schoolId}`,
      `${CACHE_KEYS.SCHOOL_ADMINS}:${schoolId}`,
      `${CACHE_KEYS.SCHOOL_POSTS}:${schoolId}:1`, // Invalidate first page
      CACHE_KEYS.SCHOOL_LIST, // Invalidate school list
    ]

    await Promise.all(keys.map(key => this.cache.del(key)))
  }

  async invalidateUserPermissions(userId: string): Promise<void> {
    const keys = [
      `${CACHE_KEYS.PERMISSIONS}:user:${userId}`,
      `${CACHE_KEYS.USER_SCHOOLS}:${userId}`,
    ]

    await Promise.all(keys.map(key => this.cache.del(key)))
  }

  async invalidatePermission(userId: string, schoolId: string): Promise<void> {
    const key = `${CACHE_KEYS.PERMISSIONS}:${userId}:${schoolId}`
    await this.cache.del(key)
  }

  async invalidateAsset(assetKey: string): Promise<void> {
    const key = `${CACHE_KEYS.ASSET}:${assetKey}`
    await this.cache.del(key)
  }

  async invalidateUserProgress(userId: string, courseId?: string): Promise<void> {
    const keys = courseId 
      ? [`${CACHE_KEYS.USER_PROGRESS}:${userId}:${courseId}`, `${CACHE_KEYS.USER_PROGRESS}:${userId}`]
      : [`${CACHE_KEYS.USER_PROGRESS}:${userId}`]

    await Promise.all(keys.map(key => this.cache.del(key)))
  }

  // Batch operations
  async invalidateSchoolRelatedCache(schoolId: string): Promise<void> {
    await Promise.all([
      this.invalidateSchool(schoolId),
      this.cache.del(CACHE_KEYS.SCHOOL_LIST),
    ])
  }

  async invalidateUserRelatedCache(userId: string): Promise<void> {
    await this.invalidateUserPermissions(userId)
  }

  // Cache warming methods
  async warmSchoolCache(schoolId: string, schoolData: SchoolCacheData): Promise<void> {
    await this.setSchool(schoolId, schoolData)
  }

  async warmPermissionCache(userId: string, permissions: PermissionCacheData[]): Promise<void> {
    await this.setUserPermissions(userId, permissions)
  }

  // Cache statistics
  async getCacheStats(): Promise<{
    implementation: string
    isRedisAvailable: boolean
  }> {
    // This is a simplified implementation
    // In a real scenario, you'd want to get actual cache statistics
    return {
      implementation: 'SmartCache',
      isRedisAvailable: !!process.env.REDIS_URL,
    }
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    await this.cache.clear()
  }
}

// Export singleton instance
export const enhancedCache = new EnhancedCache()

// Export types
export type {
  SchoolCacheData,
  PermissionCacheData,
  AssetMetadataCache,
}