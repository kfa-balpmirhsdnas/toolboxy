'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { TK_BATTLES } from '@/lib/tools/threeKingdomsBattles'
import { FACTION_META, asTKLang, type TKFaction } from '@/lib/tools/tkCommon'
import { TKFactionBadge } from '@/components/tools/TKBadge'

const tool = getToolBySlug('three-kingdoms-battles')!
const FACTIONS = Object.keys(FACTION_META) as TKFaction[]

export default function ThreeKingdomsBattlesPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = asTKLang(params.lang)
  const [faction, setFaction] = useState<TKFaction | ''>('')

  const list = faction ? TK_BATTLES.filter((b) => b.factions.includes(faction)) : TK_BATTLES

  const chipCls = (on: boolean) =>
    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ' +
    (on ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tkb_title')}</h1>
        <p className="text-gray-500 mb-6">{t('tkb_subtitle')}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          <button onClick={() => setFaction('')} className={chipCls(faction === '')}>{t('tkb_all')}</button>
          {FACTIONS.map((f) => (
            <button key={f} onClick={() => setFaction(faction === f ? '' : f)} className={chipCls(faction === f)}
              style={faction === f ? { background: FACTION_META[f].color, borderColor: FACTION_META[f].color } : {}}>
              {FACTION_META[f].label[lang]}
            </button>
          ))}
        </div>

        {/* chronological list */}
        <ol className="space-y-3">
          {list.map((b) => (
            <li key={b.id}>
              <Link href={`/${lang}/tools/three-kingdoms-battles/${b.id}`}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-300 hover:bg-gray-50 transition-colors">
                <span className="shrink-0 w-16 text-right text-sm font-black tabular-nums text-brand-600">{b.year}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-gray-900">{b.name[lang]} <span className="text-xs text-gray-400 font-serif font-normal">{b.hanja}</span></p>
                    <span className="flex gap-1 shrink-0">
                      {b.factions.slice(0, 3).map((f) => <TKFactionBadge key={f} faction={f} lang={lang} size="xs" />)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.background[lang].split(/(?<=[.。])/)[0]}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
          <Link href={`/${lang}/tools/three-kingdoms-characters`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            👤 {t('tkc_title')}
          </Link>
          <Link href={`/${lang}/tools/three-kingdoms-quotes`}
            className="block rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 text-center text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
            💬 {t('tkq_title')}
          </Link>
        </div>
      </div>
    </ToolLayout>
  )
}
