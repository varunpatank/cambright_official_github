# Implementation Plan

- [x] 1. Database Schema Updates and Migrations

  - Create new Prisma models for AssetManager and ChapterAdmin
  - Update existing School model to include asset references
  - Generate and run database migrations
  - _Requirements: 5.1, 5.2, 9.1, 10.1_

- [x] 1.1 Create AssetManager Prisma model

  - Add AssetManager model with key, fileName, mimeType, fileSize, minioPath fields
  - Define AssetType enum with SCHOOL_IMAGE, SCHOOL_BANNER, POST_IMAGE, COURSE_IMAGE values
  - Add relations to School, SchoolPost, and Course models
  - _Requirements: 9.1, 10.1_

- [x] 1.2 Create ChapterAdmin Prisma model

  - Add ChapterAdmin model with userId, schoolId, role, assignedBy fields
  - Define ChapterAdminRole enum with CHAPTER_ADMIN and CHAPTER_SUPER_ADMIN values
  - Add unique constraint on userId and schoolId combination
  - _Requirements: 1.2, 2.1_

- [x] 1.3 Update School model with asset references

  - Add imageAssetKey and bannerAssetKey fields to School model
  - Add relations to AssetManager for image and banner assets
  - Add relation to ChapterAdmin model
  - _Requirements: 3.1, 10.2_

- [x] 1.4 Generate and run database migrations

  - Run prisma generate to update client
  - Create migration files for new models and schema changes
  - Test migrations on development database
  - _Requirements: 5.2, 5.3_

- [x] 2. Asset Management System Implementation

  - Create AssetManager service for handling file uploads and retrievals
  - Implement secure asset upload API endpoint
  - Create asset retrieval API endpoint using keys
  - _Requirements: 9.1, 9.2, 10.1, 10.2_

- [x] 2.1 Implement AssetManager service class

  - Create uploadAsset method that stores files in MinIO and creates database records
  - Implement getAsset method that retrieves files using asset keys
  - Add deleteAsset method for cleanup operations

  - Create generateUniqueKey method for secure key generation
  - _Requirements: 9.1, 9.3, 10.1_

- [x] 2.2 Create asset upload API endpoint

  - Implement POST /api/assets/upload endpoint
  - Add file validation for size, type, and security
  - Generate unique asset keys and store in database
  - Return asset key and API URL for frontend use
  - _Requirements: 9.1, 10.1_

- [x] 2.3 Create asset retrieval API endpoint

  - Implement GET /api/assets/[key] endpoint
  - Look up asset in database using key
  - Stream file from MinIO with appropriate headers
  - Add caching headers for performance optimization
  - _Requirements: 9.2, 9.4_

- [x] 2.4 Add asset deletion functionality

  - Implement DELETE /api/assets/[key] endpoint with proper authorization
  - Remove both MinIO file and database record
  - Add cleanup for orphaned assets
  - _Requirements: 10.4_

- [x] 3. Chapter Admin Management System

  - Create ChapterAdmin service for role management
  - Implement admin assignment and removal API endpoints
  - Add permission checking utilities
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 3.1 Implement ChapterAdmin service class

  - Create assignAdmin method that validates school existence and creates admin records
  - Implement removeAdmin method for removing admin roles
  - Add getAdminsBySchool and getSchoolsByUser methods
  - Create hasPermission method for role-based access control
  - _Requirements: 1.1, 1.2, 2.1_

- [x] 3.2 Create chapter admin assignment API endpoint

  - Implement POST /api/chapter-admins endpoint
  - Validate user permissions and school existence
  - Create ChapterAdmin database records
  - Return success confirmation with admin details
  - _Requirements: 1.2, 1.4_

- [x] 3.3 Create chapter admin removal API endpoint

  - Implement DELETE /api/chapter-admins/[id] endpoint
  - Validate permissions for admin removal
  - Remove ChapterAdmin database records
  - Add audit logging for admin actions
  - _Requirements: 1.2, 7.1_

- [x] 3.4 Implement permission checking utilities

  - Create hasChapterAdminAccess function for permission validation
  - Add role-based permission matrix implementation
  - Integrate permission checks into existing API endpoints
  - _Requirements: 2.3, 2.4, 6.3, 6.4_

- [x] 4. School Management System Updates

  - Update School service to use database-only operations
  - Modify school API endpoints to work with new schema
  - Update school statistics management
  - _Requirements: 3.1, 3.2, 5.1, 6.1, 6.2_

- [x] 4.1 Update SchoolService for database-only operations

  - Modify getAllSchools to query only Prisma database
  - Update getSchoolById to include asset relations
  - Modify createSchool and updateSchool to handle asset references
  - Remove all MinIO JSON dependencies
  - _Requirements: 3.2, 5.1_

- [x] 4.2 Update school API endpoints

  - Modify GET /api/schools to return schools with asset URLs
  - Update POST /api/schools to handle asset key references
  - Modify PUT /api/schools/[id] for asset updates
  - Add proper error handling for school not found cases
  - _Requirements: 1.1, 3.1, 3.4_

- [x] 4.3 Implement school statistics management

  - Create PATCH /api/schools/[id]/stats endpoint
  - Add role-based validation for volunteer hours and active members editing
  - Integrate with ChapterAdmin permission system
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5. School Posts System Integration

  - Update SchoolPost model to use AssetManager
  - Modify post creation to work with chapter admin permissions
  - Fix post image handling with asset keys
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5.1 Update SchoolPost model for asset integration

  - Add imageAssetKey field to SchoolPost model
  - Create relation to AssetManager for post images
  - Update post creation logic to use asset keys
  - _Requirements: 4.3, 10.1_

