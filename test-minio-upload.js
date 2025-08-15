// Test script to debug MinIO upload
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testMinioUpload() {
  try {
    console.log('Testing MinIO upload endpoint...');
    
    // Create a simple text file for testing
    const testContent = 'This is a test video file';
    const fileName = 'test-video.mp4';
    
    // Create form data
    const formData = new FormData();
    formData.append('files', Buffer.from(testContent), {
      filename: fileName,
      contentType: 'video/mp4'
    });
    
    console.log('Sending request to MinIO upload endpoint...');
    
    // Make request to local endpoint
    const response = await fetch('http://localhost:3000/api/minio-upload?endpoint=chapterVideo', {
      method: 'POST',
      body: formData,
      headers: {
        // Add any auth headers if needed
        ...formData.getHeaders()
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Parsed response:', JSON.stringify(responseJson, null, 2));
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError.message);
      console.log('Response was:', responseText);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  testMinioUpload();
}

module.exports = { testMinioUpload };
