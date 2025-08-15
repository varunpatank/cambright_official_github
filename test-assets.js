// Test assets structure
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function test() {
  try {
    const asset = await db.assets.findFirst();
    console.log('Asset fields:', asset ? Object.keys(asset) : 'No assets found');
    
    // Check school with assets
    const school = await db.school.findFirst({
      include: {
        Assets_School_imageAssetIdToAssets: true,
        Assets_School_bannerAssetIdToAssets: true,
      }
    });
    
    if (school?.Assets_School_imageAssetIdToAssets) {
      console.log('Image asset fields:', Object.keys(school.Assets_School_imageAssetIdToAssets));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

test();