- [x] 5.2 Implement chapter admin post permissions

  - Add permission validation to POST /api/schools/[id]/posts
  - Verify user has admin access to school before allowing post creation
  - Add proper author attribution for chapter admin posts
  - _Requirements: 4.1, 4.2_

- [x] 5.3 Update post image handling

  - Modify post creation to use AssetManager for images
  - Update frontend to use asset keys instead of direct URLs
  - Add image deletion when posts are removed
  - _Requirements: 4.3, 4.4_

- [x] 6. Data Migration Implementation

  - Create migration scripts for existing MinIO school data
  - Implement asset migration from direct paths to AssetManager
  - Add data validation and cleanup utilities
  - _Requirements: 5.3, 10.3, 11.2_

- [x] 6.1 Create school data migration script

  - Identify schools stored in MinIO JSON files
  - Create corresponding database records
  - Migrate school images to AssetManager system
  - Validate migration success and data integrity
  - _Requirements: 5.3, 11.2_

- [x] 6.2 Implement asset migration utilities

  - Create script to identify all existing assets with direct paths
  - Generate AssetManager records for existing assets
  - Update database references to use asset keys
  - Remove orphaned MinIO files after successful migration
  - _Requirements: 10.3, 11.2_

- [x] 6.3 Add migration validation and rollback

  - Create validation scripts to verify migration success
  - Implement rollback procedures for failed migrations
  - Add data consistency checks
  - _Requirements: 7.3, 8.1_

- [-] 7. Frontend Updates for New System

  - Update admin dashboard to use new API endpoints
  - Modify school hub to display proper admin badges
  - Update chapter dashboard with new permission system
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7.1 Update admin dashboard components

  - Modify school admin assignment UI to use new API endpoints
  - Update user search to work with database-only schools
  - Fix "school not found" errors in admin assignment
  - Add proper success/error messaging
  - _Requirements: 1.1, 1.4, 2.1_

- [x] 7.2 Update school hub page

  - Modify school listing to show proper admin badges
  - Update "on board" status indicators for chapter admins
  - Fix admin role display logic

  - Add proper navigation to admin dashboards
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 7.3 Update chapter dashboard functionality

  - Modify dashboard to load schools from database
  - Update statistics editing with proper permission checks
  - Fix volunteer hours and active members editing
  - Add proper role-based UI elements
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7.4 Update school page components

  - Modify school pages to load data from database
  - Update banner and image loading to use asset API
  - Fix school information display
  - Add proper post creation for chapter admins
  - _Requirements: 3.1, 3.4, 4.1, 4.2_

-

- [x] 8. Error Handling and Logging Implementation

  - Add comprehensive error handling to all new endpoints
  - Implement structured logging for admin actions
  - Create health check endpoints for system monitoring
  - _Requirements: 7.1, 7.2, 7.4, 8.1_

- [x] 8.1 Implement comprehensive error handling

  - Add proper error types and response codes
  - Create user-friendly error messages
  - Add error logging with context information
  - Implement graceful fallbacks for data inconsistencies
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 8.2 Add structured logging system

  - Log all chapter admin assignments and removals
  - Add asset upload/download/deletion logging
  - Create audit trail for school modifications
  - Implement performance logging for slow operations
  - _Requirements: 7.1, 7.4_

- [x] 8.3 Create system health checks

  - Add health check endpoint for chapter admin system
  - Implement database connectivity checks
  - Add MinIO connectivity validation
  - Create asset integrity verification
  - _Requirements: 7.4, 8.1_

- [x] 9. Testing and Validation

  - Create comprehensive test suite for new functionality
  - Add integration tests for complete workflows
  - Implement performance testing for asset operations
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 9.1 Create unit tests for services

  - Test ChapterAdmin service methods with mocked dependencies
  - Add AssetManager service tests for upload/download operations
  - Test SchoolService database operations
  - Create permission checking utility tests
  - _Requirements: 8.1, 8.2_

- [x] 9.2 Implement API endpoint tests

  - Test chapter admin assignment/removal endpoints
  - Add asset upload/retrieval endpoint tests
  - Test school management API endpoints
  - Validate error handling and response codes
  - _Requirements: 8.1, 8.3_

- [x] 9.3 Create integration tests

  - Test complete admin assignment workflow
  - Add end-to-end asset upload and retrieval tests
  - Test school post creation with chapter admin permissions
  - Validate migration processes
  - _Requirements: 8.2, 8.4_

- [x] 10. Performance Optimization and Deployment


  - Optimize database queries with proper indexing
  - Implement caching for frequently accessed data
  - Add performance monitoring and metrics
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 10.1 Optimize database performance

  - Add proper indexes to new models
  - Optimize Prisma queries with include/select
  - Implement connection pooling configuration
  - Add query performance monitoring
  - _Requirements: 8.1, 8.4_

- [x] 10.2 Implement caching strategy

  - Add Redis caching for school data
  - Cache chapter admin permissions
  - Implement asset metadata caching
  - Add cache invalidation strategies
  - _Requirements: 8.3, 8.4_

- [x] 10.3 Add monitoring and metrics

  - Implement admin assignment success rate tracking
  - Add asset operation performance metrics
  - Create database query performance monitoring
  - Add error rate tracking by endpoint
  - _Requirements: 8.1, 8.2_
