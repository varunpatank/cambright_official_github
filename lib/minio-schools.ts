import { minioClient, BUCKET_NAME, FOLDERS } from './minio'
import { School, SchoolsIndex, SchoolMetadata } from './minio-school-types'

const INDEX_FILE = `${FOLDERS.SCHOOLS}index.json`
const METADATA_FILE = `${FOLDERS.SCHOOLS}metadata.json`
const SCHOOLS_PREFIX = `${FOLDERS.SCHOOLS}data/`
const IMAGES_PREFIX = `${FOLDERS.SCHOOL_IMAGES}`

// Initialize the schools bucket structure
export async function initializeSchoolsBucket() {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME)
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME)
    }

    // Create initial index if it doesn't exist
    const indexExists = await objectExists(INDEX_FILE)
    if (!indexExists) {
      const initialIndex: SchoolsIndex = {
        schools: [],
        lastUpdated: new Date().toISOString(),
        totalCount: 0
      }
      await uploadJSON(INDEX_FILE, initialIndex)
    }

    // Create initial metadata if it doesn't exist
    const metadataExists = await objectExists(METADATA_FILE)
    if (!metadataExists) {
      const initialMetadata: SchoolMetadata = {
        totalSchools: 0,
        activeSchools: 0,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
      await uploadJSON(METADATA_FILE, initialMetadata)
    }

    return true
  } catch (error) {
    console.error('Error initializing schools bucket:', error)
    return false
  }
}

// Helper function to check if object exists
async function objectExists(objectName: string): Promise<boolean> {
  try {
    await minioClient.statObject(BUCKET_NAME, objectName)
    return true
  } catch (error) {
    return false
  }
}

// Helper function to upload JSON data
async function uploadJSON(objectName: string, data: any): Promise<void> {
  const jsonString = JSON.stringify(data, null, 2)
  const buffer = Buffer.from(jsonString, 'utf-8')
  await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
    'Content-Type': 'application/json'
  })
}

// Helper function to download JSON data
async function downloadJSON<T>(objectName: string): Promise<T | null> {
  try {
    const stream = await minioClient.getObject(BUCKET_NAME, objectName)
    const chunks: Buffer[] = []
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => {
        try {
          const jsonString = Buffer.concat(chunks).toString('utf-8')
          const data = JSON.parse(jsonString)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      })
      stream.on('error', reject)
    })
  } catch (error) {
    console.error(`Error downloading JSON ${objectName}:`, error)
    return null
  }
}

// Get all schools
export async function getAllSchools(): Promise<School[]> {
  const index = await downloadJSON<SchoolsIndex>(INDEX_FILE)
  return index?.schools || []
}

// Get school by ID
export async function getSchoolById(id: string): Promise<School | null> {
  const objectName = `${SCHOOLS_PREFIX}${id}.json`
  return await downloadJSON<School>(objectName)
}

