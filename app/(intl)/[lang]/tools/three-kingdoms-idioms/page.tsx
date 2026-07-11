'use client'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import {
  TK_IDIOMS, PEOPLE, SRC_META, tkiName, idiomOfToday, type TKILang, type TKISrc,
} from '@/lib/tools/threeKingdomsIdioms'

const tool = getToolBySlug('three-kingdoms-idioms')!
const asLang = (l: string): TKILang => (l === 'ko' || l === 'ja' ? l : 'en')

export default function ThreeKingdomsIdiomsPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = asLang(params.lang)

  const [q, setQ] = useState('')
  const [person, setPerson] = useState('')     // person id filter
  const [srcF, setSrcF] = useState<TKISrc | ''>('')
  const [today, setToday] = useState(TK_IDIOMS[0])

  // ?person= deep link (from the people tags on idiom pages) + date-seeded pick
  // (set in an effect so SSR html stays date-independent).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('person')
    if (p && PEOPLE[p]) setPerson(p)
    setToday(idiomOfToday())
  }, [])

  // People that actually appear, ordered by frequency (top ones make useful filters).
  const personIds = useMemo(() => {
    const cnt: Record<string, number> = {}
    TK_IDIOMS.forEach((i) => i.people.forEach((p) => { cnt[p] = (cnt[p] || 0) + 1 }))
    return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])
  }, [])

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return TK_IDIOMS
      .filter((i) => {
        if (person && !i.people.includes(person)) return false
        if (srcF && i.src !== srcF) return false
        if (!needle) return true
        return (
          i.hanja.includes(needle) || i.ko.toLowerCase().includes(needle) ||
          i.ja.toLowerCase().includes(needle) || i.enLit.toLowerCase().includes(needle) ||
          i.pinyin.toLowerCase().includes(needle) || i.meaning[lang].toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => tkiName(a, lang).localeCompare(tkiName(b, lang), lang))
  }, [q, person, srcF, lang])

  const chipCls = (on: boolean) =>
    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ' +
    (on ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tki_title')}</h1>
        <p className="text-gray-500 mb-6">{t('tki_subtitle')}</p>

        {/* idiom of the day */}
        <Link href={`/${lang}/tools/three-kingdoms-idioms/${today.slug}`}
          className="block rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 mb-6 hover:bg-amber-100 transition-colors">
          <p className="text-[11px] font-bold text-amber-600 mb-1">{t('tki_today')}</p>
          <p className="text-lg font-black text-gray-900 font-serif">{today.hanja} <span className="font-sans font-bold text-base">{tkiName(today, lang)}</span></p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{today.meaning[lang]}</p>
        </Link>

        {/* search + filters */}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('tki_search_ph')}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3" />
        <div className="flex flex-wrap gap-1.5 mb-2">
          <button onClick={() => setSrcF('')} className={chipCls(srcF === '')}>{t('tki_all')}</button>
          {(Object.keys(SRC_META) as TKISrc[]).map((k) => (
            <button key={k} onClick={() => setSrcF(srcF === k ? '' : k)} className={chipCls(srcF === k)}>{SRC_META[k].label[lang]}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {personIds.map((p) => (
            <button key={p} onClick={() => setPerson(person === p ? '' : p)} className={chipCls(person === p)}>{PEOPLE[p].name[lang]}</button>
          ))}
        </div>

        {/* card grid */}
        <div className="grid gap-3 min-[520px]:grid-cols-2">
          {list.map((i) => (
            <Link key={i.slug} href={`/${lang}/tools/three-kingdoms-idioms/${i.slug}`}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-300 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <p className="font-serif text-lg font-black text-gray-900">{i.hanja}</p>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: SRC_META[i.src].color }}>{SRC_META[i.src].label[lang]}</span>
              </div>
              <p className="text-sm font-bold text-gray-700">{tkiName(i, lang)}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{i.meaning[lang]}</p>
            </Link>
          ))}
        </div>
        {list.length === 0 && <p className="text-center text-sm text-gray-400 py-10">{t('tki_no_result')}</p>}

        {/* personality test cross-link */}
        <Link href={`/${lang}/tools/three-kingdoms-test`}
          className="mt-8 block rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 text-center font-bold text-brand-700 hover:bg-brand-100 transition-colors">
          ⚔️ {t('tki_test_banner')}
        </Link>
      </div>
    </ToolLayout>
  )
}
