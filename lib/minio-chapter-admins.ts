import { minioClient, BUCKET_NAME, FOLDERS } from './minio'
import { ChapterAdmin, ChapterAdminRequest, School } from './minio-school-types'
import { createClerkClient } from '@clerk/nextjs/server'

// Initialize Clerk client
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Helper function to get user info from Clerk
async function getUserInfo(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId)
    return {
      id: user.id,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Unknown',
      email: user.emailAddresses[0]?.emailAddress || 'No email',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      username: user.username
    }
  } catch (error) {
    console.error('Error fetching user info:', error)
    return null
  }
}

// Helper function to search users by name/email
export async function searchUsers(query: string) {
  try {
    const userList = await clerkClient.users.getUserList({
      query,
      limit: 10
    })

    return userList.data.map(user => ({
      id: user.id,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Unknown',
      email: user.emailAddresses[0]?.emailAddress || 'No email',
      imageUrl: user.imageUrl,
      username: user.username
    }))
  } catch (error) {
    console.error('Error searching users:', error)
    return []
  }
}

// Helper function to check if a file exists in MinIO
async function fileExists(key: string): Promise<boolean> {
  try {
    await minioClient.statObject(BUCKET_NAME, key)
    return true
  } catch (error: any) {
    if (error.code === 'NoSuchKey' || error.code === 'NotFound') {
      return false
    }
    throw error
  }
}

// Helper function to create empty file if it doesn't exist
async function ensureFileExists(key: string, defaultContent: any = []): Promise<void> {
  const exists = await fileExists(key)
  if (!exists) {
    const content = JSON.stringify(defaultContent, null, 2)
    await minioClient.putObject(BUCKET_NAME, key, content)
  }
}

// Get all chapter admins
export async function getAllChapterAdmins(): Promise<ChapterAdmin[]> {
  try {
    const key = `${FOLDERS.CHAPTER_ADMINS}index.json`
    await ensureFileExists(key, [])
    
    const stream = await minioClient.getObject(BUCKET_NAME, key)
    const data = await streamToString(stream)
    return JSON.parse(data)
  } catch (error) {
    console.error('Error getting chapter admins:', error)
    return []
  }
}

// Get chapter admins for a specific school
export async function getChapterAdminsBySchool(schoolId: string): Promise<ChapterAdmin[]> {
  try {
    const key = `${FOLDERS.CHAPTER_ADMINS}by-school/${schoolId}.json`
    await ensureFileExists(key, [])
    
    const stream = await minioClient.getObject(BUCKET_NAME, key)
    const data = await streamToString(stream)
    return JSON.parse(data)
  } catch (error) {
    console.error('Error getting chapter admins by school:', error)
    return []
  }
}

// Get schools managed by a specific user
export async function getSchoolsByUser(userId: string): Promise<ChapterAdmin[]> {
  try {
    const key = `${FOLDERS.CHAPTER_ADMINS}by-user/${userId}.json`
    await ensureFileExists(key, [])
    
    const stream = await minioClient.getObject(BUCKET_NAME, key)
    const data = await streamToString(stream)
    return JSON.parse(data)
  } catch (error) {
    console.error('Error getting schools by user:', error)
    return []
  }
}

// Assign chapter admin role
export async function assignChapterAdmin(request: ChapterAdminRequest): Promise<{ success: boolean; error?: string; admin?: ChapterAdmin }> {
  try {
    // Get user info
    const userInfo = await getUserInfo(request.userId)
    if (!userInfo) {
      return { success: false, error: 'User not found' }
    }

    // Get school info
    const schoolKey = `${FOLDERS.SCHOOLS}data/${request.schoolId}.json`
    const schoolExists = await fileExists(schoolKey)
    if (!schoolExists) {
      return { success: false, error: 'School not found' }
    }
    
    const schoolStream = await minioClient.getObject(BUCKET_NAME, schoolKey)
    const schoolData = await streamToString(schoolStream)
    const school: School = JSON.parse(schoolData)

    // Check if user is already an admin for this school
    const existingAdmins = await getChapterAdminsBySchool(request.schoolId)
    const existingAdmin = existingAdmins.find(admin => admin.userId === request.userId)
    
    if (existingAdmin) {
      // Update existing admin role
      existingAdmin.role = request.role
      existingAdmin.assignedBy = request.assignedBy
      existingAdmin.assignedAt = new Date().toISOString()
    } else {
      // Create new admin
      const newAdmin: ChapterAdmin = {
        userId: request.userId,
        userName: userInfo.name,
        userEmail: userInfo.email,
        role: request.role,
        schoolId: request.schoolId,
        schoolName: school.name,
        assignedAt: new Date().toISOString(),
        assignedBy: request.assignedBy
      }
      existingAdmins.push(newAdmin)
    }

    // Save updated admins for this school
    await minioClient.putObject(
      BUCKET_NAME,
      `${FOLDERS.CHAPTER_ADMINS}by-school/${request.schoolId}.json`,
      JSON.stringify(existingAdmins, null, 2)
    )

    // Update by-user mapping
    const userAdmins = await getSchoolsByUser(request.userId)
    const userAdminIndex = userAdmins.findIndex(admin => admin.schoolId === request.schoolId)
    
    const userAdmin = existingAdmin || existingAdmins[existingAdmins.length - 1]
    
    if (userAdminIndex >= 0) {
      userAdmins[userAdminIndex] = userAdmin
    } else {
      userAdmins.push(userAdmin)
    }

    await minioClient.putObject(
      BUCKET_NAME,
      `${FOLDERS.CHAPTER_ADMINS}by-user/${request.userId}.json`,
      JSON.stringify(userAdmins, null, 2)
    )

    // Update global index
    await updateChapterAdminsIndex()

    return { success: true, admin: userAdmin }
  } catch (error) {
    console.error('Error assigning chapter admin:', error)
    return { success: false, error: 'Failed to assign chapter admin' }
  }
}

