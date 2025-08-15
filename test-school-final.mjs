// Test the actual SchoolService with correct types
import { SchoolService } from './lib/school-service.js';

async function testSchoolService() {
  try {
    console.log('Testing SchoolService.getSchools...');
    
    const result = await SchoolService.getSchools({ page: 1, limit: 10 });
    console.log('✅ getSchools succeeded');
    console.log('Schools returned:', result.schools.length);
    console.log('Total schools:', result.pagination.total);
    
    if (result.schools.length > 0) {
      const firstSchool = result.schools[0];
      console.log('First school:', {
        id: firstSchool.id,
        name: firstSchool.name,
        hasImageAsset: !!firstSchool.imageAsset,
        hasBannerAsset: !!firstSchool.bannerAsset
      });
    }
    
    console.log('\nTesting SchoolService.createSchool...');
    const newSchool = await SchoolService.createSchool({
      name: 'Test School ' + Date.now(),
      description: 'A test school for verification',
      location: 'Test Location',
      createdBy: 'test-user-123'
    });
    
    console.log('✅ createSchool succeeded');
    console.log('Created school:', {
      id: newSchool.id,
      name: newSchool.name,
      hasImageAsset: !!newSchool.imageAsset,
      hasBannerAsset: !!newSchool.bannerAsset
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  }
}

testSchoolService();
