import type { MetadataRoute } from 'next'
import { TOOLS } from '@/lib/tools/registry'

const BASE_URL = 'https://toolboxy.net'
const LANGS = ['en', 'ja', 'ko']
const now = new Date()

// Slugs that have an actual page.tsx implemented
const IMPLEMENTED_SLUGS = new Set([
  // Phase 1
  'base64-encoder', 'base64-decoder', 'color-converter', 'hash-generator',
  'image-resizer', 'json-formatter', 'lorem-ipsum-generator', 'markdown-editor',
  'password-generator', 'pdf-to-text', 'qr-generator', 'text-case-converter',
  'url-encoder', 'url-decoder', 'uuid-generator', 'word-counter',
  'csv-to-json', 'jwt-decoder',
])

export default function sitemap(): MetadataRoute.Sitemap {
  const homeUrls = LANGS.map((lang) => ({
    url: `${BASE_URL}/${lang}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  const staticUrls = LANGS.flatMap((lang) =>
    ['/tools', '/pricing'].map((path) => ({
      url: `${BASE_URL}/${lang}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  )

  const categoryUrls = LANGS.flatMap((lang) =>
    ['pdf', 'image', 'video', 'text', 'developer', 'file', 'utility'].map((cat) => ({
      url: `${BASE_URL}/${lang}/tools/${cat}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  const toolUrls = LANGS.flatMap((lang) =>
    TOOLS.filter((t) => IMPLEMENTED_SLUGS.has(t.slug)).map((t) => ({
      url: `${BASE_URL}/${lang}/tools/${t.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  )

  return [...homeUrls, ...staticUrls, ...categoryUrls, ...toolUrls]
}
