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
    // Deduped tools — [from, to]. Merged to kill keyword cannibalization; old URLs
    // 301 (permanent) to the canonical so ranking signals consolidate.
    const DEDUPES = [
      ['flip-a-coin', 'coin-flip'],
      // text batch
      ['character-counter', 'word-counter'],
      ['string-length-counter', 'word-counter'],
      ['text-counter-advanced', 'word-counter'],
      ['text-statistics', 'word-counter'],
      ['text-diff-checker', 'text-diff'],
      ['text-compare', 'text-diff'],
      ['text-diff-inline', 'text-diff'],
      ['markdown-previewer', 'markdown-preview'],
      ['reading-time-estimator', 'reading-time-calculator'],
      ['word-frequency', 'word-frequency-counter'],
      ['text-case-converter', 'case-converter'],
      ['text-line-sorter', 'line-sort'],
      ['list-sorter', 'line-sort'],
      ['duplicate-line-remover', 'list-deduplicator'],
      ['string-padding-tool', 'text-padder'],
      ['morse-code-converter', 'morse-code-translator'],
      ['text-to-morse-code', 'morse-code-translator'],
    ]
    return DEDUPES.map(([from, to]) => ({
      source: `/:lang/tools/${from}`,
      destination: `/:lang/tools/${to}`,
      permanent: true,
    }))
  },
}

export default withNextIntl(nextConfig)
