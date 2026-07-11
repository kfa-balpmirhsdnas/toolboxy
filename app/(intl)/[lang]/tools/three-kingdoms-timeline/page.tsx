'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { TK_EVENTS_SORTED, type TKEventType } from '@/lib/tools/threeKingdomsEvents'
import { TK_CHARS, TKC_BY_ID } from '@/lib/tools/threeKingdomsCharacters'
import { TKB_BY_ID } from '@/lib/tools/threeKingdomsBattles'
import { FACTION_META, asTKLang, type TKLang } from '@/lib/tools/tkCommon'
import { TKSrcBadge } from '@/components/tools/TKBadge'

const tool = getToolBySlug('three-kingdoms-timeline')!

// 사건→전투 사전 링크 (연표 카드에서 상세로): 사건 id와 전투 id가 겹치는 것 + 별칭 매핑.
const EVENT_TO_BATTLE: Record<string, string> = {
  'yellow-turban': 'yellow-turban', hulao: 'hulao-gate', xiapi: 'xiapi', guandu: 'guandu',
  changban: 'changban', 'red-cliffs': 'red-cliffs', tongguan: 'tong-pass', hefei: 'hefei',
  dingjun: 'hanzhong', fancheng: 'fancheng', 'jingzhou-fall': 'fancheng', yiling: 'yiling',
  nanman: 'nanzhong', jieting: 'jieting', wuzhang: 'wuzhang-plains', 'wu-falls': 'conquest-of-wu',
}

type Row = {
  key: string; year: number; type: TKEventType | 'life'
  title: string; desc?: string; src?: 'history' | 'novel'
  people: string[]; color: string; battle?: string
}

export default function ThreeKingdomsTimelinePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang: TKLang = asTKLang(params.lang)
  const [filter, setFilter] = useState<'all' | 'battle' | 'politics' | 'life'>('all')
  const listRef = useRef<HTMLOListElement>(null)

  // 사건 + 인물 생몰(인물 데이터에서 파생 — 중복 입력 없음)을 하나의 연대순 목록으로.
  const rows = useMemo<Row[]>(() => {
    const evRows: Row[] = TK_EVENTS_SORTED.map((e) => {
      const firstHub = e.people.find((p) => TKC_BY_ID[p])
      return {
        key: 'e-' + e.id, year: e.year, type: e.type,
        title: e.title[lang], desc: e.desc[lang], src: e.src,
        people: e.people.filter((p) => TKC_BY_ID[p]),
        color: firstHub ? FACTION_META[TKC_BY_ID[firstHub].faction].color : '#9ca3af',
        battle: EVENT_TO_BATTLE[e.id],
      }
    })
    const lifeRows: Row[] = TK_CHARS.flatMap((c) => {
      const out: Row[] = []
      const col = FACTION_META[c.faction].color
      const by = parseInt(c.birth), dy = parseInt(c.death)
      if (!isNaN(by) && by >= 155) out.push({ key: `b-${c.id}`, year: by, type: 'life', title: t('tkt_born', { name: c.name[lang] }), people: [c.id], color: col })
      if (!isNaN(dy)) out.push({ key: `d-${c.id}`, year: dy, type: 'life', title: t('tkt_died', { name: c.name[lang] }), people: [c.id], color: col })
      return out
    })
    const all = filter === 'life' ? lifeRows
      : filter === 'all' ? evRows
      : evRows.filter((r) => r.type === filter)
    return all.sort((a, b) => a.year - b.year)
  }, [lang, filter, t])

  // 연도 점프 — 등장 연대 목록에서 해당 연대 첫 사건으로 scrollIntoView.
  const decades = useMemo(() => {
    const set = new Set(rows.map((r) => Math.floor(r.year / 10) * 10))
    return Array.from(set).sort((a, b) => a - b)
  }, [rows])
  // 전투 사전에서 오는 #y{연도} 딥링크 → 해당 연대로 점프.
  useEffect(() => {
    const m = /^#y(\d+)$/.exec(window.location.hash)
    if (!m) return
    const dec = Math.floor(parseInt(m[1]) / 10) * 10
    const tm = setTimeout(() => jump(dec), 300)
    return () => clearTimeout(tm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function jump(decade: number) {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-decade="${decade}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const chipCls = (on: boolean) =>
    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ' +
    (on ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')

  const seenDecade = new Set<number>()

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tkt_title')}</h1>
        <p className="text-gray-500 mb-6">{t('tkt_subtitle')}</p>

        {/* filters */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {([['all', t('tkt_f_all')], ['battle', t('tkt_f_battle')], ['politics', t('tkt_f_politics')], ['life', t('tkt_f_life')]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} className={chipCls(filter === k)}>{label}</button>
          ))}
        </div>
        {/* decade jump nav */}
        <div className="flex flex-wrap gap-1 mb-6 sticky top-14 z-10 bg-gray-50/95 backdrop-blur py-2 -mx-1 px-1 rounded-lg">
          {decades.map((d) => (
            <button key={d} onClick={() => jump(d)}
              className="px-2 py-1 rounded text-[11px] font-bold tabular-nums text-gray-500 hover:text-brand-600 hover:bg-white border border-transparent hover:border-gray-200">{d}</button>
          ))}
        </div>

        {/* vertical timeline */}
        <ol ref={listRef} className="relative border-l-2 border-gray-200 ml-3 space-y-5 pb-4">
          {rows.map((r) => {
            const dec = Math.floor(r.year / 10) * 10
            const firstOfDecade = !seenDecade.has(dec)
            if (firstOfDecade) seenDecade.add(dec)
            return (
              <li key={r.key} data-decade={firstOfDecade ? dec : undefined} className="relative pl-6 scroll-mt-28">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow" style={{ background: r.color }} />
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-black tabular-nums" style={{ color: r.color }}>{r.year}</span>
                  <span className="font-bold text-gray-900 text-[15px]">{r.title}</span>
                  {r.src === 'novel' && <TKSrcBadge src="novel" lang={lang} size="xs" />}
                </div>
                {r.desc && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.desc}</p>}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {r.people.slice(0, 6).map((p) => (
                    <Link key={p} href={`/${lang}/tools/three-kingdoms-characters/${p}`}
                      className="text-[11px] px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-500 hover:text-brand-600 hover:border-brand-200">
                      {TKC_BY_ID[p].name[lang]}
                    </Link>
                  ))}
                  {r.battle && TKB_BY_ID[r.battle] && (
                    <Link href={`/${lang}/tools/three-kingdoms-battles/${r.battle}`}
                      className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 font-medium">
                      ⚔ {t('tkt_battle_link')}
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        <div className="mt-8 grid gap-2 min-[480px]:grid-cols-2">
          <Link href={`/${lang}/tools/three-kingdoms-characters`}
            className="block rounded-2xl border-2 border-brand-200 bg-brand-50 p-3.5 text-center text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
            👤 {t('tkc_title')}
          </Link>
          <Link href={`/${lang}/tools/three-kingdoms-battles`}
            className="block rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 text-center text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
            ⚔️ {t('tkb_title')}
          </Link>
        </div>
      </div>
    </ToolLayout>
  )
}
