'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('background-remover')!
// Checkerboard so transparency is visible.
const CHECKER = {
  backgroundImage: 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,0 10px,10px -10px,-10px 0',
}

export default function BackgroundRemoverPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [outUrl, setOutUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) {
    if (!f.type.startsWith('image/')) return
    setFile(f); setUrl(URL.createObjectURL(f)); setOutUrl(''); setError(''); trackToolUsed('background-remover')
  }

  async function removeBg() {
    if (!file) return
    setBusy(true); setOutUrl(''); setError(''); setProg(0)
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(file, {
        progress: (_key, current, total) => { if (total) setProg(Math.min(99, Math.round((current / total) * 100))) },
      })
      setOutUrl(URL.createObjectURL(blob))
      trackToolDownload('background-remover', 'png')
    } catch (e) {
      console.error(e); setError(t('md_error'))
    } finally {
      setBusy(false)
    }
  }

  function download() {
    if (!outUrl || !file) return
    const a = document.createElement('a')
    a.href = outUrl; a.download = file.name.replace(/\.[^.]+$/, '') + '-nobg.png'; a.click()
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        {!url ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-5xl mb-2">🪄</p>
            <p className="text-sm font-medium text-gray-600">{t('br_drop')}</p>
          </div>
        ) : (
          <>
            {!outUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="input" className="w-full max-h-80 object-contain rounded-xl border border-gray-200 bg-gray-50" />
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden" style={CHECKER}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={outUrl} alt="result" className="w-full max-h-80 object-contain" />
              </div>
            )}
            {busy && (
              <div className="space-y-1">
                <p className="text-sm text-brand-600 text-center">{t('md_processing')} {prog}%</p>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-brand-500 transition-all" style={{ width: prog + '%' }} /></div>
              </div>
            )}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            <div className="flex gap-2">
              {!outUrl ? (
                <button onClick={removeBg} disabled={busy}
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">{busy ? `${t('md_processing')} ${prog}%` : t('br_remove')}</button>
              ) : (
                <button onClick={download} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">{t('md_download')} (PNG)</button>
              )}
              <button onClick={() => { setUrl(''); setFile(null); setOutUrl('') }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">↺</button>
            </div>
            {!outUrl && !busy && <p className="text-xs text-gray-400 text-center">{t('br_note_first')}</p>}
          </>
        )}
        <p className="text-xs text-gray-400 text-center">{t('md_note_local')}</p>
      </div>
    </ToolLayout>
  )
}
