'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('background-remover')!
// Checkerboard so transparency is visible.
const CHECKER = {
  backgroundImage: 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,0 10px,10px -10px,-10px 0',
}
// Load @imgly/background-removal from a CDN at RUNTIME. Bundling it (onnxruntime uses
// `import.meta`) breaks `next build`, so the import is hidden from webpack via new Function.
const CDN = 'https://esm.sh/@imgly/background-removal@1.7.0'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadImgly = (): Promise<any> => (new Function('u', 'return import(u)'))(CDN)

export default function BackgroundRemoverPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [outUrl, setOutUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState(0)
  const [finishing, setFinishing] = useState(false) // past the download → inference (no % → indeterminate)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) {
    if (!f.type.startsWith('image/')) return
    setFile(f); setUrl(URL.createObjectURL(f)); setOutUrl(''); setError(''); trackToolUsed('background-remover')
  }

  // Open with: load an image the OS launched the installed app with (File Handling API).
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const lq = (window as any).launchQueue
    if (!lq?.setConsumer) return
    lq.setConsumer(async (p: any) => {
      for (const h of p?.files || []) { try { const f = await h.getFile(); load(f); break } catch { /* skip */ } }
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function removeBg() {
    if (!file) return
    setBusy(true); setOutUrl(''); setError(''); setProg(0); setFinishing(false)
    // The library reports the (first-run) model download 0→100, then runs inference which
    // restarts the counter at 0. Showing that raw reset looks like a failure — so once the
    // first phase has clearly finished and the counter drops back, switch to an indeterminate
    // "working" state instead of jumping to 0%.
    let peak = 0, doneDownloading = false
    try {
      const mod = await loadImgly()
      const blob: Blob = await mod.removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          if (doneDownloading || !total) return
          const pct = Math.round((current / total) * 100)
          if (peak > 50 && pct + 20 < peak) { doneDownloading = true; setFinishing(true); return }
          peak = Math.max(peak, pct)
          setProg(Math.min(99, pct))
        },
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
            {busy && (() => {
              const indeterminate = finishing || prog === 0
              return (
                <div className="space-y-1">
                  <p className="text-sm text-brand-600 text-center">{t('md_processing')}{!indeterminate && ` ${prog}%`}</p>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={'h-full bg-brand-500 ' + (indeterminate ? 'w-full animate-pulse' : 'transition-all')} style={indeterminate ? undefined : { width: prog + '%' }} />
                  </div>
                </div>
              )
            })()}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            <div className="flex gap-2">
              {!outUrl ? (
                <button onClick={removeBg} disabled={busy}
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">{busy ? t('md_processing') : t('br_remove')}</button>
              ) : (
                <button onClick={download} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 inline-flex items-center gap-1.5"><ToolIcon name="save" className="w-4 h-4" />{t('br_save')} (PNG)</button>
              )}
              <button onClick={() => inputRef.current?.click()} title={t('br_open')} aria-label={t('br_open')} className="px-3 py-2 text-sm text-gray-600 hover:text-brand-600 border border-gray-200 rounded-xl hover:bg-gray-50 inline-flex items-center gap-1.5"><ToolIcon name="folder" className="w-4 h-4" />{t('br_open')}</button>
            </div>
            {!outUrl && !busy && <p className="text-xs text-gray-400 text-center">{t('br_note_first')}</p>}
          </>
        )}
        {/* Privacy banner — unified with the other image tools */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span><b>{t('im_privacy_title')}</b> {t('im_privacy')}</span>
        </div>
      </div>
    </ToolLayout>
  )
}
