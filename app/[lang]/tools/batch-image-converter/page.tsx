'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import BatchImageProcessor, { type ProcessFn } from '@/components/tools/BatchImageProcessor'
import BatchToolNav from '@/components/tools/BatchToolNav'
import { getToolBySlug } from '@/lib/tools/registry'
import { peekBatch, clearBatch } from '@/lib/batch-image/handoff'
import { convertImage, type OutFormat } from '@/lib/batch-image/convert'

const tool = getToolBySlug('batch-image-converter')!

export default function BatchImageConverterPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [seed] = useState<File[] | null>(() => peekBatch())
  const [results, setResults] = useState<File[] | null>(null)
  useEffect(() => { clearBatch() }, [])

  const [format, setFormat] = useState<OutFormat>('webp')
  const [quality, setQuality] = useState('90')

  const processFn = useCallback<ProcessFn>(
    (file) => convertImage(file, { format, quality: Number(quality) || 90 }),
    [format, quality],
  )

  const formats: { id: OutFormat; label: string }[] = [
    { id: 'jpeg', label: 'JPG' }, { id: 'png', label: 'PNG' }, { id: 'webp', label: 'WebP' },
  ]
  const lossy = format === 'jpeg' || format === 'webp'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">{t('bcv_output_format')}</p>
            <div className="flex flex-wrap gap-1.5">
              {formats.map((f) => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className={'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (format === f.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className={lossy ? '' : 'opacity-40 pointer-events-none'}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-700">{t('bcv_quality')}</p>
              <span className="text-sm text-gray-500">{lossy ? `${quality}%` : t('bcv_lossless')}</span>
            </div>
            <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(e.target.value)} disabled={!lossy} className="w-full accent-brand-600" />
          </div>
        </div>

        <BatchImageProcessor slug="batch-image-converter" processFn={processFn} zipBaseName="converted" initialFiles={seed} onComplete={setResults} />
        <BatchToolNav current="batch-image-converter" lang={params.lang} results={results} />
      </div>
    </ToolLayout>
  )
}
