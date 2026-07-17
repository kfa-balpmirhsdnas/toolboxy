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
      ['markdown-previewer', 'markdown-editor'],
      ['reading-time-estimator', 'reading-time-calculator'],
      ['word-frequency', 'word-frequency-counter'],
      ['text-case-converter', 'case-converter'],
      ['text-line-sorter', 'line-sort'],
      ['list-sorter', 'line-sort'],
      ['duplicate-line-remover', 'list-deduplicator'],
      ['string-padding-tool', 'text-padder'],
      ['morse-code-converter', 'morse-code-translator'],
      ['text-to-morse-code', 'morse-code-translator'],
      // dev batch
      ['cron-expression-builder', 'cron-expression-generator'],
      ['cron-expression-parser', 'cron-parser'],
      ['unix-timestamp-converter', 'unix-timestamp'],
      ['epoch-timestamp-converter', 'unix-timestamp'],
      ['epoch-converter', 'unix-timestamp'],
      ['text-to-binary', 'binary-text-converter'],
      ['binary-to-text', 'binary-text-converter'],
      ['json-diff-checker', 'json-diff'],
      ['html-entities-encoder', 'html-entity-encoder'],
      ['html-entity-converter', 'html-entity-encoder'],
      ['json-beautifier', 'json-formatter'],
      // design batch
      ['gradient-generator', 'css-gradient-generator'],
      ['color-gradient-generator', 'css-gradient-generator'],
      ['css-border-radius-generator', 'border-radius-generator'],
      ['color-codes-converter', 'color-converter'],
      ['css-flexbox-generator', 'css-flexbox-playground'],
      // security batch
      ['password-generator-pro', 'password-generator'],
      ['text-encrypt-decrypt', 'text-encryption'],
      ['text-encryptor', 'text-encryption'],
      ['sha-hash-generator', 'hash-generator'],
      ['passphrase-strength', 'password-strength-checker'],
      // utility batch
      ['stopwatch-timer', 'stopwatch'],
      ['time-zone-converter', 'timezone-converter'],
      ['speed-distance-time-calculator', 'speed-calculator'],
      ['date-difference-calculator', 'date-calculator'],
      ['number-converter', 'number-base-converter'],
      // image batch
      ['image-base64-converter', 'image-to-base64'],
      ['base64-image-encoder', 'image-to-base64'],
      // taxi: route map merged into the fare calculator (map always shown)
      ['taxi-route', 'taxi-fare'],
      // 2026-07 duplicate-tool consolidation (12 merges)
      ['text-to-ascii-art', 'ascii-art-generator'],
      ['mp4-to-mp3', 'video-to-audio'],
      ['markdown-preview', 'markdown-editor'],
      ['diff-checker', 'text-diff'],
      ['uuid-bulk-generator', 'uuid-generator'],
      ['image-color-extractor', 'color-palette-extractor'],
      ['keyboard-shortcut-tester', 'keyboard-test'],
      ['man-age-calculator', 'age-calculator'],
      ['ip-address-lookup', 'ip-address-info'],
      ['base64-decoder', 'base64-encoder'],
      ['url-decoder', 'url-encoder'],
      ['html-table-generator', 'table-generator'],
      ['color-palette-generator', 'color-scheme-generator'],
      ['random-color-generator', 'random-palette-generator'],
      ['json-validator', 'json-formatter'],
      ['pixel-converter', 'css-unit-converter'],
      ['pixel-to-rem-converter', 'css-unit-converter'],
      ['compound-interest-calculator', 'interest-calculator'],
      ['checksum-generator', 'hash-generator'],
      // qr preset generators merged into qr-generator (type tabs)
      ['wifi-qr-generator', 'qr-generator'],
      ['email-qr-generator', 'qr-generator'],
      ['phone-qr-generator', 'qr-generator'],
      ['vcard-qr-generator', 'qr-generator'],
    ]
    return DEDUPES.map(([from, to]) => ({
      source: `/:lang/tools/${from}`,
      destination: `/:lang/tools/${to}`,
      permanent: true,
    }))
  },
}

export default withNextIntl(nextConfig)
