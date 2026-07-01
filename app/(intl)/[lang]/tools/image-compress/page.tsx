'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'
import imageCompression from 'browser-image-compression'

const tool = getToolBySlug('image-compress')!

function fmtBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(2) + ' MB'
}

export default function ImageCompressPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [original, setOriginal] = useState<File|null>(null)
  const [preview, setPreview] = useState('')
  const [compressed, setCompressed] = useState<Blob|null>(null)
  const [compressedUrl, setCompressedUrl] = useState('')
  const [maxSizeMB, setMaxSizeMB] = useState(1)
  const [maxDim, setMaxDim] = useState(1920)
  const [loading, setLoading] = useState(false)
  const [savings, setSavings] = useState<number|null>(null)
  const tracked = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (!tracked.current) { trackToolUsed('image-compress'); tracked.current = true }
    setOriginal(file)
    setPreview(URL.createObjectURL(file))
    setCompressed(null)
    setCompressedUrl('')
    setSavings(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function compress() {
    if (!original) return
    setLoading(true)
    try {
      const opts = { maxSizeMB, maxWidthOrHeight: maxDim, useWebWorker: true }
      const blob = await imageCompression(original, opts)
      setCompressed(blob)
      const url = URL.createObjectURL(blob)
      setCompressedUrl(url)
      setSavings(Math.round((1 - blob.size / original.size) * 100))
    } catch (e: unknown) {
      console.error(e)
    }
    setLoading(false)
  }

  function download() {
    if (!compressedUrl || !original) return
    const ext = original.name.split('.').pop() || 'jpg'
    const name = original.name.replace(/\.[^.]+$/, '') + '_compressed.' + ext
    const a = document.createElement('a')
    a.href = compressedUrl
    a.download = name
    a.click()
    trackToolDownload('image-compress', 'image')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {original ? (
            <p className="text-sm text-gray-700 font-medium">{original.name} <span className="text-gray-400">({fmtBytes(original.size)})</span></p>
          ) : (
            <>
              <p className="text-4xl mb-2">&#x1F4F7;</p>
              <p className="text-sm font-medium text-gray-600">{t('ic_drop')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('ic_supported')}</p>
            </>
          )}
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>
        {/* Settings */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('ic_maxsize')}</label>
            <input type="number" min={0.1} max={10} step={0.1} value={maxSizeMB}
              onChange={e => setMaxSizeMB(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('ic_maxdim')}</label>
            <select value={maxDim} onChange={e => setMaxDim(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
              {[800,1024,1280,1920,2560,3840].map(d => <option key={d} value={d}>{d}px</option>)}
            </select>
          </div>
        </div>
        <button onClick={compress} disabled={!original || loading}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors">
          {loading ? t('ic_compressing') : t('ic_compress')}
        </button>
        {/* Preview side-by-side */}
        {preview && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">{t('ic_original')} {original ? '(' + fmtBytes(original.size) + ')' : ''}</p>
              <img src={preview} alt="original" className="w-full rounded-xl border border-gray-200 object-contain max-h-48" />
            </div>
            {compressedUrl && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{t('ic_compressed')} {compressed ? '(' + fmtBytes(compressed.size) + ')' : ''}</p>
                <img src={compressedUrl} alt="compressed" className="w-full rounded-xl border border-gray-200 object-contain max-h-48" />
              </div>
            )}
          </div>
        )}
        {savings !== null && compressed && original && (
          <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{savings}%</p>
              <p className="text-xs text-green-600">{t('ic_saved')}</p>
            </div>
            <div className="flex-1 text-sm text-green-800">
              {fmtBytes(original.size)} &#x2192; {fmtBytes(compressed.size)}
            </div>
            <button onClick={download} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
              {t('ic_download')}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
