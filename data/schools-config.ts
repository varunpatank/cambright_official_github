// Manual School Configuration
// Add your schools here with their images and details

export interface SchoolConfig {
  id: string
  name: string
  description?: string
  location?: string
  website?: string
  email?: string
  phone?: string
  isActive: boolean
  volunteerHours: number
  activeMembers: number
  
  // Image paths (relative to /public folder)
  previewImagePath?: string  // For the circular preview image
  bannerImagePath?: string   // For the banner image
  
  // Optional: Direct URLs if you prefer
  imageUrl?: string
  bannerUrl?: string
}

export const SCHOOLS_CONFIG: SchoolConfig[] = [
  {
    id: 'cambright-main',
    name: 'Cambright Main Chapter',
    description: 'Our flagship chapter dedicated to advancing computer science education and innovation.',
    location: 'Central Campus',
    website: 'https://cambright.org',
    email: 'main@cambright.org',
    phone: '+1 (555) 123-4567',
    isActive: true,
    volunteerHours: 1250,
    activeMembers: 45,
    
    // Add your image paths here
    previewImagePath: '/schools/cambright-main/preview.jpg',
    bannerImagePath: '/schools/cambright-main/banner.jpg',
    
    // Or use direct URLs
    // imageUrl: 'https://your-cdn.com/cambright-main-preview.jpg',
    // bannerUrl: 'https://your-cdn.com/cambright-main-banner.jpg',
  },
  {
    id: 'cambright-tech',
    name: 'Cambright Tech Division',
    description: 'Specialized in cutting-edge technology research and development projects.',
    location: 'Technology Hub',
    website: 'https://tech.cambright.org',
    email: 'tech@cambright.org',
    phone: '+1 (555) 234-5678',
    isActive: true,
    volunteerHours: 980,
    activeMembers: 32,
    
    previewImagePath: '/schools/cambright-tech/preview.jpg',
    bannerImagePath: '/schools/cambright-tech/banner.jpg',
  },
  {
    id: 'cambright-community',
    name: 'Cambright Community Outreach',
    description: 'Focused on bringing technology education to underserved communities.',
    location: 'Community Center',
    website: 'https://community.cambright.org',
    email: 'community@cambright.org',
    phone: '+1 (555) 345-6789',
    isActive: true,
    volunteerHours: 1100,
    activeMembers: 28,
    
    previewImagePath: '/schools/cambright-community/preview.jpg',
    bannerImagePath: '/schools/cambright-community/banner.jpg',
  },
  
  // Add more schools as needed
  // {
  //   id: 'your-school-id',
  //   name: 'Your School Name',
  //   description: 'Your school description',
  //   location: 'Your Location',
  //   website: 'https://yourschool.org',
  //   email: 'contact@yourschool.org',
  //   phone: '+1 (555) 000-0000',
  //   isActive: true,
  //   volunteerHours: 500,
  //   activeMembers: 20,
  //   
  //   previewImagePath: '/schools/your-school/preview.jpg',
  //   bannerImagePath: '/schools/your-school/banner.jpg',
  // },
]

// Helper function to get school by ID
export function getSchoolById(id: string): SchoolConfig | undefined {
  return SCHOOLS_CONFIG.find(school => school.id === id)
}

// Helper function to get active schools
export function getActiveSchools(): SchoolConfig[] {
  return SCHOOLS_CONFIG.filter(school => school.isActive)
}

// Helper function to get schools sorted by volunteer hours
export function getSchoolsLeaderboard(): SchoolConfig[] {
  return [...SCHOOLS_CONFIG]
    .filter(school => school.isActive)
    .sort((a, b) => b.volunteerHours - a.volunteerHours)
}
