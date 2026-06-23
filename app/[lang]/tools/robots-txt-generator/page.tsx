'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('robots-txt-generator')!

export default function RobotsTxtPage({ params }: { params: { lang: string } }) {
  const [policy, setPolicy] = useState<'all' | 'none'>('all')
  const [disallow, setDisallow] = useState('/admin\n/cart\n/api')
  const [sitemap, setSitemap] = useState('')
  const [copied, setCopied] = useState(false)

  const output = (() => {
    const lines = ['User-agent: *']
    if (policy === 'none') {
      lines.push('Disallow: /')
    } else {
      const paths = disallow.split('\n').map((s) => s.trim()).filter(Boolean)
      if (paths.length) paths.forEach((p) => lines.push(`Disallow: ${p}`))
      else lines.push('Disallow:')
    }
    if (sitemap.trim()) lines.push('', `Sitemap: ${sitemap.trim()}`)
    return lines.join('\n')
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('robots-txt-generator')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {([['all', 'Allow crawling'], ['none', 'Block everything']] as ['all' | 'none', string][]).map(([id, label]) => (
            <button key={id} onClick={() => setPolicy(id)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                policy === id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
              }`}>{label}</button>
          ))}
        </div>
        {policy === 'all' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disallow paths (one per line)</label>
            <textarea value={disallow} onChange={(e) => setDisallow(e.target.value)} rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sitemap URL (optional)</label>
          <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} placeholder="https://example.com/sitemap.xml"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <div className="relative">
          <pre className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 whitespace-pre-wrap min-h-[8rem]">{output}</pre>
          <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
      </div>

    </ToolLayout>
  )
}
