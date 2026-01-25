/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    return config;
  },
  
  // Ensure server startup initialization runs
  experimental: {
    instrumentationHook: true,
    // Increase body size limit for file uploads
    serverComponentsExternalPackages: ['minio'],
    // For App Router, set large upload limits
    serverActions: {
      bodySizeLimit: '10gb',
      allowedOrigins: ['*'],
    },
    // Enable large payload support
    largePageDataBytes: 10 * 1024 * 1024 * 1024, // 10GB
  },

  // Configure for large file uploads in App Router
  serverRuntimeConfig: {
    maxRequestSize: '10gb',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.microlink.io',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
      },
      {
        protocol: 'https',
        hostname: 'icons8.com',
      },
      {
        protocol: 'https',
        hostname: 'www.aljazeera.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'getwallpapers.com',
      },
      {
        protocol: 'https',
        hostname: 'wallpapers.com',
      },
      {
        protocol: 'https',
        hostname: 'wallpaperswide.com',
      },
      {
        protocol: 'https',
        hostname: 'c4.wallpaperflare.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'www.lappui.org',
      },
      {
        protocol: 'https',
        hostname: 'www.baltana.com',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'e0.pxfuel.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'www.culture.gouv.fr',
      },
      {
        protocol: 'https',
        hostname: 'images.indianexpress.com',
      },
      {
        protocol: 'https',
        hostname: 'wallpapercave.com',
      },
      {
        protocol: 'https',
        hostname: 'wallpaperbat.com',
      },
      {
        protocol: 'https',
        hostname: 'w0.peakpx.com',
      },
      {
        protocol: 'https',
        hostname: 'aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'live-production.wcms.abc-cdn.net.au',
      },
      {
        protocol: 'https',
        hostname: 'media.npr.org',
      },
      {
        protocol: 'https',
        hostname: 'worldcrunch.com',
      },
      {
        protocol: 'https',
        hostname: 'media.newyorker.com',
      },
      {
        protocol: 'https',
        hostname: 'steamledge.com',
      },
      {
        protocol: 'https',
        hostname: 'qph.cf2.quoracdn.net',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
      },
      {
        protocol: 'https',
        hostname: 'archive-images.prod.global.a201836.reutersmedia.net',
      },
      {
        protocol: 'https',
        hostname: 'image.savethechildren.org',
      },
      {
        protocol: 'https',
        hostname: 'borgenproject.org',
      },
      {
        protocol: 'https',
        hostname: 'editorially.org',
      },
      {
        protocol: 'https',
        hostname: 'i.stci.uk',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: 'minio.varram.me',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.freepik.com',
      },
    ],
  },
  
  // Configure headers for MinIO video access
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods', 
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
