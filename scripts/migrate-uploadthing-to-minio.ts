import { db } from '../lib/db'
import { uploadFile, BUCKET_NAME } from '../lib/minio'
import { nanoid } from 'nanoid'

interface UploadThingFile {
  url: string
  tableName: string
  columnName: string
  recordId: string
}

// Extract file info from UploadThing URL
function parseUploadThingUrl(url: string) {
  // UploadThing URLs typically look like: https://utfs.io/f/abc123.jpg
  const match = url.match(/https:\/\/utfs\.io\/f\/(.+)/)
  if (!match) throw new Error(`Invalid UploadThing URL: ${url}`)
  
  const filename = match[1]
  const extension = filename.split('.').pop() || ''
  return { filename, extension }
}

// Get MIME type from extension
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg', 
    'png': 'image/png',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/avi',
    'mov': 'video/mov',
    'pdf': 'application/pdf',
    'txt': 'text/plain'
  }
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
}

// Determine folder path based on context
function getFolderPath(tableName: string, columnName: string): string {
  if (tableName === 'Course' && columnName === 'imageUrl') return 'uploads/courses/images/'
  if (tableName === 'Room' && columnName === 'imageUrl') return 'uploads/rooms/images/'
  if (tableName === 'Attachment' && columnName === 'url') return 'uploads/courses/attachments/'
  if (tableName === 'NoteAttachment' && columnName === 'url') return 'uploads/notes/attachments/'
  if (tableName === 'Chapter' && columnName === 'videoUrl') return 'uploads/chapters/videos/'
  if (tableName === 'SchoolPost' && columnName === 'imageUrl') return 'uploads/schools/posts/'
  if (tableName === 'Message' && columnName.includes('fileUrl')) return 'uploads/messages/'
  return 'uploads/migrated/'
}

// Download file from UploadThing
async function downloadFile(url: string): Promise<Buffer> {
  console.log(`Downloading: ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

// Find all UploadThing URLs in the database
async function findUploadThingUrls(): Promise<UploadThingFile[]> {
  const files: UploadThingFile[] = []

  console.log('🔍 Scanning database for UploadThing URLs...')

  try {
    // Course images
    const courses = await db.course.findMany({
      where: { imageUrl: { contains: 'utfs.io' } },
      select: { id: true, imageUrl: true }
    })
    courses.forEach(course => {
      if (course.imageUrl) {
        files.push({
          url: course.imageUrl,
          tableName: 'Course',
          columnName: 'imageUrl',
          recordId: course.id
        })
      }
    })

    // Room images  
    const rooms = await db.room.findMany({
      where: { imageUrl: { contains: 'utfs.io' } },
      select: { id: true, imageUrl: true }
    })
    rooms.forEach(room => {
      if (room.imageUrl) {
        files.push({
          url: room.imageUrl,
          tableName: 'Room',
          columnName: 'imageUrl',
          recordId: room.id
        })
      }
    })

    // Course attachments
    const attachments = await db.attachment.findMany({
      where: { url: { contains: 'utfs.io' } },
      select: { id: true, url: true }
    })
    attachments.forEach(attachment => {
      files.push({
        url: attachment.url,
        tableName: 'Attachment',
        columnName: 'url',
        recordId: attachment.id
      })
    })

    // Note attachments
    const noteAttachments = await db.noteAttachment.findMany({
      where: { url: { contains: 'utfs.io' } },
      select: { id: true, url: true }
    })
    noteAttachments.forEach(attachment => {
      files.push({
        url: attachment.url,
        tableName: 'NoteAttachment', 
        columnName: 'url',
        recordId: attachment.id
      })
    })

    // Chapter videos
    const chapters = await db.chapter.findMany({
      where: { videoUrl: { contains: 'utfs.io' } },
      select: { id: true, videoUrl: true }
    })
    chapters.forEach(chapter => {
      if (chapter.videoUrl) {
        files.push({
          url: chapter.videoUrl,
          tableName: 'Chapter',
          columnName: 'videoUrl', 
          recordId: chapter.id
        })
      }
    })

    // Note chapters  
    const noteChapters = await db.noteChapter.findMany({
      where: { videoUrl: { contains: 'utfs.io' } },
      select: { id: true, videoUrl: true }
    })
    noteChapters.forEach(chapter => {
      if (chapter.videoUrl) {
        files.push({
          url: chapter.videoUrl,
          tableName: 'NoteChapter',
          columnName: 'videoUrl',
          recordId: chapter.id
        })
      }
    })

    // School post images
    const schoolPosts = await db.schoolPost.findMany({
      where: { imageUrl: { contains: 'utfs.io' } },
      select: { id: true, imageUrl: true }
    })
    schoolPosts.forEach(post => {
      if (post.imageUrl) {
        files.push({
          url: post.imageUrl,
          tableName: 'SchoolPost',
          columnName: 'imageUrl',
          recordId: post.id
        })
      }
    })

    // Messages with file URLs (this might vary based on your message schema)
    const messages = await db.message.findMany({
      where: { 
        OR: [
          { fileUrl: { contains: 'utfs.io' } },
          { content: { contains: 'utfs.io' } }
        ]
      },
      select: { id: true, fileUrl: true, content: true }
    })
    messages.forEach(message => {
      if (message.fileUrl) {
        files.push({
          url: message.fileUrl,
          tableName: 'Message',
          columnName: 'fileUrl',
          recordId: message.id
        })
      }
      // Check content for embedded URLs
      if (message.content) {
        const urls = message.content.match(/https:\/\/utfs\.io\/f\/[^\s)]+/g)
        urls?.forEach(url => {
          files.push({
            url,
            tableName: 'Message',
            columnName: 'content',
            recordId: message.id
          })
        })
      }
    })

    console.log(`📁 Found ${files.length} UploadThing files to migrate`)
    return files

  } catch (error) {
    console.error('Error scanning database:', error)
    throw error
  }
}

// Migrate a single file
async function migrateFile(file: UploadThingFile): Promise<string> {
  try {
    const { filename, extension } = parseUploadThingUrl(file.url)
    const mimeType = getMimeType(extension)
    const folderPath = getFolderPath(file.tableName, file.columnName)
    
    // Generate new filename
    const newFilename = `${nanoid()}_migrated_${filename}`
    const objectName = `${folderPath}${newFilename}`
    
    // Download file from UploadThing
    const fileBuffer = await downloadFile(file.url)
    
    // Upload to MinIO
    const result = await uploadFile(BUCKET_NAME, objectName, fileBuffer, {
      'Content-Type': mimeType,
      'Original-Name': filename,
      'Migration-Source': 'UploadThing',
      'Migration-Timestamp': new Date().toISOString(),
      'Original-Table': file.tableName,
      'Original-Column': file.columnName,
      'Original-Record-ID': file.recordId
    })
    
    console.log(`✅ Migrated: ${filename} -> ${objectName}`)
    return result.url
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${file.url}:`, error)
    throw error
  }
}

