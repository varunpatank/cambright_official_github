#!/usr/bin/env tsx
// Test script to verify startup flow is working correctly

import { getServerStartupState, getStartupReport, isServerReady } from '../lib/server-startup'

async function testStartupFlow() {
  console.log('🧪 Testing Startup Flow...\n')
  
  // Test server startup state
  const startupState = getServerStartupState()
  console.log('📊 Server Startup State:')
  console.log(`  - Initialized: ${startupState.isInitialized}`)
  console.log(`  - Ready: ${isServerReady()}`)
  console.log(`  - Initialization Time: ${startupState.initializationTime}ms`)
  console.log(`  - Has Error: ${!!startupState.initializationError}`)
  
  if (startupState.initializationError) {
    console.log(`  - Error: ${startupState.initializationError.message}`)
  }
  
  // Test startup report
  const report = getStartupReport()
  if (report) {
    console.log('\n📋 Startup Report:')
    console.log(`  - Overall Status: ${report.overall}`)
    console.log(`  - Total Checks: ${report.checks.length}`)
    console.log(`  - Critical Failures: ${report.criticalFailures}`)
    console.log(`  - Warnings: ${report.warnings}`)
    console.log(`  - Total Time: ${report.totalTime}ms`)
    
    console.log('\n🔧 Individual Check Results:')
    report.checks.forEach(check => {
      const emoji = check.status === 'healthy' ? '✅' : 
                    check.status === 'warning' ? '⚠️' : '❌'
      console.log(`  ${emoji} ${check.service} (${check.responseTime}ms)`)
      if (check.status !== 'healthy') {
        console.log(`     └─ ${check.message}`)
      }
    })
  } else {
    console.log('\n❌ No startup report available')
  }
  
  // Test health API endpoint
  console.log('\n🌐 Testing Health API...')
  try {
    const response = await fetch('http://localhost:3000/api/health?detailed=true')
    const data = await response.json()
    
    console.log(`  - Status Code: ${response.status}`)
    console.log(`  - Response Status: ${data.overall || data.status}`)
    console.log(`  - Server Ready: ${data.serverReady}`)
    
    if (data.serverStartupTime) {
      console.log(`  - Server Startup Time: ${data.serverStartupTime}ms`)
    }
  } catch (error) {
    console.log(`  - API Test Failed: ${error}`)
  }
  
  console.log('\n✅ Startup flow test completed!')
}

// Run the test
testStartupFlow().catch(console.error)