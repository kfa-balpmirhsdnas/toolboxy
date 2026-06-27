'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('qr-generator')!

function qrUrl(text: string, size: number) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=1`
}

export default function QrGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [size, setSize] = useState(256)
  const [generated, setGenerated] = useState('')
  const [downloaded, setDownloaded] = useState(false)

  function generate() { if (!input.trim()) return; setGenerated(input.trim()); setDownloaded(false) }

  async function download() {
    const resp = await fetch(qrUrl(generated, size))
    const blob = await resp.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'qr-code.png'; a.click()
    setDownloaded(true); setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('qg_label')}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() } }}
            placeholder={t('qg_ph')} rows={3}
            className="w-full p-4 border border-gray-200 rounded-xl resize-none text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 shrink-0">{t('qg_size')}</label>
            <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400">
              {[128, 256, 512].map(s => <option key={s} value={s}>{s}×{s}px</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={!input.trim()} className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40">{t('qg_generate')}</button>
        </div>
        {generated && (
          <div className="flex flex-col items-center gap-4 pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl(generated, size)} alt="QR Code" width={size} height={size} className="rounded-xl border border-gray-200 shadow-sm max-w-full" />
            <button onClick={download} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              {downloaded ? t('qg_downloaded') : t('qg_download')}
            </button>
            <p className="text-xs text-gray-400 text-center max-w-xs break-all">{generated}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}