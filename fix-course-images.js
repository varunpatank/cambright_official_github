const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient()

async function fixCourseImages() {
  try {
    console.log('🔧 Fixing course image URLs...')
    
    // First, let's see the current state
    const coursesWithMinIO = await db.course.findMany({
      where: {
        imageUrl: {
          contains: 'minio.varram.me'
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        imageAssetKey: true
      }
    })
    
    console.log(`Found ${coursesWithMinIO.length} courses with MinIO URLs`)
    
    let fixedCount = 0
    
    for (const course of coursesWithMinIO) {
      console.log(`\n📚 Course: ${course.title}`)
      console.log(`   Current imageUrl: ${course.imageUrl}`)
      console.log(`   Current imageAssetKey: ${course.imageAssetKey || 'NULL'}`)
      
      if (course.imageAssetKey) {
        // Course has an asset key, clear the direct URL so it uses the asset manager
        await db.course.update({
          where: { id: course.id },
          data: { imageUrl: null }
        })
        console.log(`   ✅ Cleared imageUrl - will now use imageAssetKey: ${course.imageAssetKey}`)
        fixedCount++
      } else {
        // Course doesn't have an asset key - need to create one from the MinIO URL
        console.log(`   ⚠️  No imageAssetKey found - this course needs proper asset management`)
        
        // For now, we'll clear the imageUrl since it doesn't work anyway
        await db.course.update({
          where: { id: course.id },
          data: { imageUrl: null }
        })
        console.log(`   🧹 Cleared non-working imageUrl`)
        fixedCount++
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} courses`)
    console.log('✅ Courses with asset keys will now load images properly')
    console.log('⚠️  Courses without asset keys will show placeholder until new images are uploaded')
    
  } catch (error) {
    console.error('❌ Error fixing course images:', error)
  } finally {
    await db.$disconnect()
  }
}

fixCourseImages()
