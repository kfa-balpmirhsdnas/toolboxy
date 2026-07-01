'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('blur-image')!

export default function BlurImagePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [src, setSrc] = useState('')
  const [blur, setBlur] = useState(8)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function render() {
    const c = canvasRef.current
    if (!c || !src) return
    const img = new Image()
    img.onload = () => {
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d')!
      ctx.filter = `blur(${blur}px)`
      ctx.drawImage(img, 0, 0)
      ctx.filter = 'none'
    }
    img.src = src
  }

  useEffect(() => { render() }, [src, blur]) // eslint-disable-line react-hooks/exhaustive-deps

  function load(f: File) { setSrc(URL.createObjectURL(f)); trackToolUsed('blur-image') }
  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'blurred.png'; a.click()
      trackToolDownload('blur-image', 'png')
    }, 'image/png')
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!src ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">🌫</p><p className="text-sm font-medium text-gray-600">{t('ati_drop')}</p>
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full max-h-72 object-contain rounded-xl border border-gray-200 bg-gray-100" />
            <div>
              <label className="text-sm text-gray-600">{t('bi_blur')}: {blur}px</label>
              <input type="range" min={0} max={40} value={blur} onChange={(e) => setBlur(+e.target.value)} className="w-full" />
            </div>
            <div className="flex gap-2">
              <button onClick={download} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 inline-flex items-center justify-center gap-1.5"><ToolIcon name="download" className="w-4 h-4" />{t('ati_downloadpng')}</button>
              <button onClick={() => setSrc('')} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{t('ati_changeimg')}</button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center">{t('cc_note')}</p>
      </div>
    </ToolLayout>
  )
}