// Update database record with new URL
async function updateDatabaseRecord(file: UploadThingFile, newUrl: string) {
  try {
    const { tableName, columnName, recordId } = file
    
    switch (tableName) {
      case 'Course':
        await db.course.update({
          where: { id: recordId },
          data: { [columnName]: newUrl }
        })
        break
        
      case 'Room':
        await db.room.update({
          where: { id: recordId },
          data: { [columnName]: newUrl }
        })
        break
        
      case 'Attachment':
        await db.attachment.update({
          where: { id: recordId },
          data: { [columnName]: newUrl }
        })
        break
        
      case 'NoteAttachment':
        await db.noteAttachment.update({
          where: { id: recordId },
          data: { [columnName]: newUrl }
        })
        break
        
      case 'Chapter':
        await db.chapter.update({
          where: { id: recordId },
          data: { [columnName]: newUrl }
        })
        break
        
      case 'NoteChapter':
        await db.noteChapter.update({
          where: { id: recordId },
          data: { [columnName]: newUrl }
        })
        break
        
      case 'SchoolPost':
        await db.schoolPost.update({
          where: { id: recordId },
          data: { [columnName]: newUrl }
        })
        break
        
      case 'Message':
        if (columnName === 'fileUrl') {
          await db.message.update({
            where: { id: recordId },
            data: { [columnName]: newUrl }
          })
        } else if (columnName === 'content') {
          // Replace URL in content
          const message = await db.message.findUnique({
            where: { id: recordId },
            select: { content: true }
          })
          if (message?.content) {
            const updatedContent = message.content.replace(file.url, newUrl)
            await db.message.update({
              where: { id: recordId },
              data: { content: updatedContent }
            })
          }
        }
        break
        
      default:
        console.warn(`Unknown table: ${tableName}`)
    }
    
    console.log(`📝 Updated ${tableName}.${columnName} for record ${recordId}`)
    
  } catch (error) {
    console.error(`Failed to update database record:`, error)
    throw error
  }
}

// Main migration function
async function migrateUploadThingToMinio() {
  console.log('🚀 Starting UploadThing to MinIO migration...')
  console.log('⚠️  This will download files from UploadThing and upload them to MinIO')
  console.log('⚠️  Make sure your MinIO instance is running and accessible')
  console.log('')

  try {
    // Find all UploadThing URLs
    const files = await findUploadThingUrls()
    
    if (files.length === 0) {
      console.log('✨ No UploadThing files found. Migration complete!')
      return
    }

    console.log(`\n📋 Migration plan:`)
    console.log(`   • Files to migrate: ${files.length}`)
    console.log(`   • Estimated time: ${Math.ceil(files.length * 2)} seconds`)
    console.log('')

    let migratedCount = 0
    let failedCount = 0
    const failedFiles: string[] = []

    // Migrate each file
    for (const file of files) {
      try {
        console.log(`\n[${migratedCount + failedCount + 1}/${files.length}] Processing: ${file.url}`)
        
        // Migrate file to MinIO
        const newUrl = await migrateFile(file)
        
        // Update database record
        await updateDatabaseRecord(file, newUrl)
        
        migratedCount++
        
        // Add small delay to avoid overwhelming the services
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`❌ Failed to migrate file: ${file.url}`)
        console.error(error)
        failedCount++
        failedFiles.push(file.url)
      }
    }

    // Migration summary
    console.log('\n🎉 Migration completed!')
    console.log(`✅ Successfully migrated: ${migratedCount} files`)
    if (failedCount > 0) {
      console.log(`❌ Failed migrations: ${failedCount} files`)
      console.log('\nFailed files:')
      failedFiles.forEach(url => console.log(`   • ${url}`))
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateUploadThingToMinio()
    .then(() => {
      console.log('\n✨ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateUploadThingToMinio } 