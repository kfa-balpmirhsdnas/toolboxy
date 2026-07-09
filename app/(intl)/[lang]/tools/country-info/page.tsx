'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { COUNTRIES, countrySlug, cName, capName, flag, regionName, type Region } from '@/lib/countries'

const tool = getToolBySlug('country-info')!
const REGIONS: Region[] = ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania']

// Hub page: searchable directory of every country, linking to the per-country fact pages.
export default function CountryInfoPage({ params: { lang } }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const match = (c: (typeof COUNTRIES)[number]) =>
    !needle || [c.en, c.ko, c.ja, c.code, c.dial, capName(c, lang)].some((x) => x.toLowerCase().includes(needle))

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4 max-w-2xl mx-auto">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('cin_search')}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400" />
        {REGIONS.map((r) => {
          const list = COUNTRIES.filter((c) => c.region === r && match(c))
          if (!list.length) return null
          return (
            <div key={r}>
              <h2 className="text-sm font-bold text-gray-500 mb-2">{regionName(r, lang)} <span className="font-normal text-gray-400">{list.length}</span></h2>
              <div className="flex flex-wrap gap-1.5">
                {list.map((c) => (
                  <Link key={c.code} href={`/${lang}/tools/country-info/${countrySlug(c)}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50">
                    <span>{flag(c.code)}</span><span>{cName(c, lang)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
        <p className="text-xs text-gray-400">{t('cin_note')}</p>
      </div>
    </ToolLayout>
  )
}
