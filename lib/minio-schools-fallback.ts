import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { School, SchoolsIndex, SchoolMetadata } from './minio-school-types'

const DATA_DIR = join(process.cwd(), 'data', 'schools')
const INDEX_FILE = join(DATA_DIR, 'index.json')
const METADATA_FILE = join(DATA_DIR, 'metadata.json')
const SCHOOLS_DIR = join(DATA_DIR, 'schools')

// Initialize the schools directory structure
export async function initializeSchoolsBucket(): Promise<boolean> {
  try {
    // Create directories if they don't exist
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!existsSync(SCHOOLS_DIR)) {
      mkdirSync(SCHOOLS_DIR, { recursive: true })
    }

    // Create initial index if it doesn't exist
    if (!existsSync(INDEX_FILE)) {
      const initialIndex: SchoolsIndex = {
        schools: [],
        lastUpdated: new Date().toISOString(),
        totalCount: 0
      }
      writeFileSync(INDEX_FILE, JSON.stringify(initialIndex, null, 2))
    }

    // Create initial metadata if it doesn't exist
    if (!existsSync(METADATA_FILE)) {
      const initialMetadata: SchoolMetadata = {
        totalSchools: 0,
        activeSchools: 0,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
      writeFileSync(METADATA_FILE, JSON.stringify(initialMetadata, null, 2))
    }

    return true
  } catch (error) {
    console.error('Error initializing schools directory:', error)
    return false
  }
}

// Helper function to read JSON file
function readJSONFile<T>(filePath: string): T | null {
  try {
    if (!existsSync(filePath)) {
      return null
    }
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error)
    return null
  }
}

// Helper function to write JSON file
function writeJSONFile(filePath: string, data: any): void {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error)
    throw error
  }
}

// Get all schools
export async function getAllSchools(): Promise<School[]> {
  const index = readJSONFile<SchoolsIndex>(INDEX_FILE)
  return index?.schools || []
}

// Get school by ID
export async function getSchoolById(id: string): Promise<School | null> {
  const schoolFile = join(SCHOOLS_DIR, `${id}.json`)
  return readJSONFile<School>(schoolFile)
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
  const schoolFile = join(SCHOOLS_DIR, `${id}.json`)
  writeJSONFile(schoolFile, newSchool)

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
  const schoolFile = join(SCHOOLS_DIR, `${id}.json`)
  writeJSONFile(schoolFile, updatedSchool)

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
    const schoolFile = join(SCHOOLS_DIR, `${id}.json`)
    if (existsSync(schoolFile)) {
      require('fs').unlinkSync(schoolFile)
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
  const index = readJSONFile<SchoolsIndex>(INDEX_FILE)
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

  writeJSONFile(INDEX_FILE, updatedIndex)

  // Update metadata
  const metadata: SchoolMetadata = {
    totalSchools: schools.length,
    activeSchools: schools.filter(s => s.isActive).length,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  }

  writeJSONFile(METADATA_FILE, metadata)
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
  return readJSONFile<SchoolMetadata>(METADATA_FILE)
}

// Placeholder functions for compatibility
export async function uploadSchoolImage(schoolId: string, imageFile: Buffer, fileName: string): Promise<string> {
  // For now, just return the provided imageUrl from the school data
  return `local://schools/${schoolId}/${fileName}`
}

export async function getSchoolImageUrl(schoolId: string, fileName: string): Promise<string | null> {
  // For now, return null - images will be handled via imageUrl field
  return null
} 