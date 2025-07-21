import { db, optimizedQueries } from '@/lib/db'
import { enhancedCache, SchoolCacheData } from '@/lib/enhanced-cache'
import { withQueryMonitoring } from '@/lib/query-performance-monitor'
import { School, SchoolPost, AssetManager } from '@prisma/client'

export interface SchoolWithAssets extends School {
  imageAsset?: AssetManager | null
  bannerAsset?: AssetManager | null
}

export interface SchoolWithPosts extends SchoolWithAssets {
  posts: SchoolPost[]
}

export interface CreateSchoolData {
  name: string
  description?: string
  location?: string
  website?: string
  email?: string
  phone?: string
  imageAssetKey?: string
  bannerAssetKey?: string
  volunteerHours?: number
  activeMembers?: number
  createdBy: string
}

export interface UpdateSchoolData {
  name?: string
  description?: string
  location?: string
  website?: string
  email?: string
  phone?: string
  imageAssetKey?: string
  bannerAssetKey?: string
  volunteerHours?: number
  activeMembers?: number
  isActive?: boolean
}

export interface SchoolStatsData {
  volunteerHours?: number
  activeMembers?: number
}

export interface GetSchoolsOptions {
  search?: string
  page?: number
  limit?: number
  includeInactive?: boolean
}

export class SchoolService {
  /**
   * Get all schools with optional filtering and pagination
   */
  static async getAllSchools(options: GetSchoolsOptions = {}): Promise<{
    schools: SchoolWithAssets[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const {
      search,
      page = 1,
      limit = 10,
      includeInactive = false
    } = options

    // For simple cases without search or pagination, try cache first
    if (!search && page === 1 && limit === 10 && !includeInactive) {
      const cached = await enhancedCache.getSchoolsList()
      if (cached) {
        return {
          schools: cached as SchoolWithAssets[],
          total: cached.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(cached.length / 10)
        }
      }
    }

    // Build where clause for search and active status
    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filter by active status unless explicitly including inactive
    if (!includeInactive) {
      whereClause.isActive = true
    }

    // Get total count for pagination
    const total = await withQueryMonitoring(
      'getAllSchools:count',
      () => db.school.count({ where: whereClause })
    )

    // Get paginated schools with asset relations
    const schools = await withQueryMonitoring(
      'getAllSchools:findMany',
      () => db.school.findMany({
        where: whereClause,
        include: {
          imageAsset: true,
          bannerAsset: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
    )

    // Cache simple queries
    if (!search && page === 1 && limit === 10 && !includeInactive) {
      await enhancedCache.setSchoolsList(schools as SchoolCacheData[])
    }

    return {
      schools,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Get school by ID with asset relations
   */
  static async getSchoolById(id: string, includePosts = false): Promise<SchoolWithAssets | SchoolWithPosts | null> {
    // Try cache first for basic school data
    if (!includePosts) {
      const cached = await enhancedCache.getSchool(id)
      if (cached) {
        return cached as SchoolWithAssets
      }
    }

    const includeOptions: any = {
      imageAsset: true,
      bannerAsset: true
    }

    if (includePosts) {
      includeOptions.posts = {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }
    }

    const school = await withQueryMonitoring(
      `getSchoolById:${id}`,
      () => db.school.findUnique({
        where: { id },
        include: includeOptions
      })
    )

    // Cache basic school data
    if (school && !includePosts) {
      await enhancedCache.setSchool(id, school as SchoolCacheData)
    }

    return school
  }

  /**
   * Create a new school
   */
  static async createSchool(data: CreateSchoolData): Promise<SchoolWithAssets> {
    const school = await withQueryMonitoring(
      'createSchool',
      () => db.school.create({
        data: {
          name: data.name,
          description: data.description,
          location: data.location,
          website: data.website,
          email: data.email,
          phone: data.phone,
          imageAssetKey: data.imageAssetKey,
          bannerAssetKey: data.bannerAssetKey,
          volunteerHours: data.volunteerHours || 0,
          activeMembers: data.activeMembers || 0,
          createdBy: data.createdBy,
          isActive: true
        },
        include: {
          imageAsset: true,
          bannerAsset: true
        }
      })
    )

    // Invalidate school list cache
    await enhancedCache.invalidateSchoolRelatedCache(school.id)

    return school
  }

  /**
   * Update school information
   */
  static async updateSchool(id: string, data: UpdateSchoolData): Promise<SchoolWithAssets> {
    const school = await withQueryMonitoring(
      `updateSchool:${id}`,
      () => db.school.update({
        where: { id },
        data,
        include: {
          imageAsset: true,
          bannerAsset: true
        }
      })
    )

    // Invalidate related cache
    await enhancedCache.invalidateSchoolRelatedCache(id)

    return school
  }

  /**
   * Update school statistics (volunteer hours and active members)
   */
  static async updateSchoolStats(id: string, stats: SchoolStatsData): Promise<SchoolWithAssets> {
    const school = await withQueryMonitoring(
      `updateSchoolStats:${id}`,
      () => db.school.update({
        where: { id },
        data: stats,
        include: {
          imageAsset: true,
          bannerAsset: true
        }
      })
    )

    // Invalidate related cache
    await enhancedCache.invalidateSchoolRelatedCache(id)

    return school
  }

  /**
   * Delete school (soft delete by setting isActive to false)
   */
  static async deleteSchool(id: string): Promise<void> {
    await withQueryMonitoring(
      `deleteSchool:${id}`,
      () => db.school.update({
        where: { id },
        data: { isActive: false }
      })
    )

    // Invalidate related cache
    await enhancedCache.invalidateSchoolRelatedCache(id)
  }

  /**
   * Hard delete school (permanent deletion)
   */
  static async hardDeleteSchool(id: string): Promise<void> {
    await withQueryMonitoring(
      `hardDeleteSchool:${id}`,
      () => db.school.delete({
        where: { id }
      })
    )

    // Invalidate related cache
    await enhancedCache.invalidateSchoolRelatedCache(id)
  }

  /**
   * Check if school exists and is active
   */
  static async schoolExists(id: string): Promise<boolean> {
    const school = await db.school.findUnique({
      where: { id, isActive: true },
      select: { id: true }
    })

    return !!school
  }

  /**
   * Get schools with chapter admin information
   */
  static async getSchoolsWithAdmins(): Promise<any[]> {
    const schools = await db.school.findMany({
      where: { isActive: true },
      include: {
        imageAsset: true,
        bannerAsset: true,
        chapterAdmins: {
          where: { isActive: true },
          include: {
            school: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return schools
  }

  /**
   * Search schools by name or location
   */
  static async searchSchools(query: string, limit = 10): Promise<SchoolWithAssets[]> {
    const schools = await db.school.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        imageAsset: true,
        bannerAsset: true
      },
      take: limit,
      orderBy: { name: 'asc' }
    })

    return schools
  }
}