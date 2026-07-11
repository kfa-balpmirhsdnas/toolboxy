'use client'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { TK_CHARS, ROLE_LABEL, type TKRole } from '@/lib/tools/threeKingdomsCharacters'
import { FACTION_META, asTKLang, type TKFaction } from '@/lib/tools/tkCommon'
import { TKFactionBadge } from '@/components/tools/TKBadge'

const tool = getToolBySlug('three-kingdoms-characters')!
const FACTIONS = Object.keys(FACTION_META) as TKFaction[]
const ROLES: TKRole[] = ['civil', 'military', 'both', 'other']

export default function ThreeKingdomsCharactersPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = asTKLang(params.lang)

  const [q, setQ] = useState('')
  const [faction, setFaction] = useState<TKFaction | ''>('')
  const [role, setRole] = useState<TKRole | ''>('')

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return TK_CHARS.filter((c) => {
      if (faction && c.faction !== faction) return false
      if (role && c.role !== role) return false
      if (!needle) return true
      return (
        c.hanja.includes(needle) || c.name.ko.includes(needle) ||
        c.name.ja.includes(needle) || c.name.en.toLowerCase().includes(needle) ||
        c.id.includes(needle) || (c.courtesy?.read[lang] ?? '').toLowerCase().includes(needle)
      )
    })
  }, [q, faction, role, lang])

  const chipCls = (on: boolean) =>
    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ' +
    (on ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tkc_title')}</h1>
        <p className="text-gray-500 mb-6">{t('tkc_subtitle')}</p>

        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('tkc_search_ph')}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3" />
        <div className="flex flex-wrap gap-1.5 mb-2">
          <button onClick={() => setFaction('')} className={chipCls(faction === '')}>{t('tkc_all')}</button>
          {FACTIONS.map((f) => (
            <button key={f} onClick={() => setFaction(faction === f ? '' : f)} className={chipCls(faction === f)}
              style={faction === f ? { background: FACTION_META[f].color, borderColor: FACTION_META[f].color } : {}}>
              {FACTION_META[f].label[lang]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {ROLES.map((r) => (
            <button key={r} onClick={() => setRole(role === r ? '' : r)} className={chipCls(role === r)}>{ROLE_LABEL[r][lang]}</button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-3">{list.length} / {TK_CHARS.length}</p>
        <div className="grid gap-3 min-[520px]:grid-cols-2">
          {list.map((c) => (
            <Link key={c.id} href={`/${lang}/tools/three-kingdoms-characters/${c.id}`}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-300 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <p className="font-serif text-lg font-black text-gray-900">{c.hanja}</p>
                <TKFactionBadge faction={c.faction} lang={lang} size="xs" />
              </div>
              <p className="text-sm font-bold text-gray-700">
                {c.name[lang]}
                {c.courtesy && <span className="ml-1.5 text-xs text-gray-400 font-normal">{c.courtesy.read[lang]}</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.intro[lang].split(/(?<=[.。])/)[0]}</p>
            </Link>
          ))}
        </div>
        {list.length === 0 && <p className="text-center text-sm text-gray-400 py-10">{t('tkc_no_result')}</p>}

        <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
          <Link href={`/${lang}/tools/three-kingdoms-test`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            ⚔️ {t('tk_title')}
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
