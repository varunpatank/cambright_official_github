// Next.js instrumentation hook
// This runs when the server starts up, before handling any requests

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import build-time detection utilities
    const { isBuildTime, logWithPhase } = await import('./lib/build-runtime-detector')
    
    // Skip initialization during build time
    if (isBuildTime()) {
      logWithPhase('Instrumentation hook called during build time - skipping server initialization', 'info')
      return
    }
    
    // Import and initialize server startup only at runtime
    logWithPhase('Instrumentation hook called at runtime - initializing server', 'info')
    const { initializeServer } = await import('./lib/server-startup')
    await initializeServer()
  }
}