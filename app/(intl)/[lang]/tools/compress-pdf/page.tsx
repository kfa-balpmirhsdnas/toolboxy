'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('compress-pdf')!

const LEVELS: Record<string, { scale: number; q: number }> = {
  cp_q_strong: { scale: 1.0, q: 0.5 },
  cp_q_medium: { scale: 1.3, q: 0.65 },
  cp_q_light: { scale: 1.7, q: 0.82 },
}
const fmt = (b: number) => (b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(2) + ' MB')

export default function CompressPdfPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState('cp_q_medium')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [out, setOut] = useState<{ url: string; size: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function pick(f: File) { setFile(f); setOut(null); setError('') }

  async function compress() {
    if (!file) return
    setBusy(true); setError(''); setOut(null); trackToolUsed('compress-pdf')
    try {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs'
      const { PDFDocument } = await import('pdf-lib')
      const { scale, q } = LEVELS[level]
      const data = new Uint8Array(await file.arrayBuffer())
      const pdf = await pdfjs.getDocument({ data }).promise
      const doc = await PDFDocument.create()
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const vp = page.getViewport({ scale })
        const c = document.createElement('canvas')
        c.width = vp.width; c.height = vp.height
        const ctx = c.getContext('2d')!
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
        await page.render({ canvasContext: ctx, viewport: vp }).promise
        const b64 = c.toDataURL('image/jpeg', q).split(',')[1]
        const bin = atob(b64)
        const bytes = new Uint8Array(bin.length)
        for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j)
        const img = await doc.embedJpg(bytes)
        const p = doc.addPage([vp.width, vp.height])
        p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height })
      }
      const bytes = await doc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      setOut({ url: URL.createObjectURL(blob), size: blob.size })
    } catch (e) {
      console.error(e); setError(t('cp_error'))
    } finally {
      setBusy(false)
    }
  }

  function download() {
    if (!out) return
    const a = document.createElement('a')
    a.href = out.url; a.download = (file?.name.replace(/\.pdf$/i, '') || 'document') + '-compressed.pdf'; a.click()
    trackToolDownload('compress-pdf', 'pdf')
  }

  const reduction = out && file ? Math.round((1 - out.size / file.size) * 100) : 0

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && pick(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
          <p className="text-4xl mb-2">🗜️</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name : t('cp_drop')}</p>
          {file && <p className="text-xs text-gray-400 mt-1">{fmt(file.size)}</p>}
        </div>

        {file && (
          <>
            <div className="flex flex-wrap gap-2">
              {Object.keys(LEVELS).map((k) => (
                <button key={k} onClick={() => setLevel(k)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border ${level === k ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-brand-300'}`}>{t(k)}</button>
              ))}
            </div>
            <button onClick={compress} disabled={busy}
              className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">
              {busy ? t('cp_compressing') : t('cp_compress')}
            </button>
          </>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        {out && file && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">{t('cp_original')}</span><span className="font-medium text-gray-700">{fmt(file.size)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">{t('cp_result')}</span><span className="font-bold text-green-700">{fmt(out.size)}</span></div>
            {reduction > 0 && <div className="text-center text-green-700 font-bold">−{reduction}%</div>}
            <button onClick={download} className="w-full px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 inline-flex items-center justify-center gap-1.5"><ToolIcon name="download" className="w-4 h-4" />{t('cp_download')}</button>
          </div>
        )}

        <p className="text-xs text-gray-400">{t('cp_note')}</p>
      </div>
    </ToolLayout>
  )
}
