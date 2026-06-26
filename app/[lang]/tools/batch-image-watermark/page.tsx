'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import BatchToolNav from '@/components/tools/BatchToolNav'
import { getToolBySlug } from '@/lib/tools/registry'
import { peekBatch, clearBatch } from '@/lib/batch-image/handoff'
import { watermarkImage, type WatermarkType, type Position } from '@/lib/batch-image/watermark'

const tool = getToolBySlug('batch-image-watermark')!
const POSITIONS: Position[] = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br']

export default function BatchImageWatermarkPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [results, setResults] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [type, setType] = useState<WatermarkType>('text')
  const [text, setText] = useState('© ToolBoxy')
  const [fontPct, setFontPct] = useState('5')
  const [color, setColor] = useState('#ffffff')
  const [opacity, setOpacity] = useState('60')
  const [position, setPosition] = useState<Position>('br')
  const [logo, setLogo] = useState<ImageBitmap | null>(null)
  const [logoName, setLogoName] = useState('')
  const [logoScalePct, setLogoScalePct] = useState('20')
  const logoInputRef = useRef<HTMLInputElement>(null)

  async function onLogo(file: File | undefined) {
    if (!file) return
    try { setLogo(await createImageBitmap(file)); setLogoName(file.name) }
    catch { setLogoName(''); setLogo(null) }
  }

  const processFn = useCallback<ProcessFn>(
    (file) => watermarkImage(file, {
      type, opacity: Number(opacity) || 100, position,
      text, fontPct: Number(fontPct) || 5, color,
      logo, logoScalePct: Number(logoScalePct) || 20,
    }),
    [type, opacity, position, text, fontPct, color, logo, logoScalePct],
  )

  const inp = 'px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex gap-1.5">
            {(['text', 'image'] as WatermarkType[]).map((tp) => (
              <button key={tp} onClick={() => setType(tp)}
                className={'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (type === tp ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {tp === 'text' ? t('bwm_text') : t('bwm_logo')}
              </button>
            ))}
          </div>

          {type === 'text' && (
            <div className="space-y-3">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('bwm_text_ph')} className={inp + ' w-full'} />
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  {t('bwm_color')}
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-9 h-9 rounded border border-gray-200 cursor-pointer" />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  {t('bwm_size')}
                  <input type="range" min={1} max={20} value={fontPct} onChange={(e) => setFontPct(e.target.value)} className="accent-brand-600" />
                  <span className="text-gray-500 w-9">{fontPct}%</span>
                </label>
              </div>
            </div>
          )}

          {type === 'image' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
                <button onClick={() => logoInputRef.current?.click()} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors">
                  {logoName ? t('bwm_change_logo') : t('bwm_upload_logo')}
                </button>
                <span className="text-sm text-gray-500 truncate">{logoName || t('bwm_no_logo')}</span>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                {t('bwm_logo_size')}
                <input type="range" min={2} max={60} value={logoScalePct} onChange={(e) => setLogoScalePct(e.target.value)} className="accent-brand-600" />
                <span className="text-gray-500 w-9">{logoScalePct}%</span>
              </label>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            {t('bwm_opacity')}
            <input type="range" min={1} max={100} value={opacity} onChange={(e) => setOpacity(e.target.value)} className="flex-1 accent-brand-600" />
            <span className="text-gray-500 w-9">{opacity}%</span>
          </label>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">{t('bwm_position')}</p>
            <div className="inline-grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg">
              {POSITIONS.map((p) => (
                <button key={p} onClick={() => setPosition(p)} aria-label={p}
                  className={'w-8 h-8 rounded transition-colors ' + (position === p ? 'bg-brand-600' : 'bg-white hover:bg-brand-100')}>
                  <span className={'block w-1.5 h-1.5 rounded-full mx-auto ' + (position === p ? 'bg-white' : 'bg-gray-400')} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <BatchImageProcessor slug="batch-image-watermark" processFn={processFn} zipBaseName="watermarked" initialFiles={seed} onComplete={setResults} />
        <BatchToolNav current="batch-image-watermark" lang={params.lang} results={results} />
      </div>
    </ToolLayout>
  )
}
