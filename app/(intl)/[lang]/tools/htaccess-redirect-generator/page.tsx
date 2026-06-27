'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('htaccess-redirect-generator')!

interface Row { from: string; to: string; code: '301' | '302' }

export default function HtaccessRedirectPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [rows, setRows] = useState<Row[]>([{ from: '/old-page', to: '/new-page', code: '301' }])
  const [wwwHttps, setWwwHttps] = useState(false)
  const [copied, setCopied] = useState(false)

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const output = (() => {
    const lines = ['RewriteEngine On']
    if (wwwHttps) {
      lines.push(
        '',
        '# Force HTTPS + www',
        'RewriteCond %{HTTPS} off [OR]',
        'RewriteCond %{HTTP_HOST} !^www\\. [NC]',
        'RewriteRule ^ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
      )
    }
    const reds = rows.filter((r) => r.from.trim() && r.to.trim())
    if (reds.length) {
      lines.push('', '# Redirects')
      reds.forEach((r) => lines.push(`Redirect ${r.code} ${r.from.trim()} ${r.to.trim()}`))
    }
    return lines.join('\n')
  })()

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    trackToolCopy('htaccess-redirect-generator')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={wwwHttps} onChange={(e) => setWwwHttps(e.target.checked)} /> {t('htr_force')}
        </label>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={r.from} onChange={(e) => update(i, { from: e.target.value })} placeholder="/old"
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <span className="text-gray-400">→</span>
              <input value={r.to} onChange={(e) => update(i, { to: e.target.value })} placeholder="/new or https://…"
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <select value={r.code} onChange={(e) => update(i, { code: e.target.value as '301' | '302' })}
                className="p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                <option value="301">301</option>
                <option value="302">302</option>
              </select>
              <button onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 px-1">✕</button>
            </div>
          ))}
          <button onClick={() => setRows((rs) => [...rs, { from: '', to: '', code: '301' }])}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium">{t('htr_add')}</button>
        </div>

        <div className="relative">
          <pre className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 whitespace-pre-wrap min-h-[6rem]">{output}</pre>
          <button onClick={copy} className="absolute top-2 right-2 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">{copied ? t('ui_copied') : t('ui_copy')}</button>
        </div>
      </div>

    </ToolLayout>
  )
}
