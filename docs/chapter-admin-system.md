# Chapter Admin System Documentation

## Overview

The Chapter Admin System is a hierarchical permission management system that allows for decentralized management of school chapters. It provides a structured approach to delegate administrative responsibilities while maintaining proper access controls and audit trails.

## Architecture

### Hierarchy Structure

```
Super Admin (Global)
├── Chapter Super Admin (Per School)
│   ├── Can assign/remove Chapter Admins
│   ├── Can edit volunteer hours
│   ├── Can edit active members
│   └── Full school management access
└── Chapter Admin (Per School)
    ├── Can edit active members only
    └── Limited school management access
```

### Permission Matrix

| Action | Super Admin | Chapter Super Admin | Chapter Admin | Regular User |
|--------|-------------|---------------------|---------------|--------------|
| Create Schools | ✅ | ❌ | ❌ | ❌ |
| Delete Schools | ✅ | ❌ | ❌ | ❌ |
| Assign Chapter Super Admins | ✅ | ❌ | ❌ | ❌ |
| Assign Chapter Admins | ✅ | ✅ | ❌ | ❌ |
| Remove Chapter Admins | ✅ | ✅ | ❌ | ❌ |
| Edit Volunteer Hours | ✅ | ✅ | ❌ | ❌ |
| Edit Active Members | ✅ | ✅ | ✅ | ❌ |
| View School Details | ✅ | ✅ | ✅ | ✅ |
| Access Chapter Dashboard | ❌ | ✅ | ✅ | ❌ |

## Data Storage

### MinIO Structure

The system uses MinIO for data storage with the following structure:

```
schools/
├── index.json                          # Main schools index
├── schools/
│   └── {schoolId}.json                # Individual school data
└── chapter-admins/
    ├── index.json                     # All chapter admins
    ├── by-school/
    │   └── {schoolId}.json           # Admins for specific school
    └── by-user/
        └── {userId}.json             # Schools managed by user
```

### Data Types

#### School Interface
```typescript
interface School {
  id: string
  name: string
  description?: string
  location?: string
  imageUrl?: string
  website?: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  
  // Chapter Admin fields
  chapterSuperAdmin?: string           // User ID
  chapterAdmins: string[]             // Array of User IDs
  volunteerHours?: number
  activeMembers?: number
}
```

#### Chapter Admin Interface
```typescript
interface ChapterAdmin {
  id: string
  userId: string
  schoolId: string
  role: 'chapter_super_admin' | 'chapter_admin'
  assignedAt: string
  assignedBy: string
  isActive: boolean
}
```

## API Endpoints

### Chapter Admin Management

#### `GET /api/chapter-admins`
- **Purpose**: Retrieve chapter admins
- **Query Parameters**:
  - `schoolId`: Filter by school
  - `userId`: Filter by user
- **Access**: Admin required
- **Response**: Array of ChapterAdmin objects

#### `POST /api/chapter-admins`
- **Purpose**: Assign chapter admin role
- **Body**: `{ schoolId, targetUserId, role }`
- **Access**: Super Admin or Chapter Super Admin
- **Response**: Created ChapterAdmin object

#### `DELETE /api/chapter-admins`
- **Purpose**: Remove chapter admin role
- **Query Parameters**: `schoolId`, `userId`
- **Access**: Super Admin or Chapter Super Admin
- **Response**: Success confirmation

### School Stats Management

#### `PATCH /api/schools/[id]/stats`
- **Purpose**: Update school statistics
- **Body**: `{ volunteerHours?, activeMembers? }`
- **Access**: Based on role permissions
- **Response**: Updated school object

### User Search

#### `GET /api/users/search`
- **Purpose**: Search users for admin assignment
- **Query Parameters**: `q` (search term)
- **Access**: Admin required
- **Response**: Array of user objects

## Frontend Components

### Admin Schools Page (`/admin/schools`)
- **Purpose**: Main admin interface for school management
- **Features**:
  - User search and role assignment
  - Chapter admin management
  - School statistics editing
  - Visual role indicators
- **Access**: Super Admin + Chapter Admins

### Chapter Admin Dashboard (`/admin/chapter-dashboard`)
- **Purpose**: Dedicated dashboard for chapter admins
- **Features**:
  - View managed schools
  - Edit statistics (based on permissions)
  - Overview of total stats
  - Role-based UI elements
- **Access**: Chapter Admins only

### School Hub Page (`/school-hub`)
- **Purpose**: Public school directory with admin features
- **Features**:
  - Role badges for managed schools
  - Quick access to management interfaces
  - Permission-based action buttons
- **Access**: All users (features based on permissions)

## Implementation Details

### Permission Checking

