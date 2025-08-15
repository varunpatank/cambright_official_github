import { Client } from 'minio'

let minioClientInstance: Client | null = null

function getMinioClient(): Client {
	if (!minioClientInstance) {
		if (!process.env.MINIO_URL) {
			throw new Error('MINIO_URL is required')
		}

		if (!process.env.MINIO_KEY_ID) {
			throw new Error('MINIO_KEY_ID is required')
		}

		if (!process.env.MINIO_ACCESS_KEY) {
			throw new Error('MINIO_ACCESS_KEY is required')
		}

		// Parse MinIO URL to extract endpoint and port
		const minioUrl = new URL(process.env.MINIO_URL)
		const endPoint = minioUrl.hostname
		const port = minioUrl.port ? parseInt(minioUrl.port) : (minioUrl.protocol === 'https:' ? 443 : 9000)
		const useSSL = minioUrl.protocol === 'https:'

		console.log(`Initializing MinIO client: ${endPoint}:${port} (SSL: ${useSSL})`);

		minioClientInstance = new Client({
			endPoint,
			port,
			useSSL,
			accessKey: process.env.MINIO_KEY_ID,
			secretKey: process.env.MINIO_ACCESS_KEY,
			// Add region for better compatibility
			region: 'us-east-1',
			// Use path-style addressing for MinIO
			pathStyle: true,
			// Set transport options for large file uploads
			transportAgent: undefined, // Let MinIO handle transport
		})
	}

	return minioClientInstance
}

export const minioClient = new Proxy({} as Client, {
	get(target, prop) {
		const client = getMinioClient()
		const value = client[prop as keyof Client]
		return typeof value === 'function' ? value.bind(client) : value
	}
})

// Bucket configuration - everything goes in the cambright bucket
export const BUCKET_NAME = 'cambright'

export const FOLDERS = {
	SCHOOLS: 'schools/',
	SCHOOL_IMAGES: 'school-images/',
	CHAPTER_ADMINS: 'chapter-admins/',
} as const

// Initialize the cambright bucket and folder structure
export async function initializeBuckets() {
	try {
		const exists = await minioClient.bucketExists(BUCKET_NAME)
		if (!exists) {
			await minioClient.makeBucket(BUCKET_NAME)
			console.log(`Created bucket: ${BUCKET_NAME}`)
		}
		
		// Initialize folder structure by creating index files
		await initializeFolders()
	} catch (error) {
		console.error('Error initializing MinIO bucket:', error)
		throw error
	}
}

// Initialize folder structure
async function initializeFolders() {
	try {
		// Create schools index
		const schoolsIndexExists = await objectExists(`${FOLDERS.SCHOOLS}index.json`)
		if (!schoolsIndexExists) {
			await uploadFile(BUCKET_NAME, `${FOLDERS.SCHOOLS}index.json`, JSON.stringify({
				schools: [],
				lastUpdated: new Date().toISOString(),
				totalCount: 0
			}, null, 2))
		}
		
		// Create chapter admins index
		const adminsIndexExists = await objectExists(`${FOLDERS.CHAPTER_ADMINS}index.json`)
		if (!adminsIndexExists) {
			await uploadFile(BUCKET_NAME, `${FOLDERS.CHAPTER_ADMINS}index.json`, JSON.stringify([], null, 2))
		}
	} catch (error) {
		console.error('Error initializing folders:', error)
	}
}

// Check if object exists
async function objectExists(objectName: string): Promise<boolean> {
	try {
		await minioClient.statObject(BUCKET_NAME, objectName)
		return true
	} catch (error) {
		return false
	}
}

