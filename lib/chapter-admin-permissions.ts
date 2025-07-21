// Chapter Admin Permission Utilities
// Provides role-based access control for chapter admin operations

import { ChapterAdminRole } from '@prisma/client'
import { ChapterAdminService } from '@/lib/chapter-admin-service'
import { hasAdminAccess, isSuperAdmin } from '@/lib/admin'

/**
 * Permission matrix for chapter admin operations
 */
export const CHAPTER_ADMIN_PERMISSIONS = {
  // School management permissions
  CREATE_SCHOOLS: ['SYSTEM_ADMIN'],
  DELETE_SCHOOLS: ['SYSTEM_ADMIN'],
  VIEW_ALL_SCHOOLS: ['SYSTEM_ADMIN'],
  
  // Admin assignment permissions
  ASSIGN_CHAPTER_SUPER_ADMIN: ['SYSTEM_ADMIN'],
  ASSIGN_CHAPTER_ADMIN: ['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN'],
  REMOVE_CHAPTER_ADMIN: ['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN'],
  
  // School statistics permissions
  EDIT_VOLUNTEER_HOURS: ['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN'],
  EDIT_ACTIVE_MEMBERS: ['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN', 'CHAPTER_ADMIN'],
  
  // Post management permissions
  CREATE_SCHOOL_POSTS: ['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN', 'CHAPTER_ADMIN'],
  DELETE_SCHOOL_POSTS: ['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN'],
  
  // School information permissions
  EDIT_SCHOOL_INFO: ['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN'],
  VIEW_SCHOOL_ADMIN_PANEL: ['SYSTEM_ADMIN', 'CHAPTER_SUPER_ADMIN', 'CHAPTER_ADMIN']
} as const

export type Permission = keyof typeof CHAPTER_ADMIN_PERMISSIONS
export type UserRole = 'SYSTEM_ADMIN' | 'CHAPTER_SUPER_ADMIN' | 'CHAPTER_ADMIN' | 'USER'

/**
 * Get user's effective role for a specific school
 */
export async function getUserRoleForSchool(userId: string, schoolId?: string): Promise<UserRole> {
  // Check system admin first (highest priority)
  if (hasAdminAccess(userId)) {
    return 'SYSTEM_ADMIN'
  }

  // If no school specified, user is regular user
  if (!schoolId) {
    return 'USER'
  }

  // Check chapter admin permissions for the specific school
  const hasChapterSuperAdmin = await ChapterAdminService.hasPermission(
    userId, 
    schoolId, 
    ChapterAdminRole.CHAPTER_SUPER_ADMIN
  )
  
  if (hasChapterSuperAdmin) {
    return 'CHAPTER_SUPER_ADMIN'
  }

  const hasChapterAdmin = await ChapterAdminService.hasPermission(
    userId, 
    schoolId, 
    ChapterAdminRole.CHAPTER_ADMIN
  )
  
  if (hasChapterAdmin) {
    return 'CHAPTER_ADMIN'
  }

  return 'USER'
}

/**
 * Check if user has a specific permission for a school
 */
export async function hasChapterAdminAccess(
  userId: string, 
  permission: Permission, 
  schoolId?: string
): Promise<boolean> {
  if (!userId) return false

  const userRole = await getUserRoleForSchool(userId, schoolId)
  const requiredRoles = CHAPTER_ADMIN_PERMISSIONS[permission]
  
  return requiredRoles.includes(userRole as any)
}

/**
 * Check if user can assign a specific chapter admin role
 */
export async function canAssignRole(
  userId: string, 
  targetRole: ChapterAdminRole, 
  schoolId: string
): Promise<boolean> {
  if (!userId || !schoolId) return false

  const userRole = await getUserRoleForSchool(userId, schoolId)

  // Only system admins can assign CHAPTER_SUPER_ADMIN
  if (targetRole === ChapterAdminRole.CHAPTER_SUPER_ADMIN) {
    return userRole === 'SYSTEM_ADMIN'
  }

  // System admins and chapter super admins can assign CHAPTER_ADMIN
  if (targetRole === ChapterAdminRole.CHAPTER_ADMIN) {
    return userRole === 'SYSTEM_ADMIN' || userRole === 'CHAPTER_SUPER_ADMIN'
  }

  return false
}

/**
 * Check if user can remove a specific chapter admin
 */
export async function canRemoveAdmin(
  userId: string, 
  targetAdminId: string
): Promise<boolean> {
  if (!userId || !targetAdminId) return false

  // Get the target admin assignment
  const targetAdmin = await ChapterAdminService.getAdminById(targetAdminId)
  if (!targetAdmin) return false

  const userRole = await getUserRoleForSchool(userId, targetAdmin.schoolId)

  // System admins can remove anyone
  if (userRole === 'SYSTEM_ADMIN') return true

  // Chapter super admins can remove chapter admins (but not other super admins)
  if (userRole === 'CHAPTER_SUPER_ADMIN') {
    return targetAdmin.role === ChapterAdminRole.CHAPTER_ADMIN
  }

  return false
}

