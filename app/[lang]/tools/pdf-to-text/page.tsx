'use client'

import { useState, useRef, useCallback } from 'react'
import Script from 'next/script'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('pdf-to-text')!

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { pdfjsLib: any }
}

export default function PdfToTextPage({ params }: { params: { lang: string } }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scriptReady = useRef(false)

  const extractText = useCallback(async (file: File) => {
    if (!scriptReady.current || !window.pdfjsLib) {
      setError('PDF engine still loading — please try again.')
      return
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }
    setLoading(true)
    setError('')
    setText('')
    setFileName(file.name)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setPageCount(pdf.numPages)
      const pages: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = content.items.map((item: any) => item.str).join(' ')
        pages.push(`--- Page ${i} ---\n${pageText}`)
      }
      setText(pages.join('\n\n'))
    } catch {
      setError('Failed to extract text. The PDF may be encrypted, scanned-only, or damaged.')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) extractText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) extractText(file)
  }

  function copyText() {
    if (text) navigator.clipboard.writeText(text)
  }

  function downloadText() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName.replace(/\.pdf$/i, '') + '.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={() => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          scriptReady.current = true
        }}
      />

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />
        <div className="text-4xl mb-3">📄</div>
        <p className="font-semibold text-gray-700">Drop your PDF here or click to browse</p>
        <p className="text-sm text-gray-400 mt-1">Supports text-based PDFs up to 10 MB</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">
            Extracting text{pageCount > 0 ? ` from ${pageCount} pages` : ''}…
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mt-4">
          {error}
        </div>
      )}

      {/* Result */}
      {text && !loading && (
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              <strong>{fileName}</strong> · {pageCount} page{pageCount !== 1 ? 's' : ''} · {text.length.toLocaleString()} chars
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyText}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={downloadText}
                className="text-sm px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                Download .txt
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={text}
            className="w-full h-72 p-4 border border-gray-200 rounded-xl text-sm text-gray-800 font-mono resize-y bg-gray-50 focus:outline-none"
          />
          <button
            onClick={() => { setText(''); setFileName(''); setPageCount(0) }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6 text-center">
        All processing happens in your browser — no files are sent to any server.
      </p>
    </ToolLayout>
  )
}