// Remove chapter admin
export async function removeChapterAdmin(schoolId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current admins for school
    const schoolAdmins = await getChapterAdminsBySchool(schoolId)
    const updatedSchoolAdmins = schoolAdmins.filter(admin => admin.userId !== userId)

    // Get school and update admin lists
    const schoolStream = await minioClient.getObject(BUCKET_NAME, `${FOLDERS.SCHOOLS}data/${schoolId}.json`)
    const schoolData = await streamToString(schoolStream)
    const school: School = JSON.parse(schoolData)

    // Remove from school
    if (school.chapterSuperAdmin === userId) {
      school.chapterSuperAdmin = null
    }
    if (school.chapterAdmins) {
      school.chapterAdmins = school.chapterAdmins.filter(id => id !== userId)
    }

    // Save updated school
    await minioClient.putObject(
      BUCKET_NAME,
      `${FOLDERS.SCHOOLS}data/${schoolId}.json`,
      JSON.stringify(school, null, 2)
    )

    // Save updated school admins
    await minioClient.putObject(
      BUCKET_NAME,
      `${FOLDERS.CHAPTER_ADMINS}by-school/${schoolId}.json`,
      JSON.stringify(updatedSchoolAdmins, null, 2)
    )

    // Update user's schools
    const userSchools = await getSchoolsByUser(userId)
    const updatedUserSchools = userSchools.filter(admin => admin.schoolId !== schoolId)
    
    await minioClient.putObject(
      BUCKET_NAME,
      `${FOLDERS.CHAPTER_ADMINS}by-user/${userId}.json`,
      JSON.stringify(updatedUserSchools, null, 2)
    )

    // Update global index
    await updateChapterAdminsIndex()

    return { success: true }
  } catch (error) {
    console.error('Error removing chapter admin:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Check if user has admin access to school
export async function hasChapterAdminAccess(userId: string, schoolId: string, requiredRole?: 'chapter_super_admin' | 'chapter_admin'): Promise<boolean> {
  try {
    const userSchools = await getSchoolsByUser(userId)
    const adminRecord = userSchools.find(admin => admin.schoolId === schoolId)
    
    if (!adminRecord) return false
    
    if (requiredRole) {
      if (requiredRole === 'chapter_super_admin') {
        return adminRecord.role === 'chapter_super_admin'
      } else {
        return adminRecord.role === 'chapter_super_admin' || adminRecord.role === 'chapter_admin'
      }
    }
    
    return true
  } catch (error) {
    console.error('Error checking chapter admin access:', error)
    return false
  }
}

// Update global chapter admins index
async function updateChapterAdminsIndex(): Promise<void> {
  try {
    const allAdmins: ChapterAdmin[] = []
    
    // Get all schools to collect their admins
    const schoolsStream = await minioClient.getObject(BUCKET_NAME, `${FOLDERS.SCHOOLS}index.json`)
    const schoolsData = await streamToString(schoolsStream)
    const schoolsIndex = JSON.parse(schoolsData)
    
    for (const school of schoolsIndex.schools) {
      const schoolAdmins = await getChapterAdminsBySchool(school.id)
      allAdmins.push(...schoolAdmins)
    }
    
    await minioClient.putObject(
      BUCKET_NAME,
      `${FOLDERS.CHAPTER_ADMINS}index.json`,
      JSON.stringify(allAdmins, null, 2)
    )
  } catch (error) {
    console.error('Error updating chapter admins index:', error)
  }
}

// Helper function to convert stream to string
async function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    stream.on('error', reject)
  })
}

// Initialize chapter admins structure
export async function initializeChapterAdmins(): Promise<void> {
  try {
    // Create empty index if it doesn't exist
    try {
      await minioClient.getObject(BUCKET_NAME, `${FOLDERS.CHAPTER_ADMINS}index.json`)
    } catch (error) {
      await minioClient.putObject(
        BUCKET_NAME,
        `${FOLDERS.CHAPTER_ADMINS}index.json`,
        JSON.stringify([], null, 2)
      )
    }
    
    console.log('✅ Chapter admins structure initialized')
  } catch (error) {
    console.error('Error initializing chapter admins:', error)
  }
} 