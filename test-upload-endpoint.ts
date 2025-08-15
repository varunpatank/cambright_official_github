import { NextRequest } from 'next/server'
import { POST } from '../app/api/assets/upload/route'

// Mock FormData for testing
const mockFile = {
  name: 'test-image.jpg',
  size: 100000,
  type: 'image/jpeg',
  arrayBuffer: async () => new ArrayBuffer(100000)
}

const mockFormData = new FormData()
mockFormData.append('file', mockFile as any)
mockFormData.append('assetType', 'SCHOOL_IMAGE')

// Mock Request
const mockRequest = {
  formData: async () => mockFormData
} as NextRequest

// Mock authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: () => ({ userId: 'test-user-123' })
}))

async function testUploadEndpoint() {
  try {
    console.log('Testing upload endpoint...')
    
    // This will test the validation logic without actually uploading
    const response = await POST(mockRequest)
    const result = await response.json()
    
    console.log('Upload test result:', result)
    console.log('Response status:', response.status)
    
    if (response.status === 200) {
      console.log('✅ Upload endpoint is working!')
    } else {
      console.log('❌ Upload endpoint has issues:', result)
    }
    
  } catch (error) {
    console.error('❌ Upload test failed:', error)
  }
}

testUploadEndpoint()
