import { v4 as uuidv4 } from 'uuid';

export type Announcement = {
  id: string;
  school_id: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  title?: string;
  content: string;
  image_url?: string;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
};

// Local storage key for announcements
const ANNOUNCEMENTS_KEY = 'school_announcements';

// Get all announcements from localStorage
function getAllAnnouncements(): Announcement[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(ANNOUNCEMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading announcements from localStorage:', error);
    return [];
  }
}

// Save announcements to localStorage
function saveAnnouncements(announcements: Announcement[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  } catch (error) {
    console.error('Error saving announcements to localStorage:', error);
  }
}

export async function getAnnouncementsBySchool(schoolId: string): Promise<Announcement[]> {
  const allAnnouncements = getAllAnnouncements();
  return allAnnouncements
    .filter(announcement => announcement.school_id === schoolId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement | null> {
  try {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allAnnouncements = getAllAnnouncements();
    allAnnouncements.push(newAnnouncement);
    saveAnnouncements(allAnnouncements);

    return newAnnouncement;
  } catch (error) {
    console.error('Error creating announcement:', error);
    return null;
  }
}

export async function updateAnnouncementLikes(id: string, likes: number): Promise<boolean> {
  try {
    const allAnnouncements = getAllAnnouncements();
    const announcementIndex = allAnnouncements.findIndex(a => a.id === id);
    
    if (announcementIndex === -1) return false;

    allAnnouncements[announcementIndex] = {
      ...allAnnouncements[announcementIndex],
      likes,
      updated_at: new Date().toISOString(),
    };

    saveAnnouncements(allAnnouncements);
    return true;
  } catch (error) {
    console.error('Error updating likes:', error);
    return false;
  }
}

export async function updateAnnouncementComments(id: string, comments: number): Promise<boolean> {
  try {
    const allAnnouncements = getAllAnnouncements();
    const announcementIndex = allAnnouncements.findIndex(a => a.id === id);
    
    if (announcementIndex === -1) return false;

    allAnnouncements[announcementIndex] = {
      ...allAnnouncements[announcementIndex],
      comments,
      updated_at: new Date().toISOString(),
    };

    saveAnnouncements(allAnnouncements);
    return true;
  } catch (error) {
    console.error('Error updating comments:', error);
    return false;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    const allAnnouncements = getAllAnnouncements();
    const filteredAnnouncements = allAnnouncements.filter(a => a.id !== id);
    
    saveAnnouncements(filteredAnnouncements);
    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return false;
  }
}

// Clear all existing data and start fresh
export function initializeSampleData(): void {
  if (typeof window === 'undefined') return;
  
  // Clear all existing announcements to start fresh
  saveAnnouncements([]);
}