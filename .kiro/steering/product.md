---
inclusion: always
---

# CamBright Product Guidelines

CamBright is an IGCSE learning platform connecting students with tutors and providing comprehensive study resources.

## Core Domain Models

### User Roles & Permissions
- **TUTOR**: Basic tutor access to assigned content
- **SENIOR_TUTOR**: Enhanced permissions for content management
- **ADMIN_TUTOR**: Administrative tutor functions
- **ADMIN**: Full platform administration
- **STUDENT**: Learning access with progress tracking

### Content Hierarchy
- **Courses** → **Chapters** → **Lessons** → **Resources**
- **Subjects**: Organized by examination board (OL, AL, CR)
- **Notes**: User-generated and curated study materials
- **Assets**: Files managed through MinIO storage

### Community Structure
- **Schools**: Institution profiles with posts and engagement
- **Study Rooms**: Real-time collaborative spaces
- **Direct Messaging**: Tutor-student communication
- **Task Boards**: Sprint-based organization with Kanban workflow

## Business Rules

### Content Access
- Past papers and basic materials are free
- Premium content requires tutor guidance
- Progress tracking available to all authenticated users
- School communities are moderated by admins

### Tutor Management
- Tutors must be approved before accessing student data
- Senior tutors can manage course content
- Admin tutors handle user management and moderation
- All tutor actions are audit-logged

### Data Integrity
- User profiles linked to Clerk authentication
- All content changes tracked with audit trails
- Soft deletes for user-generated content
- Asset management through centralized service

## Feature Conventions

### Progress Tracking
- Chapter completion percentages
- Time-based analytics
- Performance metrics per subject
- Leaderboard functionality with privacy controls

### Communication Features
- Real-time chat with Socket.IO
- File sharing through secure upload system
- Notification system for important updates
- Moderation tools for community safety

### Assessment System
- MCQ solver with instant feedback
- Grade prediction based on performance
- Past paper practice with timing
- Progress visualization and reporting

## Content Guidelines

### Educational Standards
- IGCSE curriculum alignment required
- Multi-board support (Cambridge, Edexcel, etc.)
- Subject-specific resource organization
- Quality assurance for tutor-generated content

### User Experience Principles
- Mobile-first responsive design
- Accessibility compliance (WCAG guidelines)
- Progressive loading for large content
- Offline capability for downloaded materials

### Community Standards
- Respectful interaction enforcement
- Academic integrity policies
- Content moderation workflows
- Privacy protection for minors