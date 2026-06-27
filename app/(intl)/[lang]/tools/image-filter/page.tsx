'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('image-filter')!

type FX = { brightness: number; contrast: number; saturate: number; hue: number; grayscale: number; sepia: number; blur: number }
const RESET: FX = { brightness: 100, contrast: 100, saturate: 100, hue: 0, grayscale: 0, sepia: 0, blur: 0 }
const PRESETS: Record<string, FX> = {
  if_p_original: RESET,
  if_p_bw: { ...RESET, grayscale: 100, contrast: 110 },
  if_p_sepia: { ...RESET, sepia: 80, brightness: 105, saturate: 120 },
  if_p_vintage: { ...RESET, sepia: 45, contrast: 90, brightness: 105, saturate: 85 },
  if_p_sharp: { ...RESET, contrast: 130, saturate: 120, brightness: 102 },
  if_p_warm: { ...RESET, sepia: 25, saturate: 130, hue: 350, brightness: 105 },
  if_p_cool: { ...RESET, saturate: 110, hue: 200, brightness: 102 },
}
const filterStr = (f: FX) =>
  `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) hue-rotate(${f.hue}deg) grayscale(${f.grayscale}%) sepia(${f.sepia}%) blur(${f.blur}px)`

export default function ImageFilterPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [src, setSrc] = useState('')
  const [fx, setFx] = useState<FX>(RESET)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  function render() {
    const c = canvasRef.current, img = imgRef.current
    if (!c || !img) return
    c.width = img.naturalWidth; c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.filter = filterStr(fx)
    ctx.drawImage(img, 0, 0)
    ctx.filter = 'none'
  }

  useEffect(() => { render() }, [src, fx]) // eslint-disable-line react-hooks/exhaustive-deps

  function load(f: File) {
    const img = new Image()
    img.onload = () => { imgRef.current = img; render() }
    img.src = URL.createObjectURL(f)
    setSrc(img.src); setFx(RESET); trackToolUsed('image-filter')
  }
  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'filtered.png'; a.click()
      trackToolDownload('image-filter', 'png')
    }, 'image/png')
  }

  const sliders: [keyof FX, string, number, number][] = [
    ['brightness', 'if_brightness', 0, 200], ['contrast', 'if_contrast', 0, 200],
    ['saturate', 'if_saturate', 0, 200], ['hue', 'if_hue', 0, 360],
    ['grayscale', 'if_grayscale', 0, 100], ['sepia', 'if_sepia', 0, 100], ['blur', 'if_blur', 0, 20],
  ]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {!src ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">🎨</p><p className="text-sm font-medium text-gray-600">{t('if_upload')}</p>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full max-h-72 object-contain rounded-xl border border-gray-200 bg-gray-100" />

            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map((k) => (
                <button key={k} onClick={() => setFx(PRESETS[k])}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600">{t(k)}</button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
              {sliders.map(([k, label, min, max]) => (
                <div key={k}>
                  <label className="text-xs text-gray-500 flex justify-between"><span>{t(label)}</span><span className="tabular-nums">{fx[k]}{k === 'hue' ? '°' : k === 'blur' ? 'px' : '%'}</span></label>
                  <input type="range" min={min} max={max} value={fx[k]} onChange={(e) => setFx((p) => ({ ...p, [k]: +e.target.value }))} className="w-full" />
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={download} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">⬇ {t('if_download')}</button>
              <button onClick={() => setFx(RESET)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">{t('if_reset')}</button>
              <button onClick={() => setSrc('')} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{t('if_change')}</button>
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center">{t('if_note')}</p>
      </div>
    </ToolLayout>
  )
}
