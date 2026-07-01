'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('pdf-page-numbers')!

type Pos = 'bottom-center' | 'bottom-right' | 'top-right'

export default function PdfPageNumbersPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [pos, setPos] = useState<Pos>('bottom-center')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handle(f: File) { setFile(f); trackToolUsed('pdf-page-numbers') }

  async function apply() {
    if (!file) return
    setLoading(true)
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
      const doc = await PDFDocument.load(await file.arrayBuffer())
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()
      const total = pages.length
      pages.forEach((page, i) => {
        const { width } = page.getSize()
        const label = `${i + 1} / ${total}`
        const size = 10
        const w = font.widthOfTextAtSize(label, size)
        const x = pos === 'bottom-center' ? width / 2 - w / 2 : width - w - 30
        const y = pos === 'top-right' ? page.getSize().height - 24 : 18
        page.drawText(label, { x, y, size, font, color: rgb(0.4, 0.4, 0.4) })
      })
      const bytes = await doc.save()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      a.download = file.name.replace(/\.pdf$/i, '') + '-numbered.pdf'; a.click()
      trackToolDownload('pdf-page-numbers', 'pdf')
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handle(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
          <p className="text-4xl mb-2">🔢</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name : t('rp_drop')}</p>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>
        {file && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('ttr_position')}</label>
              <select value={pos} onChange={(e) => setPos(e.target.value as Pos)}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                <option value="bottom-center">{t('ppn_bc')}</option>
                <option value="bottom-right">{t('ppn_br')}</option>
                <option value="top-right">{t('ppn_tr')}</option>
              </select>
            </div>
            <button onClick={apply} disabled={loading}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">
              {loading ? t('wmp_adding') : t('ppn_add')}
            </button>
          </>
        )}
        <p className="text-xs text-gray-400">{t('ppn_note')}</p>
      </div>
    </ToolLayout>
  )
}
