// v0.0.01 salah

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Database configuration with connection pooling and performance optimizations
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

export const db = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// Performance monitoring utilities
export const withPerformanceLogging = async <T>(
  operation: string,
  query: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await query();
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`Slow query detected: ${operation} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Query failed: ${operation} failed after ${duration}ms`, error);
    throw error;
  }
};

// Optimized query helpers
export const optimizedQueries = {
  // Get schools with minimal data for listings
  getSchoolsMinimal: () => db.school.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      isActive: true,
      imageAssetId: true,
      volunteerHours: true,
      activeMembers: true,
      createdAt: true,
    },
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  }),

  // Get school with all relations for detailed view
  getSchoolWithRelations: (id: string) => db.school.findUnique({
    where: { id },
    include: {
      Assets_School_imageAssetIdToAssets: {
        select: {
          key: true,
          originalName: true,
          mimeType: true,
        },
      },
      Assets_School_bannerAssetIdToAssets: {
        select: {
          key: true,
          originalName: true,
          mimeType: true,
        },
      },
      posts: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          imageAsset: {
            select: {
              key: true,
              originalName: true,
              mimeType: true,
            },
          },
        },
      },
      chapterAdmins: {
        where: { isActive: true },
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true,
        },
      },
    },
  }),

  // Get chapter admin permissions efficiently
  getChapterAdminPermissions: (userId: string) => db.chapterAdmin.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      schoolId: true,
      role: true,
      school: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  }),

  // Get courses with optimized includes
  getCoursesOptimized: (filters?: { subjectId?: string; boardId?: string; isPublished?: boolean }) => db.course.findMany({
    where: {
      ...filters,
    },
    select: {
      id: true,
      title: true,
      description: true,
      isPublished: true,
      imageAssetId: true,
      createdAt: true,
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      board: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          chapters: true,
          enrollment: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }),

  // Get user progress efficiently
  getUserProgressOptimized: (userId: string, courseId?: string) => db.userProgress.findMany({
    where: {
      userId,
      ...(courseId && {
        chapter: {
          courseId,
        },
      }),
    },
    select: {
      id: true,
      chapterId: true,
      isCompleted: true,
      chapter: {
        select: {
          id: true,
          title: true,
          position: true,
          courseId: true,
        },
      },
    },
    orderBy: {
      chapter: {
        position: 'asc',
      },
    },
  }),
};
