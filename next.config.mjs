// Build: 2026-06-22T16:27:16.327Z
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./lib/utils/i18n.ts')

// Surfaced in the footer so you can confirm which deploy the browser is showing
// (e.g. when a service-worker cache might be serving an older build).
const BUILD_ID = (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || 'local'
const BUILD_TIME = new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
    NEXT_PUBLIC_BUILD_TIME: BUILD_TIME,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://toolboxy-prod.firebaseapp.com/__/auth/:path*',
      },
    ]
  },
  async redirects() {
    return [
      // Deduped: flip-a-coin merged into the better coin-flip tool.
      {
        source: '/:lang/tools/flip-a-coin',
        destination: '/:lang/tools/coin-flip',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