// Upload file to MinIO
export async function uploadFile(
	bucketName: string,
	objectName: string,
	data: Buffer | string,
	metaData?: Record<string, string>
) {
	try {
		console.log(`MinIO upload attempt: bucket=${bucketName}, object=${objectName}, dataSize=${data.length}`);
		
		// Ensure bucket exists first
		console.log(`Checking if bucket ${bucketName} exists...`);
		const bucketExists = await minioClient.bucketExists(bucketName);
		console.log(`Bucket ${bucketName} exists: ${bucketExists}`);
		
		if (!bucketExists) {
			console.log(`Creating bucket: ${bucketName}`);
			try {
				await minioClient.makeBucket(bucketName);
				console.log(`Successfully created bucket: ${bucketName}`);
			} catch (createError: any) {
				console.error(`Failed to create bucket ${bucketName}:`, createError);
				throw new Error(`Cannot create bucket '${bucketName}': ${createError.message}`);
			}
		}
		
		// For large files, explicitly set the size parameter
		const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);
		console.log(`Upload size: ${size} bytes`);
		
		// Log metadata for debugging
		console.log(`Upload metadata:`, metaData);
		
		console.log(`Starting putObject operation...`);
		console.log(`MinIO URL: ${process.env.MINIO_URL}`);
		
		// Use putObject with explicit size and proper options for large files
		const uploadOptions: any = {
			'Content-Type': metaData?.['Content-Type'] || 'application/octet-stream'
		};
		
		// Add all metadata to upload options
		if (metaData) {
			Object.keys(metaData).forEach(key => {
				if (key !== 'Content-Type') {
					uploadOptions[key] = metaData[key];
				}
			});
		}
		
		// For very large files, optimize multipart upload settings
		if (size > 50 * 1024 * 1024) { // 50MB
			console.log(`Using multipart upload for large file (${(size / (1024 * 1024)).toFixed(2)}MB)...`);
			
			// Optimize part size based on file size
			let partSize;
			if (size > 1024 * 1024 * 1024) { // > 1GB
				partSize = 128 * 1024 * 1024; // 128MB parts for very large files
			} else if (size > 500 * 1024 * 1024) { // > 500MB
				partSize = 64 * 1024 * 1024; // 64MB parts for large files
			} else {
				partSize = 32 * 1024 * 1024; // 32MB parts for medium files
			}
			
			uploadOptions.partSize = partSize;
			console.log(`Using part size: ${(partSize / (1024 * 1024))}MB`);
		}
		
		console.log(`About to call putObject with:`, {
			bucket: bucketName,
			object: objectName,
			size: size,
			contentType: uploadOptions['Content-Type']
		});

		try {
			console.log(`Starting MinIO putObject operation...`);
			
			// For very large files, add additional upload options
			if (size > 500 * 1024 * 1024) { // > 500MB
				console.log('Using optimized settings for very large file upload...');
				// Add retry options for large files
				uploadOptions.retries = 3;
				uploadOptions.retryDelayOptions = {
					base: 1000, // Start with 1 second delay
					maxDelay: 10000 // Max 10 seconds
				};
			}
			
			await minioClient.putObject(bucketName, objectName, data, size, uploadOptions);
			console.log(`✅ MinIO putObject completed successfully`);
		} catch (putObjectError: any) {
			console.error('❌ Detailed putObject error:', {
				message: putObjectError.message,
				code: putObjectError.code,
				statusCode: putObjectError.statusCode,
				name: putObjectError.name,
				requestId: putObjectError.requestId,
				region: putObjectError.region,
				bucketName: putObjectError.bucketName,
				resource: putObjectError.resource,
				retryable: putObjectError.retryable
			});
			
			// Provide more specific error message
			let errorMessage = `MinIO upload failed for ${objectName}`;
			if (putObjectError.code === 'AccessDenied') {
				errorMessage = `Access denied to MinIO bucket '${bucketName}'. Check credentials and permissions.`;
			} else if (putObjectError.code === 'NoSuchBucket') {
				errorMessage = `MinIO bucket '${bucketName}' does not exist.`;
			} else if (putObjectError.message?.includes('timeout')) {
				errorMessage = `Upload timeout for ${objectName}. File might be too large or connection is slow.`;
			} else if (putObjectError.message?.includes('ECONNREFUSED')) {
				errorMessage = `Cannot connect to MinIO server at ${process.env.MINIO_URL}`;
			} else if (putObjectError.code === 'RequestTimeout' || putObjectError.code === 'RequestTimeTooSkewed') {
				errorMessage = `Upload timeout for large file ${objectName}. Please try again or upload a smaller file.`;
			}
			
			throw new Error(errorMessage);
		}
		
		console.log(`MinIO upload successful: ${bucketName}/${objectName}`);
		
		// Try to set public read policy for the uploaded object
		try {
			// For video files, try to make them publicly readable
			if (objectName.includes('video') || objectName.includes('chapters/videos/')) {
				console.log('Attempting to set public read access for video...');
				
				// Try to set a public read policy for this specific object
				const publicPolicy = {
					Version: '2012-10-17',
					Statement: [{
						Effect: 'Allow',
						Principal: { AWS: ['*'] },
						Action: ['s3:GetObject'],
						Resource: [`arn:aws:s3:::${bucketName}/${objectName}`]
					}]
				};
				
				try {
					await minioClient.setBucketPolicy(bucketName, JSON.stringify(publicPolicy));
					console.log('✅ Public read access set for video');
				} catch (policySetError: any) {
					console.log('Could not set bucket policy (trying alternative method):', policySetError.message);
				}
			}
		} catch (policyError) {
			console.log('Could not set public policy (this is normal):', policyError);
		}
		
		// Generate a presigned URL for access (valid for 7 days)
		try {
			console.log('Generating presigned URL for video access...');
			const presignedUrl = await minioClient.presignedGetObject(bucketName, objectName, 7 * 24 * 60 * 60); // 7 days
			console.log(`Generated presigned URL: ${presignedUrl}`);
			
			return {
				success: true,
				url: presignedUrl,
			}
		} catch (presignError) {
			console.log('Could not generate presigned URL, using direct URL:', presignError);
			
			// Fallback to direct URL if presigned URL fails
			const baseUrl = process.env.MINIO_URL!.endsWith('/') 
				? process.env.MINIO_URL!.slice(0, -1) 
				: process.env.MINIO_URL!
			
			const finalUrl = `${baseUrl}/${bucketName}/${objectName}`;
			console.log(`Generated direct URL: ${finalUrl}`);
			
			return {
				success: true,
				url: finalUrl,
			}
		}
	} catch (error: any) {
		console.error('MinIO upload error - Full details:', error);
		
		// Extract all possible error information
		const errorInfo = {
			message: error.message || 'Unknown error',
			code: error.code || error.statusCode || 'Unknown',
			statusCode: error.statusCode,
			region: error.region,
			bucketName: error.bucketName,
			resource: error.resource,
			requestId: error.requestId,
			retryable: error.retryable,
			name: error.name,
			stack: error.stack
		};
		
		console.error('Extracted error info:', errorInfo);
		
		// Create a comprehensive error message
		let errorMessage = error.message || 'MinIO upload failed';
		
		// Add status code if available
		if (error.statusCode) {
			errorMessage += ` (Status: ${error.statusCode})`;
		}
		
		// Add specific error code if available
		if (error.code && error.code !== 'Unknown') {
			errorMessage += ` (Code: ${error.code})`;
		}
		
		// Check for specific error patterns and enhance the message
		if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect ECONNREFUSED')) {
			throw new Error(`Cannot connect to MinIO server at ${process.env.MINIO_URL}. Check if MinIO is running and accessible.`);
		} else if (errorMessage.includes('NoSuchBucket')) {
			throw new Error(`MinIO bucket '${bucketName}' does not exist and could not be created. Check bucket permissions.`);
		} else if (errorMessage.includes('BucketAlreadyOwnedByYou')) {
			throw new Error(`Bucket creation race condition. Please retry the upload.`);
		} else if (errorMessage.includes('AccessDenied') || errorMessage.includes('InvalidAccessKeyId')) {
			throw new Error(`Access denied to MinIO bucket '${bucketName}'. Check your credentials and bucket permissions.`);
		} else if (errorMessage.includes('SignatureDoesNotMatch')) {
			throw new Error(`MinIO authentication failed. Check your secret key.`);
		} else if (errorMessage.includes('RequestTimeout') || errorMessage.includes('timeout')) {
			throw new Error(`Upload timed out. The file may be too large or the connection is slow.`);
		} else if (errorMessage.includes('EntityTooLarge')) {
			throw new Error(`File is too large for MinIO upload. Check size limits.`);
		} else if (errorMessage.includes('InvalidArgument')) {
			throw new Error(`Invalid upload parameters. Check file name and metadata.`);
		} else {
			// Include bucket and object name in generic errors for better debugging
			throw new Error(`${errorMessage} (Bucket: ${bucketName}, Object: ${objectName})`);
		}
	}
}

