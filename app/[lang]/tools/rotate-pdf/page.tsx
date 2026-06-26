'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('rotate-pdf')!

export default function RotatePdfPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [angle, setAngle] = useState(90)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handle(f: File) { setFile(f); trackToolUsed('rotate-pdf') }

  async function rotate() {
    if (!file) return
    setLoading(true)
    try {
      const { PDFDocument, degrees } = await import('pdf-lib')
      const doc = await PDFDocument.load(await file.arrayBuffer())
      doc.getPages().forEach((p) => {
        const cur = p.getRotation().angle
        p.setRotation(degrees((cur + angle) % 360))
      })
      const bytes = await doc.save()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      a.download = file.name.replace(/\.pdf$/i, '') + '-rotated.pdf'; a.click()
      trackToolDownload('rotate-pdf', 'pdf')
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handle(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
          <p className="text-4xl mb-2">🔄</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name : t('rp_drop')}</p>
        </div>

        {file && (
          <>
            <div className="flex gap-2">
              {[90, 180, 270].map((a) => (
                <button key={a} onClick={() => setAngle(a)}
                  className={`text-sm font-medium px-4 py-1.5 rounded-lg border transition-colors ${
                    angle === a ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                  }`}>{a}°</button>
              ))}
            </div>
            <button onClick={rotate} disabled={loading}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
              {loading ? t('rp_rotating') : t('rp_rotate', { a: angle })}
            </button>
          </>
        )}
        <p className="text-xs text-gray-400">{t('cc_note')}</p>
      </div>

    </ToolLayout>
  )
}
