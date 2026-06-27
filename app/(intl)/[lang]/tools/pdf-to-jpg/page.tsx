'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('pdf-to-jpg')!

export default function PdfToJpgPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handle(f: File) {
    setFile(f); setPages([]); setError(''); setLoading(true)
    trackToolUsed('pdf-to-jpg')
    try {
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs'
      const data = new Uint8Array(await f.arrayBuffer())
      const pdf = await pdfjs.getDocument({ data }).promise
      const out: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const c = document.createElement('canvas')
        c.width = viewport.width; c.height = viewport.height
        const ctx = c.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport }).promise
        out.push(c.toDataURL('image/jpeg', 0.92))
      }
      setPages(out)
    } catch (e) {
      console.error(e)
      setError(t('pj_error'))
    } finally {
      setLoading(false)
    }
  }

  function download(dataUrl: string, i: number) {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = (file?.name.replace(/\.pdf$/i, '') || 'page') + `-${i + 1}.jpg`
    a.click()
    trackToolDownload('pdf-to-jpg', 'jpg')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handle(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
          <p className="text-4xl mb-2">🖼</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name : t('pj_drop')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('pj_sub')}</p>
        </div>

        {loading && <p className="text-sm text-gray-500 text-center">{t('pj_rendering')}</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        {pages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pages.map((p, i) => (
              <button key={i} onClick={() => download(p, i)} className="group flex flex-col items-center gap-1">
                <img src={p} alt={`page ${i + 1}`} className="w-full rounded-lg border border-gray-200 group-hover:ring-2 ring-brand-400" />
                <span className="text-xs text-gray-500">{t('pj_page', { n: i + 1 })} ⬇</span>
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">{t('pj_note')}</p>
      </div>
    </ToolLayout>
  )
}
