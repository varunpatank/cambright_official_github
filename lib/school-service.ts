import { db, optimizedQueries } from '@/lib/db'
import { enhancedCache, SchoolCacheData } from '@/lib/enhanced-cache'
import { withQueryMonitoring } from '@/lib/query-performance-monitor'
import type { School, SchoolPost } from '@prisma/client'

export interface SchoolWithAssets extends School {
  imageAsset?: {
    id: string
    key: string
    originalName: string  // Correct database field name
    mimeType: string
    size: number          // Correct database field name  
    url: string          // Correct database field name
    type: string         // Correct database field name
    uploadedBy: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  } | null
  bannerAsset?: {
    id: string
    key: string
    originalName: string  // Correct database field name
    mimeType: string
    size: number          // Correct database field name
    url: string          // Correct database field name
    type: string         // Correct database field name
    uploadedBy: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  } | null
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
  imageAssetId?: string
  bannerAssetId?: string
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
  imageAssetId?: string
  bannerAssetId?: string
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
   * Get schools with pagination (API-compatible method)
   */
  static async getSchools(options: GetSchoolsOptions = {}): Promise<{
    schools: SchoolWithAssets[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const {
      search,
      page = 1,
      limit = 50,
      includeInactive = false
    } = options

    // Build where clause
    const where: any = {}
    
    if (!includeInactive) {
      where.isActive = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get schools with basic asset info
    const [schools, total] = await Promise.all([
      db.school.findMany({
        where,
        include: {
          Assets_School_imageAssetIdToAssets: {
            select: {
              id: true,
              key: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              type: true,
              uploadedBy: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          },
          Assets_School_bannerAssetIdToAssets: {
            select: {
              id: true,
              key: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              type: true,
              uploadedBy: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          }
        } as any,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.school.count({ where })
    ])

    // Transform schools to match expected interface
    const transformedSchools = schools.map(school => ({
      ...school,
      imageAsset: (school as any).Assets_School_imageAssetIdToAssets,
      bannerAsset: (school as any).Assets_School_bannerAssetIdToAssets
    }))

    const totalPages = Math.ceil(total / limit)

    return {
      schools: transformedSchools as SchoolWithAssets[],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  }

  /**
   * Get a single school by ID
   */
  static async getSchoolById(id: string): Promise<SchoolWithAssets | null> {
    const school = await withQueryMonitoring(
      `getSchoolById:${id}`,
      () => db.school.findUnique({
        where: { id },
        include: {
          Assets_School_imageAssetIdToAssets: {
            select: {
              id: true,
              key: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              type: true,
              uploadedBy: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          },
          Assets_School_bannerAssetIdToAssets: {
            select: {
              id: true,
              key: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              type: true,
              uploadedBy: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          }
        } as any
      })
    )

    if (!school) {
      return null
    }

    // Transform the response to match expected interface
    return {
      ...school,
      imageAsset: (school as any).Assets_School_imageAssetIdToAssets,
      bannerAsset: (school as any).Assets_School_bannerAssetIdToAssets
    } as SchoolWithAssets
  }

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
    let schools
    try {
      schools = await withQueryMonitoring(
        'getAllSchools:findMany',
        () => db.school.findMany({
          where: whereClause,
          include: {
            Assets_School_bannerAssetIdToAssets: true
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        })
      )
    } catch (error) {
      // Fallback query without asset relations if columns don't exist
      console.warn('Asset columns not found, falling back to basic query:', error)
      schools = await withQueryMonitoring(
        'getAllSchools:findMany:fallback',
        () => db.school.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        })
      )
    }

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
          imageAssetId: data.imageAssetId,
          bannerAssetId: data.bannerAssetId,
          volunteerHours: data.volunteerHours || 0,
          activeMembers: data.activeMembers || 0,
          createdBy: data.createdBy,
          isActive: true
        } as any,
        include: {
          Assets_School_imageAssetIdToAssets: true,
          Assets_School_bannerAssetIdToAssets: true
        } as any
      })
    )

    // Invalidate school list cache
    await enhancedCache.invalidateSchoolRelatedCache(school.id)

    // Transform the response to match expected interface
    return {
      ...school,
      imageAsset: (school as any).Assets_School_imageAssetIdToAssets,
      bannerAsset: (school as any).Assets_School_bannerAssetIdToAssets
    } as SchoolWithAssets
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
          Assets_School_imageAssetIdToAssets: true,
          Assets_School_bannerAssetIdToAssets: true
        } as any
      })
    )

    // Invalidate related cache
    await enhancedCache.invalidateSchoolRelatedCache(id)

    // Transform the response to match expected interface
    return {
      ...school,
      imageAsset: (school as any).Assets_School_imageAssetIdToAssets,
      bannerAsset: (school as any).Assets_School_bannerAssetIdToAssets
    } as SchoolWithAssets
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
          Assets_School_imageAssetIdToAssets: true,
          Assets_School_bannerAssetIdToAssets: true
        } as any
      })
    )

    // Invalidate related cache
    await enhancedCache.invalidateSchoolRelatedCache(id)

    // Transform the response to match expected interface
    return {
      ...school,
      imageAsset: (school as any).Assets_School_imageAssetIdToAssets,
      bannerAsset: (school as any).Assets_School_bannerAssetIdToAssets
    } as SchoolWithAssets
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
        Assets_School_bannerAssetIdToAssets: true,
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
        Assets_School_imageAssetIdToAssets: true,
        Assets_School_bannerAssetIdToAssets: true
      } as any,
      take: limit,
      orderBy: { name: 'asc' }
    })

    // Transform the response to match expected interface
    const transformedSchools = schools.map(school => ({
      ...school,
      imageAsset: (school as any).Assets_School_imageAssetIdToAssets,
      bannerAsset: (school as any).Assets_School_bannerAssetIdToAssets
    }))

    return transformedSchools as SchoolWithAssets[]
  }
}