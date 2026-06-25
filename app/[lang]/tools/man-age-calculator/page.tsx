'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('man-age-calculator')!

export default function ManAgePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [birth, setBirth] = useState('2000-01-01')
  const b = new Date(birth + 'T00:00:00')
  const now = new Date()
  const ok = !isNaN(b.getTime()) && b.getTime() <= now.getTime()

  let man = 0, counting = 0, yearAge = 0, toNext = 0
  if (ok) {
    man = now.getFullYear() - b.getFullYear()
    if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) man--
    yearAge = now.getFullYear() - b.getFullYear()
    counting = yearAge + 1
    const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const next = new Date(now.getFullYear(), b.getMonth(), b.getDate())
    if (next.getTime() < today0) next.setFullYear(now.getFullYear() + 1)
    toNext = Math.round((next.getTime() - today0) / 86400000)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ma_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ma_subtitle')}</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-gray-600">{t('ma_birthdate')}
          <input value={birth} onChange={(e) => setBirth(e.target.value)} type="date"
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </label>

        {ok ? (
          <>
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
              <div className="text-sm text-brand-700">{t('ma_man')}</div>
              <div className="text-5xl font-bold text-brand-700 mt-1">{man}<span className="text-2xl font-medium ml-1">{t('ma_years')}</span></div>
              <div className="text-xs text-gray-500 mt-2">{t('ma_next', { n: toNext })}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-gray-100 p-3"><div className="text-xs text-gray-500">{t('ma_counting')}</div><div className="text-2xl font-bold text-gray-800">{counting}</div></div>
              <div className="rounded-xl border border-gray-100 p-3"><div className="text-xs text-gray-500">{t('ma_year')}</div><div className="text-2xl font-bold text-gray-800">{yearAge}</div></div>
            </div>
          </>
        ) : (
          <p className="rounded-xl bg-amber-50 text-amber-700 text-sm px-4 py-3">{t('ma_error')}</p>
        )}

        <p className="text-xs text-gray-400">{t('ma_note')}</p>
      </div>
    </ToolLayout>
  )
}
