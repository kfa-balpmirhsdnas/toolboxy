'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('meme-generator')!

export default function MemeGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [src, setSrc] = useState('')
  const [top, setTop] = useState('TOP TEXT')
  const [bottom, setBottom] = useState('BOTTOM TEXT')
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function draw() {
    const c = canvasRef.current
    if (!c || !src) return
    const img = new Image()
    img.onload = () => {
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const size = Math.round(c.width / 10)
      ctx.font = `bold ${size}px Impact, "Arial Black", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = Math.max(2, size / 14)
      ctx.lineJoin = 'round'
      const drawText = (text: string, y: number) => {
        const up = text.toUpperCase()
        ctx.strokeText(up, c.width / 2, y, c.width * 0.95)
        ctx.fillText(up, c.width / 2, y, c.width * 0.95)
      }
      if (top) drawText(top, size * 1.1)
      if (bottom) drawText(bottom, c.height - size * 0.4)
    }
    img.src = src
  }

  useEffect(() => { draw() }, [src, top, bottom]) // eslint-disable-line react-hooks/exhaustive-deps

  function load(f: File) { setSrc(URL.createObjectURL(f)); trackToolUsed('meme-generator') }
  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'meme.png'; a.click()
      trackToolDownload('meme-generator', 'png')
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
            <p className="text-4xl mb-2">😂</p><p className="text-sm font-medium text-gray-600">{t('ati_drop')}</p>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full rounded-xl border border-gray-200 bg-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={top} onChange={(e) => setTop(e.target.value)} placeholder={t('meme_top')}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <input value={bottom} onChange={(e) => setBottom(e.target.value)} placeholder={t('meme_bottom')}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={download} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">⬇ {t('meme_download')}</button>
              <button onClick={() => setSrc('')} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{t('ati_changeimg')}</button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center">{t('meme_note')}</p>
      </div>
    </ToolLayout>
  )
}
