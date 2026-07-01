'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('heic-to-png')!

export default function HeicToPngPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function convert(f: File) {
    setFile(f); setResult(''); setError(''); setLoading(true)
    trackToolUsed('heic-to-png')
    try {
      const heic2any = (await import('heic2any')).default
      const out = await heic2any({ blob: f, toType: 'image/png' })
      const blob = Array.isArray(out) ? out[0] : out
      setResult(URL.createObjectURL(blob as Blob))
    } catch {
      setError(t('hj_error'))
    } finally {
      setLoading(false)
    }
  }

  function download() {
    if (!result || !file) return
    const a = document.createElement('a')
    a.href = result
    a.download = file.name.replace(/\.(heic|heif)$/i, '') + '.png'
    a.click()
    trackToolDownload('heic-to-png', 'png')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && convert(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept=".heic,.heif,image/heic,image/heif" className="hidden" onChange={(e) => e.target.files?.[0] && convert(e.target.files[0])} />
          <p className="text-4xl mb-2">🍏</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name : t('hj_drop')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('hp_sub')}</p>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-500 text-center">{t('hj_converting')}</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        {result && (
          <div className="space-y-3 text-center">
            <img src={result} alt="converted" className="max-h-56 mx-auto rounded-xl border border-gray-200" />
            <button onClick={download} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('hp_download')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">{t('hj_note')}</p>
      </div>
    </ToolLayout>
  )
}
