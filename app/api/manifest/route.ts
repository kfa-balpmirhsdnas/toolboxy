import { NextRequest } from 'next/server'

// Only allow internal locale paths as the installed app's start_url, so the
// ?start= value can never become an open-redirect or injection vector.
const SAFE_START = /^\/(en|ja|ko)(\/[A-Za-z0-9\-/]*)?$/

/**
 * Per-page web manifest. The page that links this manifest passes its own path
 * as ?start=, so installing the PWA from (say) /ko/tools/korean-to-japanese
 * makes the installed app launch straight back to that page — locale and all.
 * `id` is fixed so every page still installs as the one "ToolBoxy" app.
 */
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('start') || '/en'
  const start = SAFE_START.test(raw) ? raw : '/en'
  const manifest = {
    name: 'ToolBoxy – Free Online Tools',
    short_name: 'ToolBoxy',
    description: '100+ free online tools. Dictionary and antonym tools work offline once visited.',
    id: '/',
    start_url: start,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: '#0284c7',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
