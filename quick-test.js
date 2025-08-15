// Quick test to verify database structure
const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
  const db = new PrismaClient();
  
  try {
    // Check if we can query assets
    const asset = await db.assets.findFirst();
    if (asset) {
      console.log('Asset fields:', Object.keys(asset));
    } else {
      console.log('No assets found');
    }
    
    // Check school structure  
    const school = await db.school.findFirst();
    if (school) {
      console.log('School fields:', Object.keys(school));
    } else {
      console.log('No schools found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

checkSchema();
