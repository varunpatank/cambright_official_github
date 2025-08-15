// Quick test to see what fields are available
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function test() {
  try {
    // Try to get the school structure
    const school = await db.school.findFirst({
      include: {
        // Let's see what relations are available
      }
    });
    
    console.log('School fields:', Object.keys(school || {}));
    
    // Try different relation names
    const schoolWithAssets = await db.school.findFirst({
      include: {
        Assets_School_imageAssetIdToAssets: true,
        Assets_School_bannerAssetIdToAssets: true,
      }
    });
    
    console.log('With assets:', schoolWithAssets ? 'Success' : 'Failed');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

test();
