'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('png-to-jpg')!

function fmtBytes(b: number) {
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(2) + ' MB'
}

export default function PngToJpgPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [original, setOriginal] = useState<File|null>(null)
  const [preview, setPreview] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [resultSize, setResultSize] = useState(0)
  const [quality, setQuality] = useState(0.92)
  const [loading, setLoading] = useState(false)
  const tracked = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function handleFile(file: File) {
    if (!tracked.current) { trackToolUsed('png-to-jpg'); tracked.current = true }
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
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (!blob) { setLoading(false); return }
        setResultUrl(URL.createObjectURL(blob))
        setResultSize(blob.size)
        setLoading(false)
      }, 'image/jpeg', quality)
    }
    img.src = preview
  }

  function download() {
    if (!resultUrl || !original) return
    const name = original.name.replace(/\.[^.]+$/, '') + '.jpg'
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = name
    a.click()
    trackToolDownload('png-to-jpg', 'jpg')
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
          <input ref={inputRef} type="file" accept="image/png" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {original ? (
            <p className="text-sm font-medium text-gray-700">{original.name} <span className="text-gray-400">({fmtBytes(original.size)})</span></p>
          ) : (
            <>
              <p className="text-4xl mb-2">&#x1F5BC;</p>
              <p className="text-sm font-medium text-gray-600">{t('ptj_drop')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('ptj_transparent')}</p>
            </>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t('ir_quality')}: {Math.round(quality * 100)}%</label>
          <input type="range" min={0.5} max={1} step={0.01} value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full" />
        </div>
        {preview && <img src={preview} alt="preview" className="max-h-48 rounded-xl border border-gray-200 object-contain mx-auto bg-gray-100" />}
        <button onClick={convert} disabled={!original || loading}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
          {loading ? t('wc_converting') : t('ptj_convert')}
        </button>
        {resultUrl && (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-green-800">{t('ptj_ready')}</p>
              <p className="text-xs text-green-600">{fmtBytes(resultSize)}</p>
            </div>
            <button onClick={download} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">
              &#x2B07; {t('ptj_download')}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
