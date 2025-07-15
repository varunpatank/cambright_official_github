# UploadThing to MinIO Migration Guide

## Overview

This project has been migrated from UploadThing to MinIO for file uploads. This change provides:

- **Full control** over file storage infrastructure
- **Cost savings** compared to third-party services
- **Better integration** with existing MinIO setup
- **Improved performance** for file serving
- **Enhanced security** and data ownership

## What Changed

### File Upload System
- **Before**: Used UploadThing hosted service
- **After**: Uses self-hosted MinIO object storage

### API Endpoints
- **Before**: `/api/uploadthing/*`
- **After**: `/api/minio-upload`

### Components
- **Before**: `UploadDropzone` from `@uploadthing/react`
- **After**: `MinioFileUpload` custom component

### Configuration
- **Before**: Required `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`
- **After**: Uses existing `MINIO_URL`, `MINIO_KEY_ID`, and `MINIO_ACCESS_KEY`

## Migration Process

### 1. Automatic File Migration

Run the migration script to move existing files from UploadThing to MinIO:

```bash
pnpm migrate:uploadthing
```

This script will:
- Scan the database for UploadThing URLs (`utfs.io`)
- Download files from UploadThing
- Upload them to MinIO with proper organization
- Update database records with new MinIO URLs
- Add metadata for tracking migration

### 2. Environment Variables

Remove UploadThing environment variables from your `.env`:
```bash
# Remove these:
# UPLOADTHING_SECRET=sk_...
# UPLOADTHING_APP_ID=...
```

Ensure MinIO variables are configured:
```bash
MINIO_URL=http://localhost:9000/
MINIO_KEY_ID=your-access-key
MINIO_ACCESS_KEY=your-secret-key
```

### 3. Component Updates

All file upload components have been automatically updated:
- `components/file-upload.tsx`
- `components/file-upload-notes.tsx` 
- `components/file-uploadertwo.tsx`

### 4. Package Dependencies

UploadThing packages have been removed:
- `@uploadthing/react`
- `uploadthing`

## File Organization in MinIO

Files are organized in the following structure:

```
cambright/
├── uploads/
│   ├── courses/
│   │   ├── images/          # Course images
│   │   └── attachments/     # Course attachments
│   ├── rooms/
│   │   └── images/          # Room images
│   ├── chapters/
│   │   └── videos/          # Chapter videos
│   ├── notes/
│   │   └── attachments/     # Note attachments
│   ├── schools/
│   │   └── posts/           # School post images
│   ├── messages/            # Message files
│   └── migrated/            # Fallback for unknown types
└── schools/                 # School data (existing)
```

## Supported File Types

### By Endpoint:

| Endpoint | File Types | Max Size | Max Count |
|----------|------------|----------|-----------|
| `courseImage` | Images (JPEG, PNG, WebP) | 4MB | 1 |
| `roomImage` | Images (JPEG, PNG, WebP) | 4MB | 1 |
| `schoolPostImage` | Images (JPEG, PNG, WebP) | 4MB | 1 |
| `messageFile` | Images, PDF, Text | 512MB | 500 |
| `courseAttachment` | Images, Video, PDF, Text | 512MB | 1 |
| `noteAttachment` | Images, Video, PDF, Text | 512MB | 1 |
| `chapterVideo` | Video (MP4, WebM, AVI, MOV) | 512GB | 1 |

## API Usage

### Upload Files

```javascript
const formData = new FormData()
formData.append('files', file)

const response = await fetch('/api/minio-upload?endpoint=courseImage', {
  method: 'POST',
  body: formData
})

const result = await response.json()
// result.files[0].url contains the MinIO URL
```

### Component Usage

```jsx
import { MinioFileUpload } from '@/components/minio-file-upload'

function MyComponent() {
  const [fileUrl, setFileUrl] = useState('')

  return (
    <MinioFileUpload
      endpoint="courseImage"
      onChange={setFileUrl}
      className="custom-styles"
    />
  )
}
```

## Health Checks

The startup health checks now verify MinIO instead of UploadThing:

```bash
pnpm health:check
```

This will:
- Test MinIO connectivity
- Verify bucket access
- Check file upload permissions

## Troubleshooting

### Common Issues

1. **Migration fails with download errors**
   - Some UploadThing URLs may be expired
   - Check network connectivity
   - Re-run migration for failed files

2. **MinIO connection errors**
   - Verify MinIO service is running
   - Check environment variables
   - Ensure bucket exists and is accessible

3. **File upload failures**
   - Check file size limits
   - Verify file type is supported
   - Ensure user has proper permissions

### Rollback (if needed)

If you need to rollback to UploadThing:

1. Restore UploadThing dependencies:
```bash
pnpm add @uploadthing/react uploadthing
```

2. Restore environment variables in `.env`

3. Revert component imports from MinIO back to UploadThing

4. Update health checks back to UploadThing

## Performance Benefits

### Upload Speed
- **Direct upload** to local/private MinIO instance
- **No third-party latency** 
- **Concurrent uploads** supported

### File Serving
- **CDN integration** possible with MinIO
- **Presigned URLs** for secure access
- **Better caching** control

### Cost Savings
- **No per-GB fees** like UploadThing
- **No bandwidth charges**
- **Self-hosted infrastructure**

## Security Improvements

### Data Ownership
- **Full control** over file storage
- **No third-party data access**
- **Compliance-friendly** setup

### Access Control
- **Granular permissions** via MinIO policies
- **Secure presigned URLs** with expiration
- **Audit logging** of file operations

## Monitoring

MinIO provides comprehensive monitoring:

1. **MinIO Console**: Web interface for bucket management
2. **Prometheus metrics**: For monitoring and alerting
3. **Audit logs**: Track all file operations
4. **Health checks**: Integrated in application startup

Access MinIO Console at: `http://localhost:9001` (if enabled)

## Next Steps

1. **Run migration**: Execute `pnpm migrate:uploadthing`
2. **Test uploads**: Verify all file upload functionality
3. **Monitor logs**: Check for any migration issues
4. **Update CI/CD**: Ensure MinIO is available in deployment
5. **Backup strategy**: Set up MinIO backup procedures

## Support

For issues with the migration:
1. Check application logs for detailed error messages
2. Verify MinIO service status and connectivity
3. Review migration script output for failed files
4. Test file upload endpoints manually 