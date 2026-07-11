import { SRC_META, FACTION_META, type TKSrc, type TKFaction, type TKLang } from '@/lib/tools/tkCommon'

// 삼국지 시리즈 공통 배지 — 출처(정사/주석/연의/후대) 및 세력(위/촉/오/후한/군벌).
// Server-component friendly (no hooks).

export function TKSrcBadge({ src, lang, size = 'sm' }: { src: TKSrc; lang: TKLang; size?: 'sm' | 'xs' }) {
  const m = SRC_META[src]
  const cls = size === 'xs'
    ? 'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0'
    : 'inline-block px-2.5 py-1 rounded-full text-[11px] font-bold text-white shrink-0'
  return <span className={cls} style={{ background: m.color }}>{m.label[lang]}</span>
}

export function TKFactionBadge({ faction, lang, size = 'sm' }: { faction: TKFaction; lang: TKLang; size?: 'sm' | 'xs' }) {
  const m = FACTION_META[faction]
  const cls = size === 'xs'
    ? 'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0'
    : 'inline-block px-2.5 py-1 rounded-full text-[11px] font-bold text-white shrink-0'
  return <span className={cls} style={{ background: m.color }}>{m.label[lang]}</span>
}
