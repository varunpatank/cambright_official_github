import { db } from '../lib/db'

async function testDatabaseConnection() {
  try {
    // Test if Assets table exists and is accessible
    console.log('Testing Assets table...')
    const assetsCount = await db.assets.count()
    console.log(`Assets table found with ${assetsCount} records`)
    
    // Test if School table exists and is accessible
    console.log('Testing School table...')
    const schoolsCount = await db.school.count()
    console.log(`School table found with ${schoolsCount} records`)
    
    // Test if SchoolPost table exists and is accessible
    console.log('Testing SchoolPost table...')
    const postsCount = await db.schoolPost.count()
    console.log(`SchoolPost table found with ${postsCount} records`)
    
    console.log('✅ All tables accessible!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testDatabaseConnection()
