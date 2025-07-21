# Project Structure & Organization

## Root Level Structure

```
├── app/                    # Next.js App Router pages and layouts
├── components/             # Reusable UI components
├── lib/                    # Utility functions and configurations
├── actions/                # Server actions for data mutations
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── scripts/                # Maintenance and migration scripts
├── tests/ & __tests__/     # Test files and utilities
└── docs/                   # Project documentation
```

## App Directory (Next.js 14 App Router)

```
app/
├── (auth)/                 # Authentication routes (sign-in, sign-up)
├── (dashboard)/            # Main dashboard and user areas
├── (course)/               # Course-related pages
├── (learn)/                # Learning interface pages
├── (note)/                 # Notes and study materials
├── api/                    # API routes and webhooks
├── chapters/               # Individual chapter pages
├── home/                   # Landing and marketing pages
├── schools/                # School community features
├── tracker/                # Progress tracking pages
├── tutor-apply/            # Tutor application process
├── layout.tsx              # Root layout with providers
├── globals.css             # Global styles
└── provider.tsx            # Context providers
```

## Components Organization

```
components/
├── ui/                     # Base UI components (Shadcn)
├── modals/                 # Modal dialogs
├── providers/              # React context providers
├── editor/                 # Rich text editor components
├── SettingsModal/          # Settings-specific components
└── [feature-components]    # Feature-specific components
```

## Library Structure

```
lib/
├── db.ts                   # Database connection
├── utils.ts                # General utilities
├── admin.ts                # Admin access control
├── tutor-service.ts        # Tutor management logic
├── cache.ts                # Caching utilities
├── minio.ts                # File storage service
├── current-profile.ts      # User profile utilities
├── create-safe-action.ts   # Server action wrapper
└── [feature-libs]          # Feature-specific utilities
```

## Key Conventions

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: kebab-case for routes (e.g., `sign-in/page.tsx`)
- **Utilities**: camelCase (e.g., `getUserProfile.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Component Structure

- Use functional components with TypeScript
- Export components as default when single export
- Co-locate related types with components
- Use Shadcn UI patterns for consistency

### Server Actions

- Located in `/actions` directory
- Use `create-safe-action` wrapper for validation
- Follow naming pattern: `[entity]-[action].ts`
- Include proper error handling and logging

### Database Patterns

- Models follow PascalCase naming
- Use UUIDs for primary keys
- Include audit fields (createdAt, updatedAt)
- Implement soft deletes where appropriate
- Use indexes for frequently queried fields

### API Routes

- RESTful conventions in `/app/api`
- Separate webhooks in `/api/webhooks`
- Use proper HTTP status codes
- Include request/response validation

### Testing Structure

```
__tests__/
├── actions/                # Server action tests
├── ui/                     # Component tests
├── utils/                  # Utility function tests
└── setup/                  # Test configuration
```

## Import Conventions

### Path Aliases

- `@/` - Project root
- `@/components` - UI components
- `@/lib` - Utilities and configurations
- `@/actions` - Server actions
- `@/hooks` - Custom hooks

### Import Order

1. React and Next.js imports
2. Third-party libraries
3. Internal components and utilities
4. Type imports (with `type` keyword)
5. Relative imports

## Environment Configuration

### Required Files

- `.env` - Environment variables
- `.env.example` - Template for environment setup
- `docker-compose.yml` - Local development with Redis
- `Dockerfile` - Production container build

### Configuration Hierarchy

1. Environment variables
2. Runtime configuration
3. Build-time configuration
4. Default fallbacks

## Documentation Standards

- README files for complex features
- Inline comments for business logic
- JSDoc for public APIs
- Migration guides in `/docs`
- Health check documentation
