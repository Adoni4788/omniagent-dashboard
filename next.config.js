/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'via.placeholder.com',
      // Add other image domains as needed
    ],
  },
  // Enable experimental features as needed
  experimental: {
    // serverActions: true,
    // appDir: true,
  },
}

// Add bundle analyzer if ANALYZE is true
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  })
  module.exports = withBundleAnalyzer(nextConfig)
} else {
  module.exports = nextConfig
}

// Set up CSP headers for improved security
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
]

// Add security headers to Next.js config if not already in vercel.json
if (process.env.NODE_ENV === 'production') {
  nextConfig.headers = async () => {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  }
} 