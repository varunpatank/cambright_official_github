// Test SchoolService directly
const { PrismaClient } = require('@prisma/client');

// Import using require with proper path for CommonJS
const path = require('path');
const schoolServicePath = path.join(__dirname, 'lib', 'school-service.ts');

async function testDatabase() {
  console.log('Testing database connection...');
  
  const db = new PrismaClient();
  
  try {
    // Test basic database connection
    console.log('Testing database connection...');
    const schoolCount = await db.school.count();
    console.log('✅ Database connected');
    console.log('Schools in database:', schoolCount);
    
    // Test raw school query
    console.log('\nTesting raw school query...');
    const schools = await db.school.findMany({
      take: 5,
      include: {
        Assets_School_imageAssetIdToAssets: true,
        Assets_School_bannerAssetIdToAssets: true
      }
    });
    
    console.log('✅ Raw query succeeded');
    console.log('Schools found:', schools.length);
    
    if (schools.length > 0) {
      console.log('First school sample:', {
        id: schools[0].id,
        name: schools[0].name,
        hasImageAsset: !!schools[0].Assets_School_imageAssetIdToAssets,
        hasBannerAsset: !!schools[0].Assets_School_bannerAssetIdToAssets
      });
    }
    
    // Test create school
    console.log('\nTesting school creation...');
    const testSchool = await db.school.create({
      data: {
        name: 'Test School ' + Date.now(),
        description: 'Test Description',
        location: 'Test Location',
        createdBy: 'test-user-id',
        isActive: true
      },
      include: {
        Assets_School_imageAssetIdToAssets: true,
        Assets_School_bannerAssetIdToAssets: true
      }
    });
    
    console.log('✅ School creation succeeded');
    console.log('Created school:', {
      id: testSchool.id,
      name: testSchool.name
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
  } finally {
    await db.$disconnect();
  }
}

testDatabase();
