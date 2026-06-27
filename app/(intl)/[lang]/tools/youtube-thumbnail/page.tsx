'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('youtube-thumbnail')!
const QUALITIES: [string, string, string][] = [
  ['maxresdefault', 'yt_max', '1280×720'],
  ['sddefault', 'yt_sd', '640×480'],
  ['hqdefault', 'yt_hq', '480×360'],
  ['mqdefault', 'yt_mq', '320×180'],
]

function parseId(input: string): string | null {
  const s = input.trim()
  if (/^[\w-]{11}$/.test(s)) return s
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/v\/)([\w-]{11})/)
  return m ? m[1] : null
}

export default function YoutubeThumbnailPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const id = parseId(input)
  if (id && input) trackToolUsed('youtube-thumbnail')

  async function download(url: string, q: string) {
    try {
      const blob = await fetch(url).then((r) => r.blob())
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = `${id}-${q}.jpg`; a.click()
      trackToolDownload('youtube-thumbnail', 'jpg')
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('yt_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('yt_subtitle')}</p>
        </div>

        <input value={input} onChange={(e) => setInput(e.target.value)} type="search" name="tbx-yt" autoFocus
          autoComplete="off" data-1p-ignore data-lpignore="true" placeholder={t('yt_input')}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />

        {input && !id && <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">{t('yt_invalid')}</p>}

        {id && (
          <div className="space-y-3">
            {QUALITIES.map(([q, key, res]) => {
              const url = `https://img.youtube.com/vi/${id}/${q}.jpg`
              return (
                <div key={q} className="rounded-xl border border-gray-100 overflow-hidden">
                  <img src={url} alt={key} className="w-full bg-gray-100" onError={(e) => { (e.currentTarget.closest('div') as HTMLElement).style.display = 'none' }} />
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-600">{t(key)} <span className="text-gray-400">{res}</span></span>
                    <div className="flex gap-2">
                      <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">{t('yt_open')}</a>
                      <button onClick={() => download(url, q)} className="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">⬇ {t('yt_download')}</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <p className="text-xs text-gray-400">{t('yt_note')}</p>
      </div>
    </ToolLayout>
  )
}