// Get file from MinIO
export async function getFile(bucketName: string, objectName: string) {
	try {
		const stream = await minioClient.getObject(bucketName, objectName)
		return stream
	} catch (error) {
		console.error('Error getting file from MinIO:', error)
		throw error
	}
}

// Delete file from MinIO
export async function deleteFile(bucketName: string, objectName: string) {
	try {
		await minioClient.removeObject(bucketName, objectName)
		return { success: true }
	} catch (error) {
		console.error('Error deleting file from MinIO:', error)
		throw error
	}
}

// List objects in bucket
export async function listObjects(bucketName: string, prefix?: string) {
	try {
		const objects: any[] = []
		const stream = minioClient.listObjects(bucketName, prefix)
		
		return new Promise((resolve, reject) => {
			stream.on('data', (obj) => objects.push(obj))
			stream.on('end', () => resolve(objects))
			stream.on('error', reject)
		})
	} catch (error) {
		console.error('Error listing objects from MinIO:', error)
		throw error
	}
}

// Get presigned URL for file access
export async function getPresignedUrl(
	bucketName: string,
	objectName: string,
	expiry: number = 24 * 60 * 60 // 24 hours
) {
	try {
		const url = await minioClient.presignedGetObject(bucketName, objectName, expiry)
		return url
	} catch (error) {
		console.error('Error getting presigned URL:', error)
		throw error
	}
} 