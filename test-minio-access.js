require('dotenv').config();

const { Client } = require('minio');

async function testMinioAccess() {
    try {
        const minioUrl = process.env.MINIO_URL;
        const url = new URL(minioUrl);
        const endPoint = url.hostname;
        const port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 9000);
        const useSSL = url.protocol === 'https:';
        
        console.log(`Testing MinIO at: ${endPoint}:${port} (SSL: ${useSSL})`);
        
        const minioClient = new Client({
            endPoint,
            port,
            useSSL,
            accessKey: process.env.MINIO_KEY_ID,
            secretKey: process.env.MINIO_ACCESS_KEY,
            region: 'us-east-1',
            pathStyle: true,
        });
        
        // Test basic connection
        console.log('Testing bucket list...');
        const buckets = await minioClient.listBuckets();
        console.log('✅ Connection successful. Buckets:', buckets.map(b => b.name));
        
        // Test bucket policy
        console.log('Testing bucket policy for cambright...');
        try {
            const policy = await minioClient.getBucketPolicy('cambright');
            console.log('Bucket policy:', policy);
        } catch (policyError) {
            console.log('No bucket policy set (bucket might be private):', policyError.message);
        }
        
        // Test presigned URL generation
        console.log('Testing presigned URL generation...');
        try {
            // Try to generate a presigned URL for a test object
            const testUrl = await minioClient.presignedGetObject('cambright', 'test/test.txt', 60);
            console.log('✅ Presigned URL generated:', testUrl);
        } catch (presignError) {
            console.log('❌ Presigned URL generation failed:', presignError.message);
        }
        
    } catch (error) {
        console.error('❌ MinIO test failed:', error.message);
    }
}

testMinioAccess();
