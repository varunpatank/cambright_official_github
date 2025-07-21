# Requirements Document

## Introduction

The current chapter admin system has critical issues preventing proper functionality: users cannot add school admins due to "school not found" errors, school banners fail to load, and admin posts cannot be created. The system suffers from data inconsistency between MinIO JSON storage and the PostgreSQL database, causing a fragmented user experience. This overhaul will create a unified, database-driven chapter admin system that resolves these issues and provides a seamless administrative experience.

## Requirements

### Requirement 1

**User Story:** As a super admin, I want to assign chapter admins to schools without encountering "school not found" errors, so that I can delegate administrative responsibilities effectively.

#### Acceptance Criteria

1. WHEN I search for a school to assign an admin THEN the system SHALL find all schools from the Prisma database
2. WHEN I attempt to assign a chapter admin to any existing school THEN the system SHALL successfully create the admin assignment in the Prisma database
3. IF legacy schools exist only in MinIO THEN the system SHALL migrate them to Prisma database before allowing admin assignment
4. WHEN the admin assignment is successful THEN the system SHALL display a confirmation message with the admin's role

### Requirement 2

**User Story:** As a chapter admin, I want to see my assigned schools with proper "on board" status indicators, so that I can understand my administrative scope clearly.

#### Acceptance Criteria

1. WHEN I view the school hub page THEN the system SHALL display "Admin" or "Super Admin" badges for schools I manage
2. WHEN I access my chapter dashboard THEN the system SHALL show all schools where I have administrative privileges
3. IF I am a chapter super admin THEN the system SHALL display "Super Admin" badge and allow full administrative actions
4. IF I am a chapter admin THEN the system SHALL display "Admin" badge and allow limited administrative actions

### Requirement 3

**User Story:** As a user viewing school pages, I want to see school banners and information load correctly, so that I can access complete school details.

#### Acceptance Criteria

1. WHEN I visit any school page THEN the system SHALL load the school banner image and basic information from the Prisma database
2. WHEN school data is requested THEN the system SHALL query only the Prisma database for school information
3. IF school images are stored in MinIO THEN the system SHALL provide secure API endpoints using asset keys to serve these images
4. WHEN school information is updated THEN the system SHALL reflect changes across all interfaces immediately

### Requirement 4

**User Story:** As a chapter admin, I want to create posts for schools I manage, so that I can communicate with the school community.

#### Acceptance Criteria

1. WHEN I have admin privileges for a school THEN the system SHALL allow me to create posts for that school
2. WHEN I create a school post THEN the system SHALL save it to the database with proper author attribution
3. IF I upload an image with the post THEN the system SHALL store it in MinIO and link it correctly
4. WHEN other users view the school page THEN the system SHALL display my posts in the school feed

### Requirement 5

**User Story:** As a system administrator, I want all school data to be stored exclusively in the Prisma database, so that the platform operates with a single source of truth.

#### Acceptance Criteria

1. WHEN the system needs school information THEN it SHALL query only the Prisma database
2. WHEN creating new schools THEN the system SHALL store them exclusively in the Prisma database
3. IF legacy schools exist only in MinIO THEN the system SHALL migrate them to the Prisma database and remove MinIO school data
4. WHEN school data is updated THEN the system SHALL update only the Prisma database records

### Requirement 6

**User Story:** As a chapter admin, I want to manage school statistics and information, so that I can keep school profiles up to date.

#### Acceptance Criteria

1. WHEN I have appropriate permissions THEN the system SHALL allow me to edit volunteer hours and active member counts
2. WHEN I update school statistics THEN the system SHALL save changes to the primary data store
3. IF I am a chapter super admin THEN the system SHALL allow editing of all school statistics
4. IF I am a chapter admin THEN the system SHALL allow editing of active member counts only

### Requirement 7

**User Story:** As a developer, I want the chapter admin system to have proper error handling and logging, so that issues can be diagnosed and resolved quickly.

#### Acceptance Criteria

1. WHEN any admin operation fails THEN the system SHALL log detailed error information
2. WHEN a user encounters an error THEN the system SHALL display a helpful error message
3. IF data inconsistencies are detected THEN the system SHALL log warnings and attempt graceful fallbacks
4. WHEN system health checks run THEN they SHALL verify the integrity of the chapter admin system

### Requirement 8

**User Story:** As a user, I want the chapter admin system to perform efficiently, so that administrative tasks complete quickly.

#### Acceptance Criteria

1. WHEN loading school lists THEN the system SHALL respond within 2 seconds
2. WHEN assigning admin roles THEN the operation SHALL complete within 5 seconds
3. IF multiple data sources are queried THEN the system SHALL use caching to improve performance
4. WHEN displaying admin dashboards THEN the system SHALL load all necessary data in a single request where possible
### Requirement 9

**User Story:** As a system administrator, I want a comprehensive asset management system that securely handles all public-facing assets, so that file access is controlled and IDOR vulnerabilities are prevented.

#### Acceptance Criteria

1. WHEN any public asset is uploaded THEN the system SHALL create an AssetManager record in Prisma with a unique key and MinIO location
2. WHEN assets are requested THEN the system SHALL use only the asset key through `/api/assets/[key]` endpoint without exposing MinIO paths
3. IF someone attempts to access assets with modified paths THEN the system SHALL prevent unauthorized access through the key-based system
4. WHEN assets are served THEN the system SHALL retrieve the MinIO location using the key and return the file with appropriate headers

### Requirement 10

**User Story:** As a content creator (tutor, admin, chapter admin), I want to upload public assets that are securely managed, so that my content is accessible to users without security risks.

#### Acceptance Criteria

1. WHEN I upload school images, course materials, or other public content THEN the system SHALL store them through the AssetManager system
2. WHEN users view my uploaded content THEN the system SHALL serve it through secure asset keys
3. IF I delete uploaded content THEN the system SHALL remove both the AssetManager record and the MinIO file
4. WHEN I upload assets THEN the system SHALL generate unique keys that cannot be guessed or enumerated

### Requirement 11

**User Story:** As a developer, I want the AssetManager to handle all public-facing assets consistently, so that the system has a unified approach to asset security.

#### Acceptance Criteria

1. WHEN implementing asset uploads THEN the system SHALL use AssetManager for school images, course materials, post images, and other public content
2. WHEN legacy assets exist with direct paths THEN the system SHALL migrate them to use the AssetManager system
3. IF internal system assets are needed THEN the system SHALL NOT use AssetManager but handle them through separate secure mechanisms
4. WHEN the AssetManager is used THEN it SHALL only be for content that tutors, admins, or chapter admins upload for public viewing