export interface School {
  id: string
  name: string
  description?: string
  imageUrl?: string
  location?: string
  website?: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  createdBy: string // Admin user ID
  // Chapter data
  volunteerHours?: number
  activeMembers?: number
  // Admin hierarchy
  chapterSuperAdmin?: string | null // User ID of chapter super admin
  chapterAdmins?: string[] // Array of user IDs for chapter admins
}

export interface ChapterAdmin {
  userId: string
  userName: string
  userEmail: string
  role: 'chapter_super_admin' | 'chapter_admin'
  schoolId: string
  schoolName: string
  assignedAt: string // ISO date string
  assignedBy: string // User ID of who assigned them
}

export interface SchoolsIndex {
  schools: School[]
  lastUpdated: string // ISO date string
  totalCount: number
}

export interface SchoolMetadata {
  totalSchools: number
  activeSchools: number
  lastUpdated: string
  version: string
}

export interface ChapterAdminRequest {
  schoolId: string
  userId: string
  role: 'chapter_super_admin' | 'chapter_admin'
  assignedBy: string
}

export interface ChapterStatsUpdate {
  schoolId: string
  volunteerHours?: number
  activeMembers?: number
  updatedBy: string
  updatedAt: string
}

// MinIO bucket structure:
// schools/
//   ├── index.json (SchoolsIndex)
//   ├── metadata.json (SchoolMetadata)
//   ├── schools/
//   │   ├── {schoolId}.json (School)
//   │   └── ...
//   ├── chapter-admins/
//   │   ├── index.json (ChapterAdmin[])
//   │   ├── by-school/
//   │   │   ├── {schoolId}.json (ChapterAdmin[])
//   │   │   └── ...
//   │   └── by-user/
//   │       ├── {userId}.json (ChapterAdmin[])
//   │       └── ...
//   └── images/
//       ├── {schoolId}/
//       │   ├── logo.jpg
//       │   └── banner.jpg
//       └── ... 