---
inclusion: always
---

# CamBright Technical Guidelines

## Architecture Patterns

### Next.js App Router Structure

- Use App Router for all new routes (`app/` directory)
- Group related routes with parentheses: `(auth)`, `(dashboard)`, `(course)`
- Implement proper loading states and error boundaries
- Use server components by default, client components only when needed

### Database & ORM Patterns

- **Prisma ORM**: Use for all database operations
- **UUIDs**: Primary keys for all models
- **Audit Fields**: Include `createdAt`, `updatedAt` on all models
- **Soft Deletes**: Implement where data retention is required
- **Connection Pooling**: Configure for production environments

### Authentication & Authorization

- **Clerk**: Primary authentication provider
- **Role-based Access**: `TUTOR`, `SENIOR_TUTOR`, `ADMIN_TUTOR`, `ADMIN`
- **Profile Management**: Use `current-profile.ts` utilities
- **Protected Routes**: Implement middleware-based protection

## Code Style & Conventions

### TypeScript Standards

- **Strict Mode**: Always enabled
- **Type Safety**: Prefer explicit types over `any`
- **Interface Naming**: Use descriptive names without prefixes
- **Enum Usage**: Prefer const assertions or union types

### Component Patterns

- **Functional Components**: Use exclusively with hooks
- **Props Interface**: Define above component declaration
- **Default Exports**: For single-component files
- **Named Exports**: For utility components and hooks

### Server Actions

- **Location**: `/actions` directory
- **Validation**: Use `create-safe-action` wrapper with Zod schemas
- **Error Handling**: Implement proper error boundaries
- **Naming**: `[entity]-[action].ts` pattern

### File Organization

```
components/
├── ui/           # Shadcn base components
├── modals/       # Modal dialogs
├── [feature]/    # Feature-specific components
```

## Performance & Optimization

### Caching Strategy

- **Redis**: Primary cache for production
- **Memory Fallback**: Development and fallback scenarios
- **Cache Keys**: Use consistent naming patterns
- **TTL Management**: Set appropriate expiration times

### Database Optimization

- **Indexes**: Add for frequently queried fields
- **Query Optimization**: Use Prisma's query optimization features
- **Connection Management**: Implement proper connection pooling

### Asset Management

- **MinIO**: File storage service
- **Cloudinary**: Video and image optimization
- **Static Assets**: Optimize and compress before deployment

## Development Workflow

### Testing Requirements

- **Unit Tests**: All utility functions and hooks
- **Integration Tests**: API routes and server actions
- **Component Tests**: UI components with user interactions
- **Coverage**: Maintain >80% coverage for critical paths

### Code Quality

- **ESLint**: Enforce consistent code style
- **TypeScript**: No `any` types in production code
- **Prettier**: Consistent formatting
- **Husky**: Pre-commit hooks for quality checks

### Environment Management

- **Development**: Use `.env` for local configuration
- **Production**: Environment variables for sensitive data
- **Docker**: Use multi-stage builds for optimization
- **Health Checks**: Implement comprehensive startup validation

## Security Guidelines

### Data Protection

- **Input Validation**: Validate all user inputs with Zod
- **SQL Injection**: Use Prisma's type-safe queries
- **XSS Prevention**: Sanitize user-generated content
- **CSRF Protection**: Implement proper token validation

### Authentication Security

- **Session Management**: Use Clerk's secure session handling
- **Role Validation**: Server-side role checks for protected actions
- **API Security**: Validate authentication on all API routes

## Deployment Standards

### Docker Configuration

- **Multi-stage Builds**: Optimize image size
- **Health Checks**: Implement container health monitoring
- **Environment Variables**: Use for configuration management
- **Resource Limits**: Set appropriate memory and CPU limits

### Production Checklist

- Database migrations deployed
- Environment variables configured
- Health checks passing
- Cache services running
- File storage accessible
- Monitoring and logging enabled
