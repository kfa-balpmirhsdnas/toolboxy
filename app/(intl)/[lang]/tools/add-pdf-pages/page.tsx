'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('add-pdf-pages')!

type Pos = 'start' | 'end' | 'after'

export default function AddPdfPagesPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [count, setCount] = useState(1)
  const [pos, setPos] = useState<Pos>('end')
  const [after, setAfter] = useState(1)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handle(f: File) { setFile(f); trackToolUsed('add-pdf-pages') }

  async function apply() {
    if (!file) return
    setLoading(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.load(await file.arrayBuffer())
      const { width, height } = doc.getPage(0).getSize()
      const total = doc.getPageCount()
      const n = Math.min(Math.max(count, 1), 50)
      for (let i = 0; i < n; i++) {
        if (pos === 'start') doc.insertPage(0, [width, height])
        else if (pos === 'end') doc.addPage([width, height])
        else doc.insertPage(Math.min(Math.max(after, 0), total), [width, height])
      }
      const bytes = await doc.save()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      a.download = file.name.replace(/\.pdf$/i, '') + '-added.pdf'; a.click()
      trackToolDownload('add-pdf-pages', 'pdf')
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handle(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
          <p className="text-4xl mb-2">➕</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name : t('pj_drop')}</p>
        </div>
        {file && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('ap_count')}</label>
                <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('ap_position')}</label>
                <select value={pos} onChange={(e) => setPos(e.target.value as Pos)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  <option value="end">{t('ap_pos_end')}</option>
                  <option value="start">{t('ap_pos_start')}</option>
                  <option value="after">{t('ap_pos_after')}</option>
                </select>
              </div>
            </div>
            {pos === 'after' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('ap_pos_after')}</label>
                <input type="number" min={1} value={after} onChange={(e) => setAfter(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            )}
            <button onClick={apply} disabled={loading}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">
              {loading ? t('ap_adding') : t('ap_apply')}
            </button>
          </>
        )}
        <p className="text-xs text-gray-400">{t('ap_note')}</p>
      </div>
    </ToolLayout>
  )
}
