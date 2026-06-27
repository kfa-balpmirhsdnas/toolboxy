'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('engagement-rate-calculator')!

export default function EngagementRateCalculatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [followers, setFollowers] = useState('')
  const [likes, setLikes] = useState('')
  const [comments, setComments] = useState('')

  const f = Math.max(0, parseFloat(followers) || 0)
  const l = Math.max(0, parseFloat(likes) || 0)
  const c = Math.max(0, parseFloat(comments) || 0)
  const rate = f > 0 ? ((l + c) / f) * 100 : null

  const tier = rate == null ? null : rate < 1 ? { k: 'er_tier_low', c: 'text-gray-500 bg-gray-100' }
    : rate < 3.5 ? { k: 'er_tier_avg', c: 'text-blue-700 bg-blue-100' }
      : rate < 6 ? { k: 'er_tier_high', c: 'text-emerald-700 bg-emerald-100' }
        : { k: 'er_tier_top', c: 'text-amber-700 bg-amber-100' }

  const field = (label: string, v: string, set: (s: string) => void, ph: string) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input value={v} onChange={(e) => set(e.target.value)} type="number" min="0" inputMode="numeric" placeholder={ph}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('er_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('er_subtitle')}</p>
        </div>

        <div className="space-y-3">
          {field(t('er_followers'), followers, setFollowers, '10000')}
          <div className="grid grid-cols-2 gap-3">
            {field(t('er_likes'), likes, setLikes, '500')}
            {field(t('er_comments'), comments, setComments, '30')}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-brand-100 bg-brand-50 py-7 text-center">
          <div className="text-sm text-brand-700">{t('er_rate')}</div>
          <div className="text-4xl font-extrabold text-brand-700 mt-1">{rate == null ? '—' : `${rate.toFixed(2)}%`}</div>
          {tier && <div className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold ${tier.c}`}>{t(tier.k)}</div>}
        </div>
        <p className="text-xs text-gray-400">{t('er_note')}</p>
      </div>
    </ToolLayout>
  )
}
