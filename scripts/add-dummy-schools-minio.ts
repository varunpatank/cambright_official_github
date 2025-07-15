import { 
  createSchool, 
  initializeSchoolsBucket, 
  getAllSchools 
} from '../lib/minio-schools'

const dummySchools = [
  {
    name: 'Cambridge International School',
    description: 'A prestigious international school offering world-class education with a focus on academic excellence and character development. Our curriculum combines the best of British and international educational practices.',
    location: 'London, United Kingdom',
    website: 'https://cambridge-international.edu',
    email: 'admissions@cambridge-international.edu',
    phone: '+44 20 7123 4567',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 1250,
    activeMembers: 45,
    chapterSuperAdmin: null, // Will be set by super admin
    chapterAdmins: [] // Will be managed by chapter super admin
  },
  {
    name: 'Singapore International Academy',
    description: 'Leading international school in Asia providing innovative education with state-of-the-art facilities. We prepare students for global citizenship through our comprehensive curriculum.',
    location: 'Singapore',
    website: 'https://singapore-international.edu.sg',
    email: 'info@singapore-international.edu.sg',
    phone: '+65 6234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 890,
    activeMembers: 32,
    chapterSuperAdmin: null,
    chapterAdmins: []
  },
  {
    name: 'Dubai International School',
    description: 'Premier educational institution in the Middle East offering multicultural learning environment with excellent academic standards and modern facilities.',
    location: 'Dubai, United Arab Emirates',
    website: 'https://dubai-international.edu.ae',
    email: 'admissions@dubai-international.edu.ae',
    phone: '+971 4 234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 1100,
    activeMembers: 38,
    chapterSuperAdmin: null,
    chapterAdmins: []
  },
  {
    name: 'Toronto International Academy',
    description: 'Canadian international school providing world-class education with emphasis on innovation, creativity, and global citizenship.',
    location: 'Toronto, Canada',
    website: 'https://toronto-international.edu.ca',
    email: 'info@toronto-international.edu.ca',
    phone: '+1 416 234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 750,
    activeMembers: 28,
    chapterSuperAdmin: null,
    chapterAdmins: []
  },
  {
    name: 'Sydney International College',
    description: 'Australian international school known for academic excellence and holistic education approach with strong focus on student development.',
    location: 'Sydney, Australia',
    website: 'https://sydney-international.edu.au',
    email: 'admissions@sydney-international.edu.au',
    phone: '+61 2 9234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 950,
    activeMembers: 35,
    chapterSuperAdmin: null,
    chapterAdmins: []
  },
  {
    name: 'Mumbai International School',
    description: 'Leading international school in India providing quality education with modern infrastructure and experienced faculty.',
    location: 'Mumbai, India',
    website: 'https://mumbai-international.edu.in',
    email: 'info@mumbai-international.edu.in',
    phone: '+91 22 2345 6789',
    imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 1350,
    activeMembers: 52,
    chapterSuperAdmin: null,
    chapterAdmins: []
  },
  {
    name: 'Berlin International Academy',
    description: 'German international school offering innovative education with strong emphasis on technology and global perspectives.',
    location: 'Berlin, Germany',
    website: 'https://berlin-international.edu.de',
    email: 'admissions@berlin-international.edu.de',
    phone: '+49 30 234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 820,
    activeMembers: 29,
    chapterSuperAdmin: null,
    chapterAdmins: []
  },
  {
    name: 'Tokyo International School',
    description: 'Japanese international school providing excellent education with blend of Eastern and Western teaching methodologies.',
    location: 'Tokyo, Japan',
    website: 'https://tokyo-international.edu.jp',
    email: 'info@tokyo-international.edu.jp',
    phone: '+81 3 2345 6789',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 1050,
    activeMembers: 41,
    chapterSuperAdmin: null,
    chapterAdmins: []
  },
  {
    name: 'São Paulo International College',
    description: 'Brazilian international school known for multicultural environment and comprehensive education programs.',
    location: 'São Paulo, Brazil',
    website: 'https://saopaulo-international.edu.br',
    email: 'admissions@saopaulo-international.edu.br',
    phone: '+55 11 2345 6789',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 680,
    activeMembers: 24,
    chapterSuperAdmin: null,
    chapterAdmins: []
  },
  {
    name: 'Cape Town International Academy',
    description: 'South African international school providing quality education with focus on diversity and academic excellence.',
    location: 'Cape Town, South Africa',
    website: 'https://capetown-international.edu.za',
    email: 'info@capetown-international.edu.za',
    phone: '+27 21 234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system',
    volunteerHours: 720,
    activeMembers: 26,
    chapterSuperAdmin: null,
    chapterAdmins: []
  }
]

// Helper function to generate random volunteer hours and member counts
function generateRandomData() {
  return {
    volunteerHours: Math.floor(Math.random() * 1000) + 500, // 500-1500 hours
    activeMembers: Math.floor(Math.random() * 40) + 20, // 20-60 members
  }
}

async function addDummySchools() {
  try {
    console.log('🚀 Starting to add dummy schools to MinIO...')
    
    // Initialize the bucket first
    await initializeSchoolsBucket()
    console.log('✅ Schools bucket initialized')

    // Get existing schools to avoid duplicates
    const existingSchools = await getAllSchools()
    const existingNames = existingSchools.map(school => school.name)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const schoolData of dummySchools) {
      try {
        // Check if school already exists
        if (existingNames.includes(schoolData.name)) {
          console.log(`⚠️  School "${schoolData.name}" already exists, skipping...`)
          skipCount++
          continue
        }

        // Add some randomization to the data
        const randomData = generateRandomData()
        const schoolWithRandomData = {
          ...schoolData,
          volunteerHours: randomData.volunteerHours,
          activeMembers: randomData.activeMembers,
        }

        // Create the school
        const result = await createSchool(schoolWithRandomData)
        
        if (result) {
          console.log(`✅ Successfully added school: ${schoolData.name}`)
          console.log(`   📍 Location: ${schoolData.location}`)
          console.log(`   👥 Members: ${randomData.activeMembers}`)
          console.log(`   ⏰ Volunteer Hours: ${randomData.volunteerHours}`)
          successCount++
        } else {
          console.log(`❌ Failed to add school: ${schoolData.name}`)
          errorCount++
        }
      } catch (error) {
        console.log(`❌ Error adding school "${schoolData.name}":`, error)
        errorCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Successfully added: ${successCount} schools`)
    console.log(`⚠️  Skipped (already exists): ${skipCount} schools`)
    console.log(`❌ Failed: ${errorCount} schools`)
    console.log(`📝 Total processed: ${successCount + skipCount + errorCount} schools`)

    if (successCount > 0) {
      console.log('\n🎉 Dummy schools have been successfully added to MinIO!')
      console.log('You can now view them in the admin panel at /admin/schools')
    }

  } catch (error) {
    console.error('💥 Fatal error during school creation:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  addDummySchools()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}

export { addDummySchools } 