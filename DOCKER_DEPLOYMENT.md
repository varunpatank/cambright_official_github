# Docker Deployment Guide

This guide explains how to deploy CamBright using Docker and Docker Compose with proper environment variable configuration.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/cambright-org.git
   cd cambright-org
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with your production values
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 📋 Required Environment Variables

The application now **requires** explicit environment variable configuration in production. Hardcoded defaults have been removed for security and clarity.

### **Database (Required)**
```env
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database
```

### **Authentication (Required)**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
```

### **Access Control (Required)**
```env
# Admin users - comma-separated Clerk user IDs
NEXT_PUBLIC_ADMIN_IDS=user_1234567890,user_0987654321

# Super admin users - comma-separated Clerk user IDs  
NEXT_PUBLIC_SUPER_ADMIN_IDS=user_1234567890
```

## 🔧 Optional Environment Variables

### **Redis Cache (Recommended)**
```env
# Significantly improves performance
REDIS_URL=redis://username:password@redis-host:6379
```

### **Tutor Access (Optional)**
```env
# Legacy fallback only - tutors are now managed through database
# Only needed if you want environment variable fallback when database fails
NEXT_PUBLIC_TUTOR_IDS=user_tutor1,user_tutor2,user_tutor3
```

### **File Services**
```env
# MinIO for file uploads and storage
MINIO_URL=https://your-minio-endpoint.com/
MINIO_KEY_ID=your-minio-access-key
MINIO_ACCESS_KEY=your-minio-secret-key

# Cloudinary for image management
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### **AI/ML Services**
```env
GOOGLE_GEMINI_API=your_google_gemini_api_key
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

### **Live Streaming**
```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-domain.livekit.cloud
```

## 🐳 Docker Compose Configuration

The `docker-compose.yml` file is pre-configured with all necessary environment variable placeholders. You can either:

### Option 1: Use .env file
Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql://user:pass@db:5432/cambright
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
# ... other variables
```

### Option 2: Override in docker-compose.override.yml
Create `docker-compose.override.yml`:
```yaml
version: '3.8'
services:
  web:
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/cambright
      - REDIS_URL=redis://redis:6379
      # ... other variables
```

## 🔒 Security Notes

1. **No Default Values**: The application will **fail to start** in production if required environment variables are missing
2. **Admin Access**: Admin and tutor access is controlled entirely through environment variables
3. **Redis**: If `REDIS_URL` is not provided, the application falls back to in-memory cache
4. **Environment Validation**: The application validates environment variables at startup

## 🏗️ Production Architecture

### Recommended Setup
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:3000"
    environment:
      # Your environment variables here
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: cambright
      POSTGRES_USER: cambright_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass your_redis_password
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 🚨 Troubleshooting

### Missing Environment Variables
```
Error: NEXT_PUBLIC_ADMIN_IDS environment variable is required in production
```
**Solution**: Add the missing environment variable to your Docker Compose configuration

### Redis Connection Failed
```
Warning: Failed to initialize Redis, falling back to memory cache
```
**Solution**: Check your `REDIS_URL` configuration or remove it to use memory cache only

### Database Connection Issues
```
Error: Can't reach database server
```
**Solution**: Verify your `DATABASE_URL` and ensure the database is accessible

## 📚 Additional Resources

- [Clerk Authentication Setup](https://clerk.com/docs)
- [Redis Configuration](https://redis.io/docs/getting-started/)
- [PostgreSQL Docker Setup](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🔄 Migration from Development

When migrating from development to production:

1. **Migrate Tutors**: Use the admin panel to migrate existing tutors from environment variables to the database
2. **Set Environment Variables**: Replace all development defaults with explicit production values for admin access
3. **Test Access**: Verify admin access with your production user IDs
4. **Database Setup**: Ensure tutors are properly configured in the database (primary method)
5. **Monitor Logs**: Check application logs for any missing required environment variables

### **Tutor System Architecture**
- **Primary**: Database-driven tutor management via admin panel
- **Fallback**: Environment variables (legacy system, only used when database fails)
- **Recommendation**: Manage all tutors through the admin panel database interface 