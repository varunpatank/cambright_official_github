// Static School Data - Edit this file directly to add/modify schools
// No database required - all data is hardcoded here

export interface SchoolEvent {
  id: string
  title: string
  content: string
  postType: 'ANNOUNCEMENT' | 'EVENT'
  date: string
  imageUrl?: string
}

export interface SchoolAdmin {
  id: string
  name: string
  role: 'CHAPTER_ADMIN' | 'CHAPTER_SUPER_ADMIN'
  email: string
  imageUrl?: string
}

export interface StaticSchool {
  id: string
  name: string
  description: string
  location: string
  website?: string
  email?: string
  phone?: string
  
  // Images - use paths relative to /public folder or full URLs
  imageUrl: string      // Preview/card image
  bannerUrl: string     // Large banner image for detail page
  
  // Stats
  volunteerHours: number
  activeMembers: number
  
  isActive: boolean
  
  // Administrators
  admins: SchoolAdmin[]
  
  // Events & Announcements
  events: SchoolEvent[]
}

// ============================================
// ADD YOUR SCHOOLS HERE
// ============================================

export const STATIC_SCHOOLS: StaticSchool[] = [
  {
    id: 'singapore-international',
    name: 'Singapore International Academy',
    description: 'Leading international school in Asia providing innovative education with state-of-the-art facilities. We prepare students for global citizenship through our comprehensive curriculum.',
    location: 'Singapore',
    website: 'https://singapore-international.edu.sg',
    email: 'info@singapore-international.edu.sg',
    phone: '+65 6234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=400&fit=crop',
    volunteerHours: 2500,
    activeMembers: 120,
    isActive: true,
    admins: [
      {
        id: 'admin-1',
        name: 'Dr. Sarah Chen',
        role: 'CHAPTER_SUPER_ADMIN',
        email: 'sarah.chen@singapore-international.edu.sg',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      {
        id: 'admin-2',
        name: 'Michael Tan',
        role: 'CHAPTER_ADMIN',
        email: 'michael.tan@singapore-international.edu.sg',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      }
    ],
    events: [
      {
        id: 'event-1',
        title: 'Annual Science Fair 2026',
        content: 'Join us for our annual science fair showcasing student innovations and research projects. Open to all students and parents.',
        postType: 'EVENT',
        date: '2026-03-15',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&h=300&fit=crop'
      },
      {
        id: 'event-2',
        title: 'New Volunteer Program Launch',
        content: 'We are excited to announce our new community volunteer program starting next month. Sign up now!',
        postType: 'ANNOUNCEMENT',
        date: '2026-02-01'
      }
    ]
  },
  {
    id: 'dubai-international',
    name: 'American International School Dubai',
    description: 'Premier American curriculum school in the Middle East. We offer a comprehensive education that prepares students for success in universities worldwide.',
    location: 'Dubai, United Arab Emirates',
    website: 'https://ais-dubai.com',
    email: 'admissions@ais-dubai.com',
    phone: '+971 4 345 6789',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop',
    volunteerHours: 3200,
    activeMembers: 150,
    isActive: true,
    admins: [
      {
        id: 'admin-3',
        name: 'Ahmed Al-Rashid',
        role: 'CHAPTER_SUPER_ADMIN',
        email: 'ahmed@ais-dubai.com',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      }
    ],
    events: [
      {
        id: 'event-3',
        title: 'International Day Celebration',
        content: 'Celebrate diversity at our International Day event featuring cultural performances, food, and activities from around the world.',
        postType: 'EVENT',
        date: '2026-04-20',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop'
      }
    ]
  },
  {
    id: 'paris-international',
    name: 'International School of Paris',
    description: 'Bilingual international school in the heart of Paris offering French and international curricula. Our students develop cultural awareness and academic excellence.',
    location: 'Paris, France',
    website: 'https://international-paris.fr',
    email: 'contact@international-paris.fr',
    phone: '+33 1 42 34 56 78',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&h=400&fit=crop',
    volunteerHours: 1800,
    activeMembers: 85,
    isActive: true,
    admins: [
      {
        id: 'admin-4',
        name: 'Marie Dubois',
        role: 'CHAPTER_SUPER_ADMIN',
        email: 'marie.dubois@international-paris.fr',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      }
    ],
    events: [
      {
        id: 'event-4',
        title: 'French Language Week',
        content: 'A week dedicated to celebrating the French language through poetry, theater, and literature.',
        postType: 'EVENT',
        date: '2026-03-20'
      }
    ]
  },
  {
    id: 'tokyo-international',
    name: 'Tokyo International School',
    description: 'Modern international school in Japan combining Eastern and Western educational philosophies. We foster creativity, critical thinking, and global mindedness.',
    location: 'Tokyo, Japan',
    website: 'https://tokyo-international.ac.jp',
    email: 'info@tokyo-international.ac.jp',
    phone: '+81 3 1234 5678',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=400&fit=crop',
    volunteerHours: 2100,
    activeMembers: 95,
    isActive: true,
    admins: [
      {
        id: 'admin-5',
        name: 'Yuki Tanaka',
        role: 'CHAPTER_SUPER_ADMIN',
        email: 'yuki.tanaka@tokyo-international.ac.jp',
        imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
      }
    ],
    events: [
      {
        id: 'event-5',
        title: 'Cherry Blossom Cultural Festival',
        content: 'Join us for our annual spring festival celebrating Japanese culture and traditions.',
        postType: 'EVENT',
        date: '2026-04-05',
        imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=500&h=300&fit=crop'
      }
    ]
  },
  {
    id: 'sydney-international',
    name: 'Sydney International High School',
    description: 'Leading international school in Australia with a strong focus on STEM education and environmental sustainability. We prepare students for the challenges of tomorrow.',
    location: 'Sydney, Australia',
    website: 'https://sydney-international.edu.au',
    email: 'admissions@sydney-international.edu.au',
    phone: '+61 2 8765 4321',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=400&fit=crop',
    volunteerHours: 2800,
    activeMembers: 110,
    isActive: true,
    admins: [
      {
        id: 'admin-6',
        name: 'James Wilson',
        role: 'CHAPTER_SUPER_ADMIN',
        email: 'james.wilson@sydney-international.edu.au',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
      }
    ],
    events: [
      {
        id: 'event-6',
        title: 'Environmental Awareness Week',
        content: 'Our annual sustainability event focusing on climate action and environmental conservation.',
        postType: 'EVENT',
        date: '2026-05-10'
      }
    ]
  },
  {
    id: 'toronto-international',
    name: 'Canadian International School Toronto',
    description: 'Diverse international school offering Canadian curriculum with global perspectives. We emphasize inclusivity, innovation, and academic achievement.',
    location: 'Toronto, Canada',
    website: 'https://cis-toronto.ca',
    email: 'info@cis-toronto.ca',
    phone: '+1 416 123 4567',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200&h=400&fit=crop',
    volunteerHours: 1950,
    activeMembers: 88,
    isActive: true,
    admins: [
      {
        id: 'admin-7',
        name: 'Emily Johnson',
        role: 'CHAPTER_SUPER_ADMIN',
        email: 'emily.johnson@cis-toronto.ca',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
      }
    ],
    events: []
  },
  {
    id: 'berlin-international',
    name: 'Berlin International Academy',
    description: 'Progressive international school in Germany focusing on multilingual education and cultural exchange. Our innovative approach prepares students for global careers.',
    location: 'Berlin, Germany',
    website: 'https://berlin-international.de',
    email: 'contact@berlin-international.de',
    phone: '+49 30 123 456 78',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&h=400&fit=crop',
    volunteerHours: 1600,
    activeMembers: 72,
    isActive: true,
    admins: [],
    events: [
      {
        id: 'event-7',
        title: 'European Languages Festival',
        content: 'Celebrating linguistic diversity with language workshops and cultural exchanges.',
        postType: 'EVENT',
        date: '2026-06-15'
      }
    ]
  },
  {
    id: 'mumbai-international',
    name: 'Mumbai International School',
    description: 'Leading international school in India offering world-class education with Indian values. We blend traditional wisdom with modern pedagogical approaches.',
    location: 'Mumbai, India',
    website: 'https://mumbai-international.edu.in',
    email: 'admissions@mumbai-international.edu.in',
    phone: '+91 22 2345 6789',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=400&fit=crop',
    volunteerHours: 3500,
    activeMembers: 180,
    isActive: true,
    admins: [
      {
        id: 'admin-8',
        name: 'Dr. Priya Sharma',
        role: 'CHAPTER_SUPER_ADMIN',
        email: 'priya.sharma@mumbai-international.edu.in',
        imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop'
      }
    ],
    events: [
      {
        id: 'event-8',
        title: 'Diwali Celebration',
        content: 'Join us for our grand Diwali celebration with traditional performances, food, and festivities.',
        postType: 'EVENT',
        date: '2026-10-25',
        imageUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=500&h=300&fit=crop'
      }
    ]
  },
  {
    id: 'sao-paulo-international',
    name: 'São Paulo International College',
    description: 'Premier international school in Brazil offering bilingual education in Portuguese and English. We prepare students for global citizenship and academic excellence.',
    location: 'São Paulo, Brazil',
    website: 'https://saopaulo-international.edu.br',
    email: 'info@saopaulo-international.edu.br',
    phone: '+55 11 3456 7890',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=400&fit=crop',
    volunteerHours: 2200,
    activeMembers: 95,
    isActive: true,
    admins: [
      {
        id: 'admin-9',
        name: 'Carlos Silva',
        role: 'CHAPTER_SUPER_ADMIN',
        email: 'carlos.silva@saopaulo-international.edu.br',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      }
    ],
    events: [
      {
        id: 'event-9',
        title: 'Carnival Cultural Week',
        content: 'Experience the vibrant culture of Brazil through music, dance, and art workshops.',
        postType: 'EVENT',
        date: '2026-02-28'
      }
    ]
  }
]

// ============================================
// HELPER FUNCTIONS - DO NOT MODIFY
// ============================================

/**
 * Get all active schools
 */
export function getAllSchools(): StaticSchool[] {
  return STATIC_SCHOOLS.filter(school => school.isActive)
}

/**
 * Get a school by ID
 */
export function getSchoolById(id: string): StaticSchool | undefined {
  return STATIC_SCHOOLS.find(school => school.id === id)
}

/**
 * Search schools by name or location
 */
export function searchSchools(query: string): StaticSchool[] {
  const lowerQuery = query.toLowerCase()
  return STATIC_SCHOOLS.filter(school => 
    school.isActive && (
      school.name.toLowerCase().includes(lowerQuery) ||
      school.location.toLowerCase().includes(lowerQuery) ||
      school.description.toLowerCase().includes(lowerQuery)
    )
  )
}

/**
 * Get total statistics across all schools
 */
export function getTotalStats(): { totalVolunteerHours: number; totalMembers: number; totalSchools: number } {
  const activeSchools = getAllSchools()
  return {
    totalVolunteerHours: activeSchools.reduce((sum, school) => sum + school.volunteerHours, 0),
    totalMembers: activeSchools.reduce((sum, school) => sum + school.activeMembers, 0),
    totalSchools: activeSchools.length
  }
}
