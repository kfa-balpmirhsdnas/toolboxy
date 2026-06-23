'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('merge-pdf')!

export default function MergePdfPage({ params }: { params: { lang: string } }) {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function add(list: FileList | null) {
    if (!list) return
    setFiles((f) => [...f, ...Array.from(list).filter((x) => x.type === 'application/pdf')])
    trackToolUsed('merge-pdf')
  }
  const move = (i: number, d: number) => setFiles((fs) => {
    const j = i + d
    if (j < 0 || j >= fs.length) return fs
    const c = [...fs];[c[i], c[j]] = [c[j], c[i]]; return c
  })

  async function merge() {
    if (files.length < 2) return
    setLoading(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const out = await PDFDocument.create()
      for (const file of files) {
        const src = await PDFDocument.load(await file.arrayBuffer())
        const pages = await out.copyPages(src, src.getPageIndices())
        pages.forEach((p) => out.addPage(p))
      }
      const bytes = await out.save()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      a.download = 'merged.pdf'; a.click()
      trackToolDownload('merge-pdf', 'pdf')
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => add(e.target.files)} />
          <p className="text-4xl mb-2">📄</p>
          <p className="text-sm font-medium text-gray-600">Drop PDFs or click to add</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <span className="text-gray-400">{i + 1}.</span>
                <span className="flex-1 truncate text-gray-700">{f.name}</span>
                <button onClick={() => move(i, -1)} className="text-gray-400 hover:text-gray-700 px-1">↑</button>
                <button onClick={() => move(i, 1)} className="text-gray-400 hover:text-gray-700 px-1">↓</button>
                <button onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 px-1">✕</button>
              </div>
            ))}
            <button onClick={merge} disabled={files.length < 2 || loading}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
              {loading ? 'Merging…' : `Merge ${files.length} PDFs`}
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400">Merged in your browser in the order shown — files are never uploaded.</p>
      </div>

    </ToolLayout>
  )
}
