/**
 * Test script to debug asset upload issues
 * Run this to test the asset upload endpoint
 */

async function testAssetUpload() {
  try {
    // Create a simple test image blob
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple rectangle
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('TEST', 20, 50);
    
    // Convert to blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
    
    // Create form data
    const formData = new FormData();
    formData.append('file', blob, 'test-image.png');
    formData.append('assetType', 'POST_IMAGE');
    
    console.log('Testing asset upload...');
    
    const response = await fetch('/api/assets/upload', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('Upload successful!', result);
      return result;
    } else {
      console.error('Upload failed:', responseText);
      return null;
    }
    
  } catch (error) {
    console.error('Error testing upload:', error);
    return null;
  }
}

// Add button to test
if (typeof document !== 'undefined') {
  const testButton = document.createElement('button');
  testButton.textContent = 'Test Asset Upload';
  testButton.onclick = testAssetUpload;
  testButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 5px; cursor: pointer;';
  document.body.appendChild(testButton);
}

export { testAssetUpload };