// Create a new school
export async function createSchool(school: Omit<School, 'id' | 'createdAt' | 'updatedAt'>): Promise<School> {
  const id = `school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newSchool: School = {
    ...school,
    id,
    createdAt: now,
    updatedAt: now
  }

  // Save individual school file
  const schoolObjectName = `${SCHOOLS_PREFIX}${id}.json`
  await uploadJSON(schoolObjectName, newSchool)

  // Update index
  await updateSchoolsIndex(newSchool, 'create')

  return newSchool
}

// Update an existing school
export async function updateSchool(id: string, updates: Partial<Omit<School, 'id' | 'createdAt'>>): Promise<School | null> {
  const existingSchool = await getSchoolById(id)
  if (!existingSchool) {
    return null
  }

  const updatedSchool: School = {
    ...existingSchool,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  // Save individual school file
  const schoolObjectName = `${SCHOOLS_PREFIX}${id}.json`
  await uploadJSON(schoolObjectName, updatedSchool)

  // Update index
  await updateSchoolsIndex(updatedSchool, 'update')

  return updatedSchool
}

// Delete a school
export async function deleteSchool(id: string): Promise<boolean> {
  try {
    const existingSchool = await getSchoolById(id)
    if (!existingSchool) {
      return false
    }

    // Delete individual school file
    const schoolObjectName = `${SCHOOLS_PREFIX}${id}.json`
    await minioClient.removeObject(BUCKET_NAME, schoolObjectName)

    // Delete school images folder
    try {
      const imagePrefix = `${IMAGES_PREFIX}${id}/`
      const objectsList = await listObjects(imagePrefix)
      if (objectsList.length > 0) {
        await minioClient.removeObjects(BUCKET_NAME, objectsList.map(obj => obj.name))
      }
    } catch (error) {
      console.warn('Error deleting school images:', error)
    }

    // Update index
    await updateSchoolsIndex(existingSchool, 'delete')

    return true
  } catch (error) {
    console.error('Error deleting school:', error)
    return false
  }
}

// Update the schools index
async function updateSchoolsIndex(school: School, operation: 'create' | 'update' | 'delete'): Promise<void> {
  const index = await downloadJSON<SchoolsIndex>(INDEX_FILE)
  if (!index) {
    throw new Error('Schools index not found')
  }

  let schools = [...index.schools]

  switch (operation) {
    case 'create':
      schools.push(school)
      break
    case 'update':
      const updateIndex = schools.findIndex(s => s.id === school.id)
      if (updateIndex !== -1) {
        schools[updateIndex] = school
      }
      break
    case 'delete':
      schools = schools.filter(s => s.id !== school.id)
      break
  }

  const updatedIndex: SchoolsIndex = {
    schools,
    lastUpdated: new Date().toISOString(),
    totalCount: schools.length
  }

  await uploadJSON(INDEX_FILE, updatedIndex)

  // Update metadata
  const metadata: SchoolMetadata = {
    totalSchools: schools.length,
    activeSchools: schools.filter(s => s.isActive).length,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  }

  await uploadJSON(METADATA_FILE, metadata)
}

// Search schools
export async function searchSchools(query: string): Promise<School[]> {
  const schools = await getAllSchools()
  const searchTerm = query.toLowerCase()
  
  return schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm) ||
    school.description?.toLowerCase().includes(searchTerm) ||
    school.location?.toLowerCase().includes(searchTerm)
  )
}

// Get schools metadata
export async function getSchoolsMetadata(): Promise<SchoolMetadata | null> {
  return await downloadJSON<SchoolMetadata>(METADATA_FILE)
}

// Upload school image
export async function uploadSchoolImage(schoolId: string, imageFile: Buffer, fileName: string): Promise<string> {
  const imageObjectName = `${IMAGES_PREFIX}${schoolId}/${fileName}`
  await minioClient.putObject(BUCKET_NAME, imageObjectName, imageFile, imageFile.length)
  
  // Return the MinIO URL
  return `minio://${BUCKET_NAME}/${imageObjectName}`
}

// Get school image URL
export async function getSchoolImageUrl(schoolId: string, fileName: string): Promise<string | null> {
  try {
    const imageObjectName = `${IMAGES_PREFIX}${schoolId}/${fileName}`
    const url = await minioClient.presignedGetObject(BUCKET_NAME, imageObjectName, 24 * 60 * 60) // 24 hours
    return url
  } catch (error) {
    console.error('Error getting school image URL:', error)
    return null
  }
}

// List objects helper
async function listObjects(prefix: string): Promise<{ name: string; size: number }[]> {
  return new Promise((resolve, reject) => {
    const objects: { name: string; size: number }[] = []
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true)
    
    stream.on('data', (obj) => {
      objects.push({ name: obj.name!, size: obj.size! })
    })
    
    stream.on('end', () => resolve(objects))
    stream.on('error', reject)
  })
} 