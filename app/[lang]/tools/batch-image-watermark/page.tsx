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
const OPACITY_PRESETS = [20, 40, 60, 80, 100]
const ARROWS: Record<Position, string> = {
  tl: '↖', tc: '↑', tr: '↗',
  ml: '←', mc: '●', mr: '→',
  bl: '↙', bc: '↓', br: '↘',
}

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
  const selCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        {/* PC: content left, style right. Mobile: stacked. */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Content box: text / logo + size */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 sm:flex-1">
            <p className="text-sm font-medium text-gray-700">{t('bwm_box_content')}</p>
            <div className="flex gap-1.5">
              {(['text', 'image'] as WatermarkType[]).map((tp) => (
                <button key={tp} onClick={() => setType(tp)}
                  className={'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (type === tp ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {tp === 'text' ? t('bwm_text') : t('bwm_logo')}
                </button>
              ))}
            </div>

            {/* Fixed height so the content box doesn't shift when switching text/logo (mobile too). */}
            <div className="min-h-[5.5rem]">
            {type === 'text' && (
              <div className="space-y-3">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('bwm_text_ph')} className={inp + ' w-full'} />
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <label className="flex items-center gap-2 shrink-0">
                    {t('bwm_color')}
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-9 h-9 rounded border border-gray-200 cursor-pointer" />
                  </label>
                  <label className="flex items-center gap-2">
                    {t('bwm_size')}
                    <input type="range" min={1} max={20} value={fontPct} onChange={(e) => setFontPct(e.target.value)} className="w-20 sm:w-28 accent-brand-600" />
                    <span className="text-gray-500 w-9 text-right">{fontPct}%</span>
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
                  <input type="range" min={2} max={60} value={logoScalePct} onChange={(e) => setLogoScalePct(e.target.value)} className="w-24 accent-brand-600" />
                  <span className="text-gray-500 w-9">{logoScalePct}%</span>
                </label>
              </div>
            )}
            </div>
          </div>

          {/* Style box: opacity + position */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 sm:flex-1">
            <p className="text-sm font-medium text-gray-700">{t('bwm_box_style')}</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="shrink-0">{t('bwm_opacity')}</span>
              <select value={OPACITY_PRESETS.includes(Number(opacity)) ? opacity : ''} onChange={(e) => setOpacity(e.target.value)} className={selCls}>
                <option value="" disabled hidden></option>
                {OPACITY_PRESETS.map((v) => <option key={v} value={v}>{v}%</option>)}
              </select>
              <input type="range" min={1} max={100} value={opacity} onChange={(e) => setOpacity(e.target.value)} className="w-14 sm:flex-1 accent-brand-600" />
              <span className="w-10 text-right text-gray-500 shrink-0">{opacity}%</span>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 shrink-0 w-[39px]">{t('bwm_position')}</p>
              <div className="inline-grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg">
                {POSITIONS.map((p) => (
                  <button key={p} onClick={() => setPosition(p)} aria-label={p}
                    className={'w-8 h-8 rounded text-sm leading-none flex items-center justify-center transition-colors ' + (position === p ? 'bg-brand-600 text-white' : 'bg-white text-gray-400 hover:bg-brand-100')}>
                    {ARROWS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BatchImageProcessor slug="batch-image-watermark" processFn={processFn} zipBaseName="watermarked" initialFiles={seed} onComplete={setResults} />
        <BatchToolNav current="batch-image-watermark" lang={params.lang} results={results} />
      </div>
    </ToolLayout>
  )
}
