'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('image-to-pdf')!

function toPngBytes(file: File): Promise<{ bytes: Uint8Array; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0)
      c.toBlob(async (blob) => {
        if (!blob) return reject(new Error('encode failed'))
        resolve({ bytes: new Uint8Array(await blob.arrayBuffer()), w: c.width, h: c.height })
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    img.onerror = reject
    img.src = url
  })
}

export default function ImageToPdfPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function add(list: FileList | null) {
    if (!list) return
    setFiles((f) => [...f, ...Array.from(list).filter((x) => x.type.startsWith('image/'))])
    trackToolUsed('image-to-pdf')
  }

  async function build() {
    if (!files.length) return
    setLoading(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdf = await PDFDocument.create()
      for (const file of files) {
        const { bytes, w, h } = await toPngBytes(file)
        const png = await pdf.embedPng(bytes)
        const page = pdf.addPage([w, h])
        page.drawImage(png, { x: 0, y: 0, width: w, height: h })
      }
      const out = await pdf.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'images.pdf'
      a.click()
      trackToolDownload('image-to-pdf', 'pdf')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files) }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => add(e.target.files)} />
          <p className="text-4xl mb-2">📄</p>
          <p className="text-sm font-medium text-gray-600">{t('itp_drop')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('itp_pageorder')}</p>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-16 object-cover rounded-lg border border-gray-200" />
                  <button onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 inline-flex items-center justify-center" aria-label="remove"><ToolIcon name="x" className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={build} disabled={loading}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
              {loading ? t('itp_building') : t('itp_create',{n:files.length})}
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('itp_privacy')}</p>
      </div>

    </ToolLayout>
  )
}
