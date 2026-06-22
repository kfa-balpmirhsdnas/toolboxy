import type { MetadataRoute } from 'next'
import { TOOLS } from '@/lib/tools/registry'

const BASE_URL = 'https://toolboxy.net'
const LANGS = ['en', 'ja', 'ko']
const now = new Date()

const IMPLEMENTED_SLUGS = new Set([
  // Developer tools
  'base64-encoder', 'base64-decoder', 'color-converter', 'hash-generator',
  'json-formatter', 'json-validator', 'url-encoder', 'url-decoder',
  'uuid-generator', 'jwt-decoder', 'yaml-to-json', 'css-minifier',
  'cron-expression-parser',
  // Text tools
  'lorem-ipsum-generator', 'markdown-editor', 'text-case-converter',
  'word-counter', 'text-compare',
  // File tools
  'csv-to-json', 'json-to-csv',
  // Image tools
  'image-resizer',
  // Utility tools
  'password-generator', 'qr-generator',
  // PDF tools
  'pdf-to-text',
])

export default function sitemap(): MetadataRoute.Sitemap {
  const homeUrls = LANGS.map((lang) => ({
    url: \`\${BASE_URL}/\${lang}\`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  const staticUrls = LANGS.flatMap((lang) =>
    ['/tools', '/pricing'].map((path) => ({
      url: \`\${BASE_URL}/\${lang}\${path}\`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  )

  const categoryUrls = LANGS.flatMap((lang) =>
    ['pdf', 'image', 'video', 'text', 'developer', 'file', 'utility'].map((cat) => ({
      url: \`\${BASE_URL}/\${lang}/tools/\${cat}\`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  const toolUrls = LANGS.flatMap((lang) =>
    TOOLS.filter((t) => IMPLEMENTED_SLUGS.has(t.slug)).map((tool) => ({
      url: \`\${BASE_URL}/\${lang}/tools/\${tool.slug}\`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  )

  return [...homeUrls, ...staticUrls, ...categoryUrls, ...toolUrls]
}
