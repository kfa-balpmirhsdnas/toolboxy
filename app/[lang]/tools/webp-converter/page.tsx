'use client'

import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolFaq from '@/components/tools/ToolFaq'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('webp-converter')!

function fmtBytes(b: number) {
  return b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB'
}

const FORMATS = { webp: 'image/webp', png: 'image/png', jpeg: 'image/jpeg' } as const
type Fmt = keyof typeof FORMATS

export default function WebpConverterPage({ params }: { params: { lang: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [fmt, setFmt] = useState<Fmt>('webp')
  const [quality, setQuality] = useState(0.9)
  const [result, setResult] = useState<{ url: string; size: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function handleFile(f: File) {
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null)
    trackToolUsed('webp-converter')
  }

  function convert() {
    if (!file || !canvasRef.current) return
    setLoading(true)
    const img = new Image()
    img.onload = () => {
      const c = canvasRef.current!
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d')!
      if (fmt === 'jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height) }
      ctx.drawImage(img, 0, 0)
      c.toBlob((blob) => {
        if (blob) setResult({ url: URL.createObjectURL(blob), size: blob.size })
        setLoading(false)
      }, FORMATS[fmt], quality)
    }
    img.src = preview
  }

  function download() {
    if (!result || !file) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = file.name.replace(/\.[^.]+$/, '') + '.' + (fmt === 'jpeg' ? 'jpg' : fmt)
    a.click()
    trackToolDownload('webp-converter', fmt)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <canvas ref={canvasRef} className="hidden" />
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]) }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {file ? <p className="text-sm font-medium text-gray-700">{file.name} <span className="text-gray-400">({fmtBytes(file.size)})</span></p>
            : <><p className="text-4xl mb-2">🖼</p><p className="text-sm font-medium text-gray-600">Drop an image or click to select</p></>}
        </div>

        {preview && <img src={preview} alt="preview" className="max-h-44 rounded-xl border border-gray-200 object-contain mx-auto bg-gray-100" />}

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Convert to</label>
            <select value={fmt} onChange={(e) => setFmt(e.target.value as Fmt)} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="webp">WebP</option><option value="png">PNG</option><option value="jpeg">JPG</option>
            </select>
          </div>
          {fmt !== 'png' && (
            <div className="flex items-center gap-2 flex-1 min-w-[10rem]">
              <label className="text-sm text-gray-600 shrink-0">Quality {Math.round(quality * 100)}%</label>
              <input type="range" min={0.3} max={1} step={0.01} value={quality} onChange={(e) => setQuality(+e.target.value)} className="flex-1" />
            </div>
          )}
        </div>

        <button onClick={convert} disabled={!file || loading}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
          {loading ? 'Converting…' : `Convert to ${fmt.toUpperCase()}`}
        </button>

        {result && (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-green-800">{fmt.toUpperCase()} ready · {fmtBytes(result.size)}</p>
              {file && <p className="text-xs text-green-600">{result.size < file.size ? `${Math.round((1 - result.size / file.size) * 100)}% smaller` : 'converted'}</p>}
            </div>
            <button onClick={download} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">⬇ Download</button>
          </div>
        )}
      </div>

      <ToolFaq slug="webp-converter" />
    </ToolLayout>
  )
}
