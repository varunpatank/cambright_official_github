const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient()

async function fixLocalhostURLs() {
  try {
    console.log('🔍 Finding and fixing localhost URLs...')
    
    // Find all courses with localhost URLs
    const coursesWithLocalhost = await db.course.findMany({
      where: {
        imageUrl: {
          contains: 'localhost:9000'
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true
      }
    })
    
    console.log(`Found ${coursesWithLocalhost.length} courses with localhost URLs`)
    
    // Fix each course
    for (const course of coursesWithLocalhost) {
      const oldUrl = course.imageUrl
      // Replace localhost:9000 with the production MinIO server
      const newUrl = oldUrl.replace('http://localhost:9000', 'https://minio.varram.me')
      
      console.log(`\n📚 Fixing course: ${course.title}`)
      console.log(`   Old URL: ${oldUrl}`)
      console.log(`   New URL: ${newUrl}`)
      
      await db.course.update({
        where: { id: course.id },
        data: { imageUrl: newUrl }
      })
      
      console.log('   ✅ Updated successfully')
    }
    
    // Also check chapters for video URLs
    const chaptersWithLocalhost = await db.chapter.findMany({
      where: {
        videoUrl: {
          contains: 'localhost:9000'
        }
      },
      select: {
        id: true,
        title: true,
        videoUrl: true
      }
    })
    
    console.log(`\nFound ${chaptersWithLocalhost.length} chapters with localhost URLs`)
    
    for (const chapter of chaptersWithLocalhost) {
      const oldUrl = chapter.videoUrl
      const newUrl = oldUrl.replace('http://localhost:9000', 'https://minio.varram.me')
      
      console.log(`\n📖 Fixing chapter: ${chapter.title}`)
      console.log(`   Old URL: ${oldUrl}`)
      console.log(`   New URL: ${newUrl}`)
      
      await db.chapter.update({
        where: { id: chapter.id },
        data: { videoUrl: newUrl }
      })
      
      console.log('   ✅ Updated successfully')
    }
    
    // Check other tables for localhost URLs
    const tablesAndFields = [
      { table: 'attachment', field: 'url' },
      { table: 'noteAttachment', field: 'url' },
      { table: 'school', field: 'imageUrl' },
      { table: 'room', field: 'imageUrl' }
    ]
    
    for (const { table, field } of tablesAndFields) {
      try {
        const records = await db[table].findMany({
          where: {
            [field]: {
              contains: 'localhost:9000'
            }
          }
        })
        
        if (records.length > 0) {
          console.log(`\nFound ${records.length} ${table} records with localhost URLs`)
          
          for (const record of records) {
            const oldUrl = record[field]
            const newUrl = oldUrl.replace('http://localhost:9000', 'https://minio.varram.me')
            
            await db[table].update({
              where: { id: record.id },
              data: { [field]: newUrl }
            })
            
            console.log(`   ✅ Fixed ${table} ${record.id}`)
          }
        }
      } catch (error) {
        console.log(`⚠️  Could not check ${table} table: ${error.message}`)
      }
    }
    
    console.log('\n🎉 All localhost URLs have been fixed!')
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error)
  } finally {
    await db.$disconnect()
  }
}

fixLocalhostURLs()
