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

export default function BatchImageCompressorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [results, setResults] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [quality, setQuality] = useState('70')
  const [useTarget, setUseTarget] = useState(false)
  const [targetKB, setTargetKB] = useState('300')

  const processFn = useCallback<ProcessFn>(
    (file) => compressImage(file, {
      quality: Number(quality) || 70,
      targetKB: useTarget ? Number(targetKB) || undefined : undefined,
    }),
    [quality, useTarget, targetKB],
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className={useTarget ? 'opacity-40 pointer-events-none' : ''}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-700">{t('bcp_quality')}</p>
              <span className="text-sm text-gray-500">{quality}%</span>
            </div>
            <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(e.target.value)} disabled={useTarget} className="w-full accent-brand-600" />
            <p className="text-xs text-gray-400 mt-1">{t('bcp_quality_hint')}</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={useTarget} onChange={(e) => setUseTarget(e.target.checked)} className="accent-brand-600" />
              {t('bcp_target_size')}
            </label>
            {useTarget && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                {t('bcp_aim_under')}
                <input type="number" min={1} value={targetKB} onChange={(e) => setTargetKB(e.target.value)}
                  className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                {t('bcp_kb_each')} <span className="text-xs text-gray-400">(JPEG/WebP)</span>
              </div>
            )}
          </div>
        </div>

        <BatchImageProcessor slug="batch-image-compressor" processFn={processFn} zipBaseName="compressed" initialFiles={seed} onComplete={setResults} />
        <BatchToolNav current="batch-image-compressor" lang={params.lang} results={results} />
      </div>
    </ToolLayout>
  )
}
