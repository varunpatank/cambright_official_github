// Test large file upload limits
export const runtime = 'nodejs'
export const maxDuration = 1800; // 30 minutes
export const dynamic = 'force-dynamic';
// Note: Body size limits should be configured in next.config.js
const MAX_BODY_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Large File Upload Test ===');
    
    // Check content length
    const contentLength = request.headers.get('content-length');
    console.log(`Content-Length header: ${contentLength}`);
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const sizeInMB = sizeInBytes / (1024 * 1024);
      const sizeInGB = sizeInBytes / (1024 * 1024 * 1024);
      
      console.log(`Request size: ${sizeInMB.toFixed(2)} MB (${sizeInGB.toFixed(2)} GB)`);
      console.log(`Server limit: ${(MAX_BODY_SIZE / (1024 * 1024 * 1024))} GB`);
      console.log(`Within limit: ${sizeInBytes <= MAX_BODY_SIZE}`);
      
      if (sizeInBytes > MAX_BODY_SIZE) {
        return NextResponse.json({ 
          error: 'File too large',
          requestSize: `${sizeInGB.toFixed(2)} GB`,
          limit: `${(MAX_BODY_SIZE / (1024 * 1024 * 1024))} GB`,
          withinLimit: false
        }, { status: 413 })
      }
    }
    
    console.log('Attempting to parse FormData...');
    const startTime = Date.now();
    
    try {
      const formData = await request.formData();
      const parseTime = Date.now() - startTime;
      console.log(`FormData parsed successfully in ${parseTime}ms`);
      
      const files = formData.getAll('files') as File[];
      console.log(`Found ${files.length} files`);
      
      if (files.length > 0) {
        const file = files[0];
        const fileSizeGB = file.size / (1024 * 1024 * 1024);
        console.log(`First file: ${file.name}, size: ${fileSizeGB.toFixed(2)} GB, type: ${file.type}`);
        
        return NextResponse.json({
          success: true,
          message: 'Large file upload test successful',
          fileInfo: {
            name: file.name,
            size: file.size,
            sizeGB: fileSizeGB.toFixed(2),
            type: file.type
          },
          parseTime: `${parseTime}ms`
        });
      }
      
      return NextResponse.json({ error: 'No files found' }, { status: 400 });
      
    } catch (parseError: any) {
      const parseTime = Date.now() - startTime;
      console.error('FormData parsing failed:', parseError);
      
      return NextResponse.json({
        error: 'FormData parsing failed',
        details: parseError.message,
        parseTime: `${parseTime}ms`,
        errorType: parseError.constructor.name
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('Upload test error:', error);
    return NextResponse.json({ 
      error: 'Upload test failed',
      details: error.message 
    }, { status: 500 });
  }
}
