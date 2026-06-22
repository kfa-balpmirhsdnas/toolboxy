'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('jpg-to-png')!

function fmtBytes(b: number) {
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(2) + ' MB'
}

export default function JpgToPngPage({ params }: { params: { lang: string } }) {
  const [original, setOriginal] = useState<File|null>(null)
  const [preview, setPreview] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [resultSize, setResultSize] = useState(0)
  const [loading, setLoading] = useState(false)
  const tracked = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function handleFile(file: File) {
    if (!tracked.current) { trackToolUsed('jpg-to-png'); tracked.current = true }
    setOriginal(file)
    setPreview(URL.createObjectURL(file))
    setResultUrl('')
    setResultSize(0)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function convert() {
    if (!original || !canvasRef.current) return
    setLoading(true)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (!blob) { setLoading(false); return }
        setResultUrl(URL.createObjectURL(blob))
        setResultSize(blob.size)
        setLoading(false)
      }, 'image/png')
    }
    img.src = preview
  }

  function download() {
    if (!resultUrl || !original) return
    const name = original.name.replace(/\.[^.]+$/, '') + '.png'
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = name
    a.click()
    trackToolDownload('jpg-to-png', 'png')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <canvas ref={canvasRef} className="hidden" />
      <div className="space-y-4">
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          <input ref={inputRef} type="file" accept="image/jpeg" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {original ? (
            <p className="text-sm font-medium text-gray-700">{original.name} <span className="text-gray-400">({fmtBytes(original.size)})</span></p>
          ) : (
            <>
              <p className="text-4xl mb-2">&#x1F5BC;</p>
              <p className="text-sm font-medium text-gray-600">Drop JPG/JPEG here or click to select</p>
              <p className="text-xs text-gray-400 mt-1">Converted to lossless PNG in your browser</p>
            </>
          )}
        </div>
        {preview && <img src={preview} alt="preview" className="max-h-48 rounded-xl border border-gray-200 object-contain mx-auto" />}
        <button onClick={convert} disabled={!original || loading}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
          {loading ? 'Converting...' : 'Convert to PNG'}
        </button>
        {resultUrl && (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-green-800">PNG ready!</p>
              <p className="text-xs text-green-600">{fmtBytes(resultSize)}</p>
            </div>
            <button onClick={download} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">
              &#x2B07; Download .png
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
