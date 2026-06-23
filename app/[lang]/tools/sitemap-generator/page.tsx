'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('sitemap-generator')!

export default function SitemapGeneratorPage({ params }: { params: { lang: string } }) {
  const [urls, setUrls] = useState('https://example.com/\nhttps://example.com/about\nhttps://example.com/contact')
  const [freq, setFreq] = useState('weekly')
  const [copied, setCopied] = useState(false)

  const output = (() => {
    const list = urls.split('\n').map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s))
    const today = new Date().toISOString().slice(0, 10)
    const body = list.map((u) =>
      `  <url>\n    <loc>${u.replace(/&/g, '&amp;')}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n  </url>`,
    ).join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('sitemap-generator')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URLs (one per line)</label>
          <textarea value={urls} onChange={(e) => setUrls(e.target.value)} rows={6}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Change frequency</label>
          <select value={freq} onChange={(e) => setFreq(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400">
            {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="relative">
          <pre className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto max-h-80">{output}</pre>
          <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
      </div>

    </ToolLayout>
  )
}
