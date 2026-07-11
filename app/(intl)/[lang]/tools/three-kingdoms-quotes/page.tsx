'use client'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { TK_QUOTES, quoteOfToday } from '@/lib/tools/threeKingdomsQuotes'
import { TKC_BY_ID } from '@/lib/tools/threeKingdomsCharacters'
import { PEOPLE } from '@/lib/tools/threeKingdomsIdioms'
import { SRC_META, asTKLang, type TKLang } from '@/lib/tools/tkCommon'

const tool = getToolBySlug('three-kingdoms-quotes')!
const pName = (id: string, lang: TKLang) => TKC_BY_ID[id]?.name[lang] ?? PEOPLE[id]?.name[lang] ?? id

export default function ThreeKingdomsQuotesPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = asTKLang(params.lang)

  const [person, setPerson] = useState('')
  const [today, setToday] = useState(TK_QUOTES[0])
  useEffect(() => { setToday(quoteOfToday()) }, [])

  const personIds = useMemo(() => {
    const cnt: Record<string, number> = {}
    TK_QUOTES.forEach((q) => { cnt[q.person] = (cnt[q.person] || 0) + 1 })
    return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])
  }, [])

  const list = person ? TK_QUOTES.filter((q) => q.person === person) : TK_QUOTES

  const chipCls = (on: boolean) =>
    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ' +
    (on ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tkq_title')}</h1>
        <p className="text-gray-500 mb-6">{t('tkq_subtitle')}</p>

        {/* quote of the day */}
        <Link href={`/${lang}/tools/three-kingdoms-quotes/${today.slug}`}
          className="block rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 mb-6 hover:bg-amber-100 transition-colors">
          <p className="text-[11px] font-bold text-amber-600 mb-1">{t('tkq_today')}</p>
          <p className="text-lg font-black text-gray-900 font-serif">{today.hanmun}</p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">“{today.trans[lang]}” — {pName(today.person, lang)}</p>
        </Link>

        <div className="flex flex-wrap gap-1.5 mb-5">
          <button onClick={() => setPerson('')} className={chipCls(person === '')}>{t('tkq_all')}</button>
          {personIds.map((p) => (
            <button key={p} onClick={() => setPerson(person === p ? '' : p)} className={chipCls(person === p)}>{pName(p, lang)}</button>
          ))}
        </div>

        <div className="grid gap-3 min-[520px]:grid-cols-2">
          {list.map((q) => (
            <Link key={q.slug} href={`/${lang}/tools/three-kingdoms-quotes/${q.slug}`}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-300 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <p className="font-serif text-base font-black text-gray-900 leading-snug">{q.hanmun}</p>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: SRC_META[q.src].color }}>{SRC_META[q.src].label[lang]}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">“{q.trans[lang]}”</p>
              <p className="text-xs font-bold text-gray-400 mt-1.5">— {pName(q.person, lang)}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
          <Link href={`/${lang}/tools/three-kingdoms-characters`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            👤 {t('tkc_title')}
          </Link>
          <Link href={`/${lang}/tools/three-kingdoms-idioms`}
            className="block rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 text-center text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
            📜 {t('tki_title')}
          </Link>
        </div>
      </div>
    </ToolLayout>
  )
}
