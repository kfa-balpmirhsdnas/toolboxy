'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('svg-to-png')!

export default function SvgToPngPage({ params }: { params: { lang: string } }) {
  const [svgText, setSvgText] = useState('')
  const [scale, setScale] = useState(2)
  const [resultUrl, setResultUrl] = useState('')
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const tracked = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => {
      setSvgText(ev.target?.result as string || '')
      setResultUrl('')
      setError('')
    }
    reader.readAsText(f)
  }

  function convert() {
    if (!svgText.trim() || !canvasRef.current) return
    if (!tracked.current) { trackToolUsed('svg-to-png'); tracked.current = true }
    setLoading(true)
    setError('')
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgText, 'image/svg+xml')
      const svgEl = doc.querySelector('svg')
      if (!svgEl) { setError('Invalid SVG'); setLoading(false); return }

      const vb = svgEl.getAttribute('viewBox')?.split(/[\s,]+/).map(Number)
      const w = vb ? vb[2] : (parseFloat(svgEl.getAttribute('width') || '400'))
      const h = vb ? vb[3] : (parseFloat(svgEl.getAttribute('height') || '400'))
      const finalW = Math.round(w * scale)
      const finalH = Math.round(h * scale)
      setDims({ w: finalW, h: finalH })

      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current!
        canvas.width = finalW
        canvas.height = finalH
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, finalW, finalH)
        URL.revokeObjectURL(url)
        canvas.toBlob(b => {
          if (!b) { setLoading(false); return }
          setResultUrl(URL.createObjectURL(b))
          setLoading(false)
        }, 'image/png')
      }
      img.onerror = () => { setError('Failed to render SVG'); setLoading(false) }
      img.src = url
    } catch (e: unknown) {
      setError((e as Error).message)
      setLoading(false)
    }
  }

  function download() {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = 'image.png'
    a.click()
    trackToolDownload('svg-to-png', 'png')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <canvas ref={canvasRef} className="hidden" />
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload SVG File</label>
          <input type="file" accept=".svg,image/svg+xml" onChange={onFile}
            className="block text-sm text-gray-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:font-medium hover:file:bg-brand-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Or paste SVG code</label>
          <textarea value={svgText} onChange={e => { setSvgText(e.target.value); setResultUrl(''); setError('') }}
            rows={6} placeholder="<svg xmlns=..." 
            className="w-full p-4 border border-gray-200 rounded-xl resize-none text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Scale: {scale}x (output: {dims.w > 0 ? dims.w + 'x' + dims.h + 'px' : '?'})</label>
          <input type="range" min={1} max={4} step={0.5} value={scale} onChange={e => setScale(parseFloat(e.target.value))} className="w-48" />
        </div>
        <button onClick={convert} disabled={!svgText.trim() || loading}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
          {loading ? 'Converting...' : 'Convert to PNG'}
        </button>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">&#x274C; {error}</p>}
        {resultUrl && (
          <div className="space-y-3">
            <img src={resultUrl} alt="result" className="max-h-48 rounded-xl border border-gray-200 object-contain mx-auto" />
            <div className="flex justify-center">
              <button onClick={download} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">
                &#x2B07; Download PNG ({dims.w}x{dims.h}px)
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
