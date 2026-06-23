'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('split-pdf')!

// Parse "1-3,5,8-10" into a sorted unique 0-based index list, bounded by total.
function parseRanges(spec: string, total: number): number[] {
  const set = new Set<number>()
  for (const part of spec.split(',')) {
    const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/)
    if (!m) continue
    const a = +m[1], b = m[2] ? +m[2] : a
    for (let n = Math.min(a, b); n <= Math.max(a, b); n++) if (n >= 1 && n <= total) set.add(n - 1)
  }
  return [...set].sort((x, y) => x - y)
}

export default function SplitPdfPage({ params }: { params: { lang: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [spec, setSpec] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handle(f: File) {
    setFile(f); trackToolUsed('split-pdf')
    const { PDFDocument } = await import('pdf-lib')
    const doc = await PDFDocument.load(await f.arrayBuffer())
    setPageCount(doc.getPageCount())
    setSpec(`1-${doc.getPageCount()}`)
  }

  async function extract() {
    if (!file) return
    const idx = parseRanges(spec, pageCount)
    if (!idx.length) return
    setLoading(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const src = await PDFDocument.load(await file.arrayBuffer())
      const out = await PDFDocument.create()
      const pages = await out.copyPages(src, idx)
      pages.forEach((p) => out.addPage(p))
      const bytes = await out.save()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      a.download = file.name.replace(/\.pdf$/i, '') + '-pages.pdf'; a.click()
      trackToolDownload('split-pdf', 'pdf')
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
          <p className="text-sm font-medium text-gray-600">{file ? `${file.name} · ${pageCount} pages` : 'Drop a PDF or click to select'}</p>
        </div>

        {pageCount > 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pages to extract (e.g. 1-3, 5, 8-10)</label>
              <input value={spec} onChange={(e) => setSpec(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <p className="text-xs text-gray-400 mt-1">{parseRanges(spec, pageCount).length} of {pageCount} pages selected</p>
            </div>
            <button onClick={extract} disabled={loading || !parseRanges(spec, pageCount).length}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
              {loading ? 'Extracting…' : 'Extract pages'}
            </button>
          </>
        )}
        <p className="text-xs text-gray-400">Processed entirely in your browser.</p>
      </div>

      <ToolFaq slug="split-pdf" />
    </ToolLayout>
  )
}
