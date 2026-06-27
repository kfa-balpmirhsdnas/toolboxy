'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import BatchToolNav from '@/components/tools/BatchToolNav'
import { getToolBySlug } from '@/lib/tools/registry'
import { peekBatch, clearBatch } from '@/lib/batch-image/handoff'
import { resizeImage, type ResizeMode, type ResizeAxis } from '@/lib/batch-image/resize'

const tool = getToolBySlug('batch-image-resizer')!
const PCT_PRESETS = [10, 25, 50, 75, 100, 150, 200]
const QUAL_PRESETS = [10, 30, 50, 75, 85, 90, 95, 100]

export default function BatchImageResizerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [results, setResults] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [mode, setMode] = useState<ResizeMode>('maxside')
  const [axis, setAxis] = useState<ResizeAxis>('longest')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [keepRatio, setKeepRatio] = useState(true)
  const [percent, setPercent] = useState('50')
  const [maxSide, setMaxSide] = useState('1920')
  const [quality, setQuality] = useState('85')

  // Auto-fill W/H from the first selected image (for the "해상도" / dimensions mode).
  const filledRef = useRef(false)
  const onFilesChange = useCallback((files: File[]) => {
    if (!files.length) { filledRef.current = false; return }
    if (filledRef.current) return
    filledRef.current = true
    createImageBitmap(files[0])
      .then((bmp) => { setWidth(String(bmp.width)); setHeight(String(bmp.height)); bmp.close?.() })
      .catch(() => { /* undecodable — leave inputs empty */ })
  }, [])

  const processFn = useCallback<ProcessFn>(
    (file) => resizeImage(file, {
      mode, axis, width: Number(width) || undefined, height: Number(height) || undefined,
      keepRatio, percent: Number(percent) || 100, maxSide: Number(maxSide) || 0,
      quality: Number(quality) || 85,
    }),
    [mode, axis, width, height, keepRatio, percent, maxSide, quality],
  )

  const modes: { id: ResizeMode; label: string }[] = [
    { id: 'maxside', label: t('bir_mode_maxside') },
    { id: 'dimensions', label: t('bir_mode_dimensions') },
    { id: 'percent', label: t('bir_mode_percent') },
  ]
  const numInput = 'w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
  const selCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-medium text-gray-700">{t('bir_size')}</p>
          <div className="flex flex-wrap gap-1.5">
            {modes.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode === m.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Description + controls in one fixed-min-height block so switching modes doesn't shift the layout */}
          <div className="min-h-[6.5rem] sm:min-h-[4.25rem] space-y-3">
            <p className="text-xs text-gray-400">
              {mode === 'maxside' ? t('bir_desc_maxside') : mode === 'dimensions' ? t('bir_desc_dimensions') : t('bir_desc_percent')}
            </p>
            <div>
            {mode === 'maxside' && (
              <label className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                <select value={axis} onChange={(e) => setAxis(e.target.value as ResizeAxis)} className={selCls}>
                  <option value="longest">{t('bir_axis_longest')}</option>
                  <option value="shortest">{t('bir_axis_shortest')}</option>
                  <option value="width">{t('bir_axis_width')}</option>
                  <option value="height">{t('bir_axis_height')}</option>
                </select>
                <input type="number" min={1} value={maxSide} onChange={(e) => setMaxSide(e.target.value)} className={numInput} />
                px
              </label>
            )}

            {mode === 'dimensions' && (
              // Mobile: W/H row, then checkbox below. Desktop: checkbox to the right of the inputs.
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <label className="flex items-center gap-2">W
                    <input type="number" min={1} placeholder={t('bir_auto')} value={width} onChange={(e) => setWidth(e.target.value)} className={numInput} />
                  </label>
                  <label className="flex items-center gap-2">H
                    <input type="number" min={1} placeholder={t('bir_auto')} value={height} onChange={(e) => setHeight(e.target.value)} className={numInput} />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} className="accent-brand-600" />
                  {t('bir_keep_ratio')}
                </label>
              </div>
            )}

            {mode === 'percent' && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <select value={PCT_PRESETS.includes(Number(percent)) ? percent : ''} onChange={(e) => setPercent(e.target.value)} className={selCls}>
                  <option value="" disabled hidden></option>
                  {PCT_PRESETS.map((v) => <option key={v} value={v}>{v}%</option>)}
                </select>
                <input type="range" min={1} max={200} value={percent} onChange={(e) => setPercent(e.target.value)} className="flex-1 sm:flex-none sm:w-72 accent-brand-600" />
                <span className="w-12 text-right text-gray-500">{percent}%</span>
              </div>
            )}
            </div>
          </div>

          {/* Quality — independent of the size mode (applies to JPEG/WebP output) */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">{t('bir_quality')}</p>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <select value={QUAL_PRESETS.includes(Number(quality)) ? quality : ''} onChange={(e) => setQuality(e.target.value)} className={selCls}>
                <option value="" disabled hidden></option>
                {QUAL_PRESETS.map((v) => <option key={v} value={v}>{v}%</option>)}
              </select>
              <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(e.target.value)} className="flex-1 sm:flex-none sm:w-72 accent-brand-600" />
              <span className="w-12 text-right text-gray-500">{quality}%</span>
            </div>
            <p className="text-xs text-gray-400">{t('bir_quality_desc')}</p>
          </div>
        </div>

        <BatchImageProcessor slug="batch-image-resizer" processFn={processFn} zipBaseName="resized"
          ctaLabel={(n) => t('bir_cta', { n })} initialFiles={seed} onComplete={setResults} onFilesChange={onFilesChange} />
        <BatchToolNav current="batch-image-resizer" lang={params.lang} results={results} />
      </div>
    </ToolLayout>
  )
}
