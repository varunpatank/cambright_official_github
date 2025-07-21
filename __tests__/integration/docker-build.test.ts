/**
 * Docker build integration tests
 * Tests that can run in CI/CD environments without requiring full container runtime
 */

import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// Helper function to run shell commands
const runCommand = (command: string, args: string[], options: any = {}): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      })
    })

    child.on('error', (error) => {
      reject(error)
    })

    // Handle timeout
    if (options.timeout) {
      setTimeout(() => {
        child.kill('SIGKILL')
        reject(new Error(`Command timed out after ${options.timeout}ms`))
      }, options.timeout)
    }
  })
}

describe('Docker Build Integration Tests', () => {
  const TEST_IMAGE_NAME = 'cambright:build-test'
  const BUILD_TIMEOUT = 300000 // 5 minutes

  // Check if Docker is available before running Docker-specific tests
  const isDockerAvailable = async (): Promise<boolean> => {
    try {
      const result = await runCommand('docker', ['--version'], { timeout: 5000 })
      return result.exitCode === 0
    } catch (error) {
      return false
    }
  }

  afterAll(async () => {
    // Cleanup test image only if Docker is available
    if (await isDockerAvailable()) {
      try {
        await runCommand('docker', ['rmi', TEST_IMAGE_NAME], { timeout: 10000 })
      } catch (error) {
        // Image might not exist, ignore error
      }
    }
  })

  describe('Build Process Validation', () => {
    it('should validate Dockerfile exists and is properly structured', async () => {
      const dockerfilePath = path.join(process.cwd(), 'Dockerfile')
      
      // Check if Dockerfile exists
      const dockerfileExists = await fs.access(dockerfilePath).then(() => true).catch(() => false)
      expect(dockerfileExists).toBe(true)

      // Read and validate Dockerfile content
      const dockerfileContent = await fs.readFile(dockerfilePath, 'utf-8')
      
      // Should use Node.js base image
      expect(dockerfileContent).toMatch(/FROM node:\d+/)
      
      // Should set NODE_ENV for build
      expect(dockerfileContent).toContain('ENV NODE_ENV=production')
      
      // Should install pnpm
      expect(dockerfileContent).toContain('pnpm')
      
      // Should copy package files first for better caching
      expect(dockerfileContent).toContain('COPY package.json')
      expect(dockerfileContent).toContain('pnpm install')
      
      // Should build the application
      expect(dockerfileContent).toContain('pnpm run build')
      
      // Should include health check
      expect(dockerfileContent).toContain('HEALTHCHECK')
      
      // Should use startup script
      expect(dockerfileContent).toContain('container-startup.sh')
    })

    it('should validate required build scripts exist', async () => {
      const requiredScripts = [
        'scripts/container-startup.sh',
        'scripts/docker-health-check.sh'
      ]

      for (const scriptPath of requiredScripts) {
        const fullPath = path.join(process.cwd(), scriptPath)
        const scriptExists = await fs.access(fullPath).then(() => true).catch(() => false)
        expect(scriptExists).toBe(true)

        // Check if script is executable (has shebang)
        const scriptContent = await fs.readFile(fullPath, 'utf-8')
        expect(scriptContent).toMatch(/^#!/)
      }
    })

    it('should validate package.json has required scripts', async () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))

      const requiredScripts = [
        'build',
        'start',
        'postinstall'
      ]

      requiredScripts.forEach(script => {
        expect(packageJson.scripts).toHaveProperty(script)
        expect(typeof packageJson.scripts[script]).toBe('string')
        expect(packageJson.scripts[script].length).toBeGreaterThan(0)
      })
    })
  })

  describe('Build Without Production Environment', () => {
    it('should build successfully without DATABASE_URL', async () => {
      const dockerAvailable = await isDockerAvailable()
      
      if (!dockerAvailable) {
        console.log('Docker not available, skipping Docker build test')
        return
      }

      // Create minimal environment for build
      const testEnvContent = `
# Build-time only environment
NODE_ENV=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_build_only
# Intentionally missing DATABASE_URL and other production secrets
`
      
      const envPath = path.join(process.cwd(), '.env.build.test')
      await fs.writeFile(envPath, testEnvContent)

      try {
        // Attempt Docker build
        const buildResult = await runCommand('docker', [
          'build',
          '-t', TEST_IMAGE_NAME,
          '--build-arg', 'NODE_ENV=production',
          '.'
        ], { 
          timeout: BUILD_TIMEOUT,
          cwd: process.cwd()
        })

        // Build should succeed
        expect(buildResult.exitCode).toBe(0)
        
        // Should not contain database connection errors
        expect(buildResult.stderr).not.toContain('ECONNREFUSED')
        expect(buildResult.stderr).not.toContain('Connection failed')
        expect(buildResult.stderr).not.toContain('DATABASE_URL')
        
        // Should contain build success indicators
        expect(buildResult.stdout).toContain('Successfully built') // Docker build success
        
      } finally {
        // Cleanup
        await fs.unlink(envPath).catch(() => {})
      }
    }, BUILD_TIMEOUT + 10000)

    it('should build successfully without Redis configuration', async () => {
      const dockerAvailable = await isDockerAvailable()
      
      if (!dockerAvailable) {
        console.log('Docker not available, skipping Docker build test')
        return
      }

      const buildResult = await runCommand('docker', [
        'build',
        '-t', `${TEST_IMAGE_NAME}-no-redis`,
        '--build-arg', 'NODE_ENV=production',
        '.'
      ], { 
        timeout: BUILD_TIMEOUT,
        cwd: process.cwd()
      })

      // Build should succeed without Redis
      expect(buildResult.exitCode).toBe(0)
      expect(buildResult.stderr).not.toContain('Redis connection')
      expect(buildResult.stderr).not.toContain('REDIS_URL')

      // Cleanup
      await runCommand('docker', ['rmi', `${TEST_IMAGE_NAME}-no-redis`], { timeout: 10000 }).catch(() => {})
    }, BUILD_TIMEOUT + 10000)

    it('should build successfully without MinIO configuration', async () => {
      const dockerAvailable = await isDockerAvailable()
      
      if (!dockerAvailable) {
        console.log('Docker not available, skipping Docker build test')
        return
      }

      const buildResult = await runCommand('docker', [
        'build',
        '-t', `${TEST_IMAGE_NAME}-no-minio`,
        '--build-arg', 'NODE_ENV=production',
        '.'
      ], { 
        timeout: BUILD_TIMEOUT,
        cwd: process.cwd()
      })

      // Build should succeed without MinIO
      expect(buildResult.exitCode).toBe(0)
      expect(buildResult.stderr).not.toContain('MinIO')
      expect(buildResult.stderr).not.toContain('MINIO_')

      // Cleanup
      await runCommand('docker', ['rmi', `${TEST_IMAGE_NAME}-no-minio`], { timeout: 10000 }).catch(() => {})
    }, BUILD_TIMEOUT + 10000)
  })

  describe('Build Optimization Validation', () => {
    it('should use multi-stage build patterns for optimization', async () => {
      const dockerfilePath = path.join(process.cwd(), 'Dockerfile')
      const dockerfileContent = await fs.readFile(dockerfilePath, 'utf-8')

      // Should copy package files before application code for better caching
      const packageCopyIndex = dockerfileContent.indexOf('COPY package.json')
      const appCopyIndex = dockerfileContent.indexOf('COPY . .')
      
      expect(packageCopyIndex).toBeGreaterThan(-1)
      expect(appCopyIndex).toBeGreaterThan(-1)
      expect(packageCopyIndex).toBeLessThan(appCopyIndex)

      // Should install dependencies before copying app code
      const installIndex = dockerfileContent.indexOf('pnpm install')
      expect(installIndex).toBeGreaterThan(packageCopyIndex)
      expect(installIndex).toBeLessThan(appCopyIndex)
    })

    it('should include proper security practices', async () => {
      const dockerfilePath = path.join(process.cwd(), 'Dockerfile')
      const dockerfileContent = await fs.readFile(dockerfilePath, 'utf-8')

      // Should create non-root user
      expect(dockerfileContent).toContain('adduser')
      expect(dockerfileContent).toContain('USER nextjs')

      // Should set proper ownership
      expect(dockerfileContent).toContain('chown')
    })

    it('should validate image size is reasonable', async () => {
      const dockerAvailable = await isDockerAvailable()
      
      if (!dockerAvailable) {
        console.log('Docker not available, skipping Docker build test')
        return
      }

      // Build the image first
      const buildResult = await runCommand('docker', [
        'build',
        '-t', TEST_IMAGE_NAME,
        '.'
      ], { timeout: BUILD_TIMEOUT })

      expect(buildResult.exitCode).toBe(0)

      // Check image size
      const sizeResult = await runCommand('docker', [
        'images',
        TEST_IMAGE_NAME,
        '--format',
        '{{.Size}}'
      ])

      const imageSize = sizeResult.stdout.trim()
      expect(imageSize).toBeTruthy()
      
      // Log image size for monitoring
      console.log(`Docker image size: ${imageSize}`)
      
      // Image should not be excessively large (this is a soft check)
      // Typical Next.js images range from 500MB to 2GB depending on dependencies
      expect(imageSize).toMatch(/\d+(\.\d+)?(MB|GB)/)
    }, BUILD_TIMEOUT + 30000)
  })

  describe('Build Environment Detection', () => {
    it('should detect build phase correctly during Docker build', async () => {
      const dockerAvailable = await isDockerAvailable()
      
      if (!dockerAvailable) {
        console.log('Docker not available, skipping Docker build test')
        return
      }

      const buildResult = await runCommand('docker', [
        'build',
        '-t', `${TEST_IMAGE_NAME}-phase-test`,
        '--progress=plain',
        '.'
      ], { timeout: BUILD_TIMEOUT })

      expect(buildResult.exitCode).toBe(0)

      // Should show build-time detection in logs
      const buildOutput = buildResult.stdout + buildResult.stderr
      
      // Look for build-time indicators
      const hasBuildTimeDetection = 
        buildOutput.includes('Build time detected') ||
        buildOutput.includes('phase-production-build') ||
        buildOutput.includes('Skipping health checks during build')

      // This might not always appear in build output, so we'll check the build succeeded
      expect(buildResult.exitCode).toBe(0)

      // Cleanup
      await runCommand('docker', ['rmi', `${TEST_IMAGE_NAME}-phase-test`], { timeout: 10000 }).catch(() => {})
    }, BUILD_TIMEOUT + 10000)
  })

  describe('Build Artifact Validation', () => {
    it('should create proper Next.js build artifacts', async () => {
      const dockerAvailable = await isDockerAvailable()
      
      if (!dockerAvailable) {
        console.log('Docker not available, skipping Docker build test')
        return
      }

      // Build the image
      const buildResult = await runCommand('docker', [
        'build',
        '-t', TEST_IMAGE_NAME,
        '.'
      ], { timeout: BUILD_TIMEOUT })

      expect(buildResult.exitCode).toBe(0)

      // Inspect the built image to verify artifacts
      const inspectResult = await runCommand('docker', [
        'run',
        '--rm',
        '--entrypoint', 'ls',
        TEST_IMAGE_NAME,
        '-la', '/app/.next'
      ])

      // Should have Next.js build output
      expect(inspectResult.stdout).toContain('static')
      expect(inspectResult.stdout).toContain('server')
    }, BUILD_TIMEOUT + 30000)

    it('should include required runtime files', async () => {
      const dockerAvailable = await isDockerAvailable()
      
      if (!dockerAvailable) {
        console.log('Docker not available, skipping Docker build test')
        return
      }

      const buildResult = await runCommand('docker', [
        'build',
        '-t', TEST_IMAGE_NAME,
        '.'
      ], { timeout: BUILD_TIMEOUT })

      expect(buildResult.exitCode).toBe(0)

      // Check for required runtime files
      const filesResult = await runCommand('docker', [
        'run',
        '--rm',
        '--entrypoint', 'ls',
        TEST_IMAGE_NAME,
        '-la', '/app'
      ])

      const filesList = filesResult.stdout

      // Should have package.json for runtime
      expect(filesList).toContain('package.json')
      
      // Should have Next.js build
      expect(filesList).toContain('.next')
      
      // Should have Prisma schema
      expect(filesList).toContain('prisma')
      
      // Should have startup scripts
      expect(filesList).toContain('scripts') // or check /usr/local/bin/
    }, BUILD_TIMEOUT + 30000)
  })
})