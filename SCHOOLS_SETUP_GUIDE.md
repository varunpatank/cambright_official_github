# Schools Configuration Guide

## Adding a New School

### 1. Update the Configuration File
Edit `data/schools-config.ts` and add your school to the `SCHOOLS_CONFIG` array:

```typescript
{
  id: 'your-school-id',           // Unique identifier (kebab-case)
  name: 'Your School Name',       // Display name
  description: 'Description...',  // Optional description
  location: 'City, State',        // Optional location
  website: 'https://...',         // Optional website
  email: 'contact@...',           // Optional email
  phone: '+1 (555) 000-0000',     // Optional phone
  isActive: true,                 // Set to false to hide
  volunteerHours: 500,            // Total volunteer hours
  activeMembers: 20,              // Number of active members
  
  // Image paths (choose one method)
  previewImagePath: '/schools/your-school-id/preview.jpg',
  bannerImagePath: '/schools/your-school-id/banner.jpg',
  
  // OR use direct URLs
  // imageUrl: 'https://your-cdn.com/preview.jpg',
  // bannerUrl: 'https://your-cdn.com/banner.jpg',
}
```

### 2. Add Images (if using local paths)

Create a folder in `public/schools/` with your school ID:
```
public/schools/your-school-id/
├── preview.jpg    (Circular preview image - recommended: 400x400px)
├── banner.jpg     (Banner image - recommended: 1200x400px)
```

### 3. Image Requirements

**Preview Image (Circular):**
- Recommended size: 400x400px (square)
- Format: JPG, PNG, or WebP
- Will be displayed as a circle, so center important content

**Banner Image:**
- Recommended size: 1200x400px (3:1 ratio)
- Format: JPG, PNG, or WebP
- Will be displayed in the right panel of school cards

### 4. Example Directory Structure

```
public/schools/
├── cambright-main/
│   ├── preview.jpg
│   └── banner.jpg
├── cambright-tech/
│   ├── preview.jpg
│   └── banner.jpg
└── your-school-id/
    ├── preview.jpg
    └── banner.jpg
```

## Managing Schools

- **Activate/Deactivate:** Set `isActive: true/false` in the config
- **Update Information:** Edit the school object in the config file
- **Change Images:** Replace the image files or update the paths
- **Reorder:** Schools are automatically sorted by volunteer hours

## Posts and Announcements

Posts and announcements will continue to work as before. The database will store:
- Posts linked to school IDs
- Comments and interactions
- User permissions

Only the school basic information is now managed manually via configuration.
