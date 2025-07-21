# Asset Management System

## Overview

The Asset Management System provides secure, key-based access to public assets uploaded by users. It prevents IDOR (Insecure Direct Object Reference) vulnerabilities by using unique, non-guessable keys instead of exposing direct MinIO paths.

## Components

### 1. AssetManager Service (`lib/asset-manager.ts`)

Core service class that handles:
- **Asset Upload**: Stores files in MinIO and creates database records
- **Asset Retrieval**: Retrieves files using secure keys
- **Asset Deletion**: Removes files from both MinIO and database
- **Key Generation**: Creates unique, secure keys for asset access
- **Cleanup**: Removes orphaned assets not referenced by any entity

#### Key Methods:
- `uploadAsset(params)` - Upload and store asset
- `getAsset(key)` - Retrieve asset by key
- `deleteAsset(key)` - Delete asset and cleanup
- `assetExists(key)` - Check if asset exists
- `cleanupOrphanedAssets()` - Remove unused assets

### 2. API Endpoints

#### Upload Endpoint (`/api/assets/upload`)
- **Method**: POST
- **Purpose**: Upload new assets
- **Authentication**: Required
- **Validation**: File size, type, and security checks
- **Returns**: Asset key and API URL

#### Retrieval Endpoint (`/api/assets/[key]`)
- **Method**: GET
- **Purpose**: Serve assets by key
- **Authentication**: Not required (public assets)
- **Features**: Caching headers, content type detection
- **Security**: Key format validation

#### Deletion Endpoint (`/api/assets/[key]`)
- **Method**: DELETE
- **Purpose**: Delete assets
- **Authentication**: Required
- **Authorization**: Owner or admin only
- **Cleanup**: Removes from both MinIO and database

#### Cleanup Endpoint (`/api/assets/cleanup`)
- **Method**: POST
- **Purpose**: Remove orphaned assets
- **Authentication**: Admin only
- **Returns**: Count of cleaned assets

#### List Endpoint (`/api/assets/list`)
- **Method**: GET
- **Purpose**: List assets by type (admin only)
- **Authentication**: Admin only
- **Features**: Pagination, filtering by asset type

## Security Features

### 1. Key-Based Access
- Assets accessed only through unique keys
- Keys follow format: `{timestamp}_{64-char-hex}`
- No direct MinIO path exposure

### 2. Access Control
- Upload: Authenticated users only
- Retrieval: Public (but requires valid key)
- Deletion: Owner or admin only
- Cleanup/List: Admin only

### 3. File Validation
- MIME type checking per asset type
- File size limits (10MB max)
- Dangerous file extension blocking
- Security header enforcement

### 4. IDOR Prevention
- No sequential IDs or predictable paths
- Cryptographically secure key generation
- Database lookup required for all access

## Asset Types

The system supports the following asset types:

- `SCHOOL_IMAGE` - School profile images
- `SCHOOL_BANNER` - School banner images  
- `POST_IMAGE` - School post images
- `COURSE_IMAGE` - Course thumbnail images
- `CHAPTER_VIDEO` - Chapter video content
- `NOTE_ATTACHMENT` - Note attachments

## Storage Structure

Assets are organized in MinIO with the following structure:

```
assets/
├── schools/
│   ├── images/
│   └── banners/
├── posts/
│   └── images/
├── courses/
│   └── images/
├── chapters/
│   └── videos/
└── notes/
    └── attachments/
```

## Database Schema

The `AssetManager` model tracks:
- `key` - Unique public identifier
- `fileName` - Original filename
- `mimeType` - File MIME type
- `fileSize` - File size in bytes
- `minioPath` - Internal MinIO location
- `uploadedBy` - User who uploaded
- `assetType` - Type of asset
- `isActive` - Soft delete flag

## Usage Examples

### Frontend Upload
```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('assetType', 'SCHOOL_IMAGE')

const response = await fetch('/api/assets/upload', {
  method: 'POST',
  body: formData
})

const { asset } = await response.json()
// Use asset.url to display the image
```

### Asset Display
```html
<img src="/api/assets/abc123_def456..." alt="School Image" />
```

### Asset Deletion
```javascript
await fetch(`/api/assets/${assetKey}`, {
  method: 'DELETE'
})
```

## Error Handling

The system provides comprehensive error handling:
- **400**: Invalid requests (bad key format, missing file)
- **401**: Authentication required
- **403**: Insufficient permissions
- **404**: Asset not found
- **500**: Server errors with logging

## Performance Optimizations

1. **Caching**: Long-term cache headers for assets
2. **Streaming**: Direct file streaming from MinIO
3. **Indexing**: Database indexes on key and asset type
4. **Cleanup**: Automated orphaned asset removal

## Testing

The system includes comprehensive tests:
- Unit tests for AssetManager service
- Integration tests for API endpoints
- Error handling validation
- Security feature verification

## Migration Support

The system supports migrating existing assets:
- Identifies assets with direct paths
- Creates AssetManager records
- Updates database references
- Validates migration success

## Monitoring

Key metrics to monitor:
- Asset upload success rate
- Asset retrieval performance
- Storage usage by type
- Orphaned asset count
- Error rates by endpoint

## Future Enhancements

Potential improvements:
- CDN integration for better performance
- Image resizing and optimization
- Bulk upload capabilities
- Asset versioning
- Advanced analytics and reporting