/**
 * Check if user can edit school statistics
 */
export async function canEditSchoolStats(
  userId: string, 
  schoolId: string, 
  statType: 'volunteerHours' | 'activeMembers'
): Promise<boolean> {
  if (!userId || !schoolId) return false

  if (statType === 'volunteerHours') {
    return await hasChapterAdminAccess(userId, 'EDIT_VOLUNTEER_HOURS', schoolId)
  }

  if (statType === 'activeMembers') {
    return await hasChapterAdminAccess(userId, 'EDIT_ACTIVE_MEMBERS', schoolId)
  }

  return false
}

/**
 * Check if user can create posts for a school
 */
export async function canCreateSchoolPost(userId: string, schoolId: string): Promise<boolean> {
  return await hasChapterAdminAccess(userId, 'CREATE_SCHOOL_POSTS', schoolId)
}

/**
 * Check if user can delete posts for a school
 */
export async function canDeleteSchoolPost(userId: string, schoolId: string): Promise<boolean> {
  return await hasChapterAdminAccess(userId, 'DELETE_SCHOOL_POSTS', schoolId)
}

/**
 * Check if user can access school admin panel
 */
export async function canAccessSchoolAdminPanel(userId: string, schoolId: string): Promise<boolean> {
  return await hasChapterAdminAccess(userId, 'VIEW_SCHOOL_ADMIN_PANEL', schoolId)
}

/**
 * Check if user can edit school information
 */
export async function canEditSchoolInfo(userId: string, schoolId: string): Promise<boolean> {
  return await hasChapterAdminAccess(userId, 'EDIT_SCHOOL_INFO', schoolId)
}

/**
 * Get all schools where user has admin access
 */
export async function getUserAdminSchools(userId: string): Promise<{
  schoolId: string
  role: UserRole
  permissions: Permission[]
}[]> {
  if (!userId) return []

  // If system admin, they have access to all schools
  if (hasAdminAccess(userId)) {
    // This would require getting all schools, but for now return empty
    // In practice, system admins would use different interfaces
    return []
  }

  // Get schools where user has chapter admin access
  const adminAssignments = await ChapterAdminService.getSchoolsByUser(userId)
  
  return adminAssignments.map(assignment => {
    const role: UserRole = assignment.role === ChapterAdminRole.CHAPTER_SUPER_ADMIN 
      ? 'CHAPTER_SUPER_ADMIN' 
      : 'CHAPTER_ADMIN'
    
    // Get permissions based on role
    const permissions: Permission[] = Object.entries(CHAPTER_ADMIN_PERMISSIONS)
      .filter(([_, roles]) => roles.includes(role as any))
      .map(([permission]) => permission as Permission)
    
    return {
      schoolId: assignment.schoolId,
      role,
      permissions
    }
  })
}

/**
 * Require specific permission or throw error
 */
export async function requireChapterAdminAccess(
  userId: string, 
  permission: Permission, 
  schoolId?: string
): Promise<void> {
  const hasAccess = await hasChapterAdminAccess(userId, permission, schoolId)
  
  if (!hasAccess) {
    const requiredRoles = CHAPTER_ADMIN_PERMISSIONS[permission].join(' or ')
    throw new Error(`Access denied. Required role: ${requiredRoles}`)
  }
}

/**
 * Require system admin access or throw error
 */
export function requireSystemAdmin(userId: string): void {
  if (!hasAdminAccess(userId)) {
    throw new Error('System administrator access required')
  }
}

/**
 * Get user's permission summary for a school
 */
export async function getUserPermissionSummary(userId: string, schoolId: string) {
  const role = await getUserRoleForSchool(userId, schoolId)
  
  const permissions = Object.entries(CHAPTER_ADMIN_PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role as any))
    .map(([permission]) => permission)
  
  return {
    userId,
    schoolId,
    role,
    permissions,
    canAssignChapterAdmin: await canAssignRole(userId, ChapterAdminRole.CHAPTER_ADMIN, schoolId),
    canAssignChapterSuperAdmin: await canAssignRole(userId, ChapterAdminRole.CHAPTER_SUPER_ADMIN, schoolId),
    canEditVolunteerHours: await canEditSchoolStats(userId, schoolId, 'volunteerHours'),
    canEditActiveMembers: await canEditSchoolStats(userId, schoolId, 'activeMembers'),
    canCreatePosts: await canCreateSchoolPost(userId, schoolId),
    canDeletePosts: await canDeleteSchoolPost(userId, schoolId),
    canEditSchoolInfo: await canEditSchoolInfo(userId, schoolId)
  }
}