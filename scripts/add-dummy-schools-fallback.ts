import { 
  createSchool, 
  initializeSchoolsBucket, 
  getAllSchools 
} from '../lib/minio-schools-fallback'

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
    createdBy: 'system'
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
    createdBy: 'system'
  },
  {
    name: 'American International School Dubai',
    description: 'Premier American curriculum school in the Middle East. We offer a comprehensive education that prepares students for success in universities worldwide.',
    location: 'Dubai, United Arab Emirates',
    website: 'https://ais-dubai.com',
    email: 'admissions@ais-dubai.com',
    phone: '+971 4 345 6789',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'International School of Paris',
    description: 'Bilingual international school in the heart of Paris offering French and international curricula. Our students develop cultural awareness and academic excellence.',
    location: 'Paris, France',
    website: 'https://international-paris.fr',
    email: 'contact@international-paris.fr',
    phone: '+33 1 42 34 56 78',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Tokyo International School',
    description: 'Modern international school in Japan combining Eastern and Western educational philosophies. We foster creativity, critical thinking, and global mindedness.',
    location: 'Tokyo, Japan',
    website: 'https://tokyo-international.ac.jp',
    email: 'info@tokyo-international.ac.jp',
    phone: '+81 3 1234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Sydney International High School',
    description: 'Leading international school in Australia with a strong focus on STEM education and environmental sustainability. We prepare students for the challenges of tomorrow.',
    location: 'Sydney, Australia',
    website: 'https://sydney-international.edu.au',
    email: 'admissions@sydney-international.edu.au',
    phone: '+61 2 8765 4321',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Canadian International School Toronto',
    description: 'Diverse international school offering Canadian curriculum with global perspectives. We emphasize inclusivity, innovation, and academic achievement.',
    location: 'Toronto, Canada',
    website: 'https://cis-toronto.ca',
    email: 'info@cis-toronto.ca',
    phone: '+1 416 123 4567',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Berlin International Academy',
    description: 'Progressive international school in Germany focusing on multilingual education and cultural exchange. Our innovative approach prepares students for global careers.',
    location: 'Berlin, Germany',
    website: 'https://berlin-international.de',
    email: 'contact@berlin-international.de',
    phone: '+49 30 123 456 78',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'Mumbai International School',
    description: 'Leading international school in India offering world-class education with Indian values. We blend traditional wisdom with modern pedagogical approaches.',
    location: 'Mumbai, India',
    website: 'https://mumbai-international.edu.in',
    email: 'admissions@mumbai-international.edu.in',
    phone: '+91 22 2345 6789',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system'
  },
  {
    name: 'São Paulo International College',
    description: 'Premier international school in Brazil offering bilingual education in Portuguese and English. We prepare students for global citizenship and academic excellence.',
    location: 'São Paulo, Brazil',
    website: 'https://saopaulo-international.edu.br',
    email: 'info@saopaulo-international.edu.br',
    phone: '+55 11 3456 7890',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
    isActive: true,
    createdBy: 'system'
  }
]

async function addDummySchools() {
  console.log('🚀 Starting to add dummy schools to local JSON files...')
  
  try {
    // Initialize schools directory
    console.log('📦 Initializing schools directory...')
    const initialized = await initializeSchoolsBucket()
    if (!initialized) {
      console.error('❌ Failed to initialize schools directory')
      return
    }
    console.log('✅ Schools directory initialized successfully')

    // Check if schools already exist
    const existingSchools = await getAllSchools()
    if (existingSchools.length > 0) {
      console.log(`⚠️  Found ${existingSchools.length} existing schools. Skipping dummy data creation.`)
      return
    }

    let successCount = 0
    let errorCount = 0

    // Add each dummy school
    for (const schoolData of dummySchools) {
      try {
        console.log(`📝 Adding school: ${schoolData.name}`)
        const school = await createSchool(schoolData)
        console.log(`✅ Successfully created school: ${school.name} (ID: ${school.id})`)
        successCount++
      } catch (error) {
        console.error(`❌ Error creating school ${schoolData.name}:`, error)
        errorCount++
      }
    }

    console.log('\n🎉 Dummy schools creation completed!')
    console.log(`✅ Success: ${successCount} schools`)
    console.log(`❌ Errors: ${errorCount} schools`)

    // Show final summary
    const finalSchools = await getAllSchools()
    console.log(`📊 Total schools in local storage: ${finalSchools.length}`)
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
addDummySchools()
  .then(() => {
    console.log('🏁 Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }) 