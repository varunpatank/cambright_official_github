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

		minioClientInstance = new Client({
			endPoint,
			port,
			useSSL,
			accessKey: process.env.MINIO_KEY_ID,
			secretKey: process.env.MINIO_ACCESS_KEY,
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
		await minioClient.putObject(bucketName, objectName, data, undefined, metaData)
		return {
			success: true,
			url: `${process.env.MINIO_URL}${bucketName}/${objectName}`,
		}
	} catch (error) {
		console.error('Error uploading file to MinIO:', error)
		throw error
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