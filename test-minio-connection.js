require('dotenv').config();

const { Client } = require('minio');

async function testMinIOConnection() {
    console.log('Testing MinIO connection...');
    
    const minioUrl = process.env.MINIO_URL;
    console.log('MINIO_URL:', minioUrl);
    console.log('MINIO_KEY_ID:', process.env.MINIO_KEY_ID);
    console.log('MINIO_ACCESS_KEY exists:', !!process.env.MINIO_ACCESS_KEY);
    
    if (!minioUrl || !process.env.MINIO_KEY_ID || !process.env.MINIO_ACCESS_KEY) {
        console.error('Missing required environment variables');
        return;
    }
    
    try {
        // Parse MinIO URL to extract endpoint and port
        const url = new URL(minioUrl);
        const endPoint = url.hostname;
        const port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 9000);
        const useSSL = url.protocol === 'https:';
        
        console.log(`Connecting to: ${endPoint}:${port} (SSL: ${useSSL})`);
        
        const minioClient = new Client({
            endPoint,
            port,
            useSSL,
            accessKey: process.env.MINIO_KEY_ID,
            secretKey: process.env.MINIO_ACCESS_KEY,
            region: 'us-east-1',
            pathStyle: true,
        });
        
        // Test connection by listing buckets
        console.log('Testing connection by listing buckets...');
        const buckets = await minioClient.listBuckets();
        console.log('Connection successful! Buckets:', buckets.map(b => b.name));
        
        // Check if cambright bucket exists
        const bucketExists = buckets.some(b => b.name === 'cambright');
        console.log('cambright bucket exists:', bucketExists);
        
        if (!bucketExists) {
            console.log('Creating cambright bucket...');
            await minioClient.makeBucket('cambright');
            console.log('Bucket created successfully');
        }
        
        // Test a small upload
        console.log('Testing small file upload...');
        const testData = Buffer.from('test content');
        const testKey = 'test/test-file.txt';
        
        await minioClient.putObject('cambright', testKey, testData);
        console.log('Small file upload successful');
        
        // Clean up test file
        await minioClient.removeObject('cambright', testKey);
        console.log('Test file cleaned up');
        
        console.log('✅ All MinIO tests passed!');
        
    } catch (error) {
        console.error('❌ MinIO connection failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            name: error.name
        });
    }
}

testMinIOConnection();
