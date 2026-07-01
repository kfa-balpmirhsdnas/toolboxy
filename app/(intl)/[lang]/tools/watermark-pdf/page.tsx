'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('watermark-pdf')!

export default function WatermarkPdfPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handle(f: File) { setFile(f); trackToolUsed('watermark-pdf') }

  async function apply() {
    if (!file || !text.trim()) return
    setLoading(true)
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib')
      const doc = await PDFDocument.load(await file.arrayBuffer())
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      for (const page of doc.getPages()) {
        const { width, height } = page.getSize()
        const size = Math.min(width, height) / 12
        page.drawText(text, {
          x: width / 2 - (text.length * size) / 4,
          y: height / 2,
          size, font, color: rgb(0.6, 0.6, 0.6), opacity: 0.3, rotate: degrees(45),
        })
      }
      const bytes = await doc.save()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      a.download = file.name.replace(/\.pdf$/i, '') + '-watermarked.pdf'; a.click()
      trackToolDownload('watermark-pdf', 'pdf')
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handle(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
          <p className="text-4xl mb-2">📄</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name : t('rp_drop')}</p>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>
        {file && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('wmp_text')}</label>
              <input value={text} onChange={(e) => setText(e.target.value)} maxLength={40}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <button onClick={apply} disabled={loading || !text.trim()}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">
              {loading ? t('wmp_adding') : t('wmp_add')}
            </button>
          </>
        )}
        <p className="text-xs text-gray-400">{t('wmp_note')}</p>
      </div>
    </ToolLayout>
  )
}
