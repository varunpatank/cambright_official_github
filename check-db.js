// Check actual database structure
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function test() {
  try {
    const asset = await db.assets.findFirst();
    if (asset) {
      console.log('Actual Asset fields:', Object.keys(asset));
    } else {
      console.log('No assets found, checking schema');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

test();