The system uses helper functions to check permissions:

```typescript
// Check if user can manage a school
const canManageSchool = (userId: string, schoolId: string) => {
  return hasAdminAccess(userId) || 
         hasChapterAdminAccess(userId, schoolId)
}

// Get user's role for a school
const getUserRole = (userId: string, schoolId: string) => {
  if (hasAdminAccess(userId)) return 'super_admin'
  if (hasChapterAdminAccess(userId, schoolId, 'chapter_super_admin')) 
    return 'chapter_super_admin'
  if (hasChapterAdminAccess(userId, schoolId)) return 'chapter_admin'
  return null
}
```

### Build-Time Considerations

The system includes build-time protection to prevent MinIO initialization during static generation:

```typescript
// Check if we're in build time
function isBuildTime() {
  return process.env.NODE_ENV === 'production' && !process.env.MINIO_URL
}

// API route protection
export async function GET(request: NextRequest) {
  if (isBuildTime()) {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 })
  }
  // ... rest of implementation
}
```

## Security Considerations

### Access Control
- All API endpoints require authentication
- Role-based permissions are enforced at the API level
- UI elements are conditionally rendered based on permissions

### Data Validation
- Input validation using Zod schemas
- Proper error handling and user feedback
- Audit trail for all admin actions

### Environment Variables
- MinIO credentials are securely stored
- Build-time environment variable handling
- Lazy initialization to prevent build failures

## Usage Examples

### Assigning a Chapter Super Admin

1. Navigate to `/admin/schools`
2. Find the target school
3. Click "Manage Admins"
4. Search for the user
5. Select "Chapter Super Admin" role
6. Click "Assign"

### Updating School Statistics

**As Chapter Super Admin:**
1. Navigate to `/admin/chapter-dashboard`
2. Find your school
3. Click edit button next to volunteer hours or active members
4. Update the value
5. Click "Save"

**As Chapter Admin:**
1. Navigate to `/admin/chapter-dashboard`
2. Find your school
3. Click edit button next to active members (volunteer hours not editable)
4. Update the value
5. Click "Save"

### Managing Multiple Schools

Chapter admins can be assigned to multiple schools:
1. Each assignment is independent
2. Different roles can be assigned per school
3. The dashboard shows all managed schools
4. Statistics are aggregated across all schools

## Error Handling

### Common Error Scenarios

1. **Insufficient Permissions**: User attempts unauthorized action
   - Response: 403 Forbidden
   - UI: Toast notification with error message

2. **Resource Not Found**: School or user doesn't exist
   - Response: 404 Not Found
   - UI: Error message with retry option

3. **Validation Errors**: Invalid input data
   - Response: 400 Bad Request
   - UI: Form validation errors

4. **Service Unavailable**: MinIO connection issues
   - Response: 503 Service Unavailable
   - UI: Retry mechanism with exponential backoff

## Monitoring and Audit

### Audit Trail
- All admin actions are logged with timestamps
- User assignments track who performed the action
- Changes to school statistics are recorded

### Performance Monitoring
- API response times are tracked
- Database query performance is monitored
- MinIO connection health is checked

## Future Enhancements

### Planned Features
1. **Notification System**: Email notifications for role assignments
2. **Activity Dashboard**: Visual analytics for admin activities
3. **Bulk Operations**: Mass assignment of chapter admins
4. **Advanced Permissions**: Custom permission sets per school
5. **Integration**: Sync with external school management systems

### Technical Improvements
1. **Caching**: Redis caching for frequently accessed data
2. **Real-time Updates**: WebSocket integration for live updates
3. **Mobile App**: React Native app for mobile management
4. **API Versioning**: Versioned API endpoints for backward compatibility

## Troubleshooting

### Common Issues

1. **Build Failures**: MinIO environment variables not available
   - Solution: Ensure proper environment variable configuration
   - Check: Build-time protection is enabled

2. **Permission Denied**: User cannot access expected features
   - Solution: Verify role assignments in admin panel
   - Check: User ID matches in environment variables

3. **Data Sync Issues**: School data not updating
   - Solution: Check MinIO connection and bucket permissions
   - Verify: API endpoints are responding correctly

### Debug Tools

1. **API Testing**: Use Postman or curl to test endpoints
2. **MinIO Console**: Direct access to storage buckets
3. **Browser DevTools**: Network tab for API debugging
4. **Server Logs**: Application logs for error tracking

## Conclusion

The Chapter Admin System provides a scalable and secure way to manage school chapters with proper delegation of responsibilities. The hierarchical permission structure ensures that administrative tasks can be distributed while maintaining security and audit capabilities.

For additional support or questions, please refer to the main application documentation or contact the development team. 