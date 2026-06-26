'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import BatchToolNav from '@/components/tools/BatchToolNav'
import { getToolBySlug } from '@/lib/tools/registry'
import { peekBatch, clearBatch } from '@/lib/batch-image/handoff'
import { resizeImage, type ResizeMode } from '@/lib/batch-image/resize'

const tool = getToolBySlug('batch-image-resizer')!

export default function BatchImageResizerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [results, setResults] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [mode, setMode] = useState<ResizeMode>('maxside')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [keepRatio, setKeepRatio] = useState(true)
  const [percent, setPercent] = useState('50')
  const [maxSide, setMaxSide] = useState('1920')

  const processFn = useCallback<ProcessFn>(
    (file) => resizeImage(file, {
      mode, width: Number(width) || undefined, height: Number(height) || undefined,
      keepRatio, percent: Number(percent) || 100, maxSide: Number(maxSide) || 0,
    }),
    [mode, width, height, keepRatio, percent, maxSide],
  )

  const modes: { id: ResizeMode; label: string }[] = [
    { id: 'maxside', label: t('bir_mode_maxside') },
    { id: 'dimensions', label: t('bir_mode_dimensions') },
    { id: 'percent', label: t('bir_mode_percent') },
  ]
  const numInput = 'w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {modes.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (mode === m.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'maxside' && (
            <label className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
              {t('bir_longest_side')}
              <input type="number" min={1} value={maxSide} onChange={(e) => setMaxSide(e.target.value)} className={numInput} />
              px <span className="text-xs text-gray-400">{t('bir_downscale_only')}</span>
            </label>
          )}

          {mode === 'dimensions' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                <label className="flex items-center gap-2">W
                  <input type="number" min={1} placeholder={t('bir_auto')} value={width} onChange={(e) => setWidth(e.target.value)} className={numInput} />
                </label>
                <label className="flex items-center gap-2">H
                  <input type="number" min={1} placeholder={t('bir_auto')} value={height} onChange={(e) => setHeight(e.target.value)} className={numInput} />
                </label>
                <span className="text-gray-400">px</span>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} className="accent-brand-600" />
                {t('bir_keep_ratio')}
              </label>
            </div>
          )}

          {mode === 'percent' && (
            <label className="flex items-center gap-3 text-sm text-gray-700">
              {t('bir_scale')}
              <input type="range" min={1} max={200} value={percent} onChange={(e) => setPercent(e.target.value)} className="flex-1 accent-brand-600" />
              <input type="number" min={1} max={400} value={percent} onChange={(e) => setPercent(e.target.value)} className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
              %
            </label>
          )}
        </div>

        <BatchImageProcessor slug="batch-image-resizer" processFn={processFn} zipBaseName="resized" initialFiles={seed} onComplete={setResults} />
        <BatchToolNav current="batch-image-resizer" lang={params.lang} results={results} />
      </div>
    </ToolLayout>
  )
}
