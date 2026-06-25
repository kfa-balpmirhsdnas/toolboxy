'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('dday-calculator')!

export default function DdayPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [label, setLabel] = useState('')
  const [target, setTarget] = useState('')
  const d = new Date(target + 'T00:00:00')
  const ok = !!target && !isNaN(d.getTime())

  let diff = 0, dday = ''
  if (ok) {
    const now = new Date()
    const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    diff = Math.round((d.getTime() - today0) / 86400000)
    dday = diff === 0 ? 'D-DAY' : diff > 0 ? `D-${diff}` : `D+${-diff}`
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dd_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('dd_subtitle')}</p>
        </div>

        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-sm text-gray-600">{t('dd_label')}
            <input value={label} onChange={(e) => setLabel(e.target.value)} type="text" placeholder={t('dd_label_ph')}
              autoComplete="off" data-1p-ignore data-lpignore="true"
              className="rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">{t('dd_target')}
            <input value={target} onChange={(e) => setTarget(e.target.value)} type="date"
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </label>
        </div>

        {ok && (
          <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
            {label && <div className="text-sm text-brand-700 mb-1">{label}</div>}
            <div className="text-5xl font-extrabold text-brand-700 tracking-tight">{dday}</div>
            <div className="text-xs text-gray-500 mt-2">
              {diff > 0 ? t('dd_left', { n: diff }) : diff < 0 ? t('dd_passed', { n: -diff }) : t('dd_today')}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">{t('dd_note')}</p>
      </div>
    </ToolLayout>
  )
}
