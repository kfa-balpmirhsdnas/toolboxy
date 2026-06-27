'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import BatchToolNav from '@/components/tools/BatchToolNav'
import { getToolBySlug } from '@/lib/tools/registry'
import { peekBatch, clearBatch } from '@/lib/batch-image/handoff'
import { compressImage } from '@/lib/batch-image/compress'

const tool = getToolBySlug('batch-image-compressor')!
const QUAL_PRESETS = [10, 30, 50, 75, 85, 90, 95, 100]

export default function BatchImageCompressorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [results, setResults] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [quality, setQuality] = useState('75')
  const [useTarget, setUseTarget] = useState(false)
  const [targetKB, setTargetKB] = useState('300')

  const processFn = useCallback<ProcessFn>(
    (file) => compressImage(file, {
      quality: Number(quality) || 75,
      targetKB: useTarget ? Number(targetKB) || undefined : undefined,
    }),
    [quality, useTarget, targetKB],
  )

  const selCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        {/* PC: quality left, target size right (equal height). Mobile: stacked. */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Quality box (disabled when target size is on) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 sm:flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-sm font-medium text-gray-700 shrink-0">{t('bcp_quality')}</p>
              <p className="text-xs text-gray-400">{t('bir_quality_desc')}</p>
            </div>
            <div className={'flex items-center gap-3 text-sm text-gray-700' + (useTarget ? ' opacity-40 pointer-events-none' : '')}>
              <select value={QUAL_PRESETS.includes(Number(quality)) ? quality : ''} onChange={(e) => setQuality(e.target.value)} disabled={useTarget} className={selCls}>
                <option value="" disabled hidden></option>
                {QUAL_PRESETS.map((v) => <option key={v} value={v}>{v}%</option>)}
              </select>
              <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(e.target.value)} disabled={useTarget} className="flex-1 accent-brand-600" />
              <span className="w-12 text-right text-gray-500">{quality}%</span>
            </div>
          </div>

          {/* Target size box — toggle compresses to a size instead of a quality */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 sm:flex-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={useTarget} onChange={(e) => setUseTarget(e.target.checked)} className="accent-brand-600" />
              <span className="text-sm font-medium text-gray-700">{t('bcp_target_size')}</span>
            </label>
            <p className="text-xs text-gray-400">{t('bcp_target_desc')}</p>
            <div className={'flex items-center gap-2 text-sm text-gray-700' + (useTarget ? '' : ' opacity-40 pointer-events-none')}>
              {t('bcp_aim_under')}
              <input type="number" min={1} value={targetKB} onChange={(e) => setTargetKB(e.target.value)} disabled={!useTarget}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              {t('bcp_kb_each')}
            </div>
          </div>
        </div>

        <BatchImageProcessor slug="batch-image-compressor" processFn={processFn} zipBaseName="compressed" initialFiles={seed} onComplete={setResults} />
        <BatchToolNav current="batch-image-compressor" lang={params.lang} results={results} />
      </div>
    </ToolLayout>
  )
}
