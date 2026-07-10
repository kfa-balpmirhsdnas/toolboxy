'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('ocr')!
const LANGS: [string, string][] = [['kor', '한국어'], ['eng', 'English'], ['jpn', '日本語'], ['kor+eng', '한국어+English']]

export default function OcrPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [src, setSrc] = useState('')
  const [lang, setLang] = useState('kor+eng')
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState(0)
  const [stage, setStage] = useState<'' | 'down' | 'rec'>('') // language-data download vs recognition
  const [enhance, setEnhance] = useState(true) // preprocessing toggle (recommended on)
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) { fileRef.current = f; setSrc(URL.createObjectURL(f)); setText(''); trackToolUsed('ocr') }

  // Accuracy preprocessing (the single biggest lever for 한국어): upscale small images so glyph
  // strokes have enough pixels, then grayscale + 2–98% contrast stretch. No hard binarization —
  // tesseract does its own thresholding better with a clean grayscale input.
  async function preprocess(f: File): Promise<HTMLCanvasElement> {
    const img = await createImageBitmap(f)
    const minSide = Math.min(img.width, img.height)
    const scale = minSide < 1200 ? Math.min(3, 1200 / minSide) : 1
    const w = Math.round(img.width * scale); const h = Math.round(img.height * scale)
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, w, h)
    const id = ctx.getImageData(0, 0, w, h); const d = id.data
    const hist = new Uint32Array(256)
    for (let i = 0; i < d.length; i += 4) {
      const g = ((d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000) | 0
      d[i] = g; hist[g]++
    }
    const totalPx = w * h
    let lo = 0; let hi = 255; let acc = 0
    for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= totalPx * 0.02) { lo = i; break } }
    acc = 0
    for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= totalPx * 0.02) { hi = i; break } }
    const range = Math.max(1, hi - lo)
    for (let i = 0; i < d.length; i += 4) {
      const g = Math.max(0, Math.min(255, (((d[i] - lo) * 255) / range) | 0))
      d[i] = g; d[i + 1] = g; d[i + 2] = g
    }
    ctx.putImageData(id, 0, 0)
    return c
  }

  async function run() {
    if (!fileRef.current) return
    setBusy(true); setProg(0); setStage(''); setText('')
    try {
      const Tesseract = (await import('tesseract.js')).default
      // enhancement is best-effort: undecodable formats (e.g. HEIC) fall back to the raw file
      const input = enhance ? await preprocess(fileRef.current).catch(() => fileRef.current!) : fileRef.current
      const { data } = await Tesseract.recognize(input, lang, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') { setStage('rec'); setProg(Math.round(m.progress * 100)) }
          else if (m.status.includes('loading language')) { setStage('down'); setProg(Math.round(m.progress * 100)) } // kor traineddata is several MB on first run
        },
      })
      setText(data.text.trim() || t('ok_empty'))
    } catch (e) { console.error(e); setText(t('ok_error')) } finally { setBusy(false); setStage('') }
  }
  function copy() { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ok_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ok_subtitle')}</p>
        </div>

        {!src ? (
          <div onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">🔤</p><p className="text-sm font-medium text-gray-600">{t('ok_drop')}</p>
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          </div>
        ) : (
          <>
            <img src={src} alt="" className="w-full rounded-xl border border-gray-200 max-h-60 object-contain bg-gray-50" />
            <div className="flex flex-wrap gap-2 items-center">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <label className="inline-flex items-center gap-1.5 text-sm text-gray-600 select-none">
                <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} className="rounded" />{t('ok_enhance')}
              </label>
              <button onClick={run} disabled={busy} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">
                {busy ? (stage === 'down' ? t('ok_downloading', { n: prog }) : t('ok_running', { n: prog })) : t('ok_run')}
              </button>
              <button onClick={() => setSrc('')} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">{t('ok_change')}</button>
            </div>
            {text && (
              <div className="space-y-2">
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <button onClick={copy} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{copied ? <span className="inline-flex items-center gap-1"><ToolIcon name="check" className="w-3.5 h-3.5" />{t('ok_copied')}</span> : t('ok_copy')}</button>
              </div>
            )}
          </>
        )}
        <p className="text-xs text-gray-400">{t('ok_note')}</p>
      </div>
    </ToolLayout>
  )
}
