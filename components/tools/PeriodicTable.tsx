'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { ELEMENTS, type Element } from '@/lib/elements'
import { ELEMENT_DETAIL } from '@/lib/elements-detail'
import BohrModel from '@/components/tools/BohrModel'

const tool = getToolBySlug('periodic-table')!

// Render orbital occupancy digits as superscripts: "[Ar] 3d6 4s2" -> "[Ar] 3d⁶ 4s²".
const SUP: Record<string, string> = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const prettyConfig = (c: string) => c.replace(/([spdf])(\d+)/g, (_, l, d) => l + d.split('').map((x: string) => SUP[x]).join(''))

const COLORS: Record<string, string> = {
  nonmetal: '#86efac', noble: '#c4b5fd', alkali: '#fca5a5', alkaline: '#fdba74',
  metalloid: '#5eead4', halogen: '#fde047', transition: '#93c5fd', 'post-transition': '#cbd5e1',
  lanthanide: '#f9a8d4', actinide: '#fda4af',
}
const CATS = ['nonmetal', 'noble', 'alkali', 'alkaline', 'metalloid', 'halogen', 'transition', 'post-transition', 'lanthanide', 'actinide']

function pos(e: Element): { col: number; row: number } {
  if (e.cat === 'lanthanide') return { col: 3 + (e.n - 57), row: 9 }
  if (e.cat === 'actinide') return { col: 3 + (e.n - 89), row: 10 }
  return { col: e.group, row: e.period }
}

export default function PeriodicTable({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [sel, setSel] = useState<Element>(ELEMENTS[0])
  const cardRef = useRef<HTMLDivElement>(null)
  // On desktop the card is sticky (always visible), so only scroll-to-card on mobile.
  const select = (e: Element) => { setSel(e); if (window.innerWidth < 640) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const name = (e: Element) => (lang === 'ko' ? e.ko : lang === 'ja' ? e.ja : e.en)
  const catName = (c: string) => t(`pt_c_${c.replace('-', '_')}`)
  const d = ELEMENT_DETAIL[sel.n]
  const temp = (v: number | null) => (v == null ? '—' : `${v.toLocaleString()}°C`)
  const useText = d ? (lang === 'ko' ? d.useKo : lang === 'ja' ? d.useJa : d.useEn) : ''
  const shellArr = d?.shells ? d.shells.split(',').map((s) => Number(s.trim())).filter((x) => x > 0) : []

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pt_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('pt_subtitle')}</p>
        </div>

        {/* detail card */}
        <div ref={cardRef} className="scroll-mt-20 sm:sticky sm:top-16 sm:z-10 rounded-2xl border-2 p-4 flex flex-col sm:flex-row gap-4 shadow-sm" style={{ borderColor: COLORS[sel.cat], background: `linear-gradient(${COLORS[sel.cat]}22, ${COLORS[sel.cat]}22), #fff` }}>
         <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-20 h-20 rounded-xl flex flex-col items-center justify-center" style={{ background: COLORS[sel.cat] }}>
              <span className="text-[11px] text-gray-700 leading-none">{sel.n}</span>
              <span className="text-3xl font-bold text-gray-900 leading-tight">{sel.sym}</span>
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold text-gray-900">{name(sel)}</div>
              <div className="text-xs text-gray-600 mt-0.5">{sel.en} · {sel.ko} · {sel.ja}</div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                <span>{t('pt_number')}: <b>{sel.n}</b></span>
                <span>{t('pt_mass')}: <b>{sel.mass}</b></span>
                <span>{t('pt_group')}: <b>{sel.cat === 'lanthanide' || sel.cat === 'actinide' ? '—' : sel.group}</b></span>
                <span>{t('pt_period')}: <b>{sel.period}</b></span>
                <span>{t('pt_category')}: <b>{catName(sel.cat)}</b></span>
              </div>
            </div>
          </div>
          {d && (
            <div className="mt-3 pt-3 border-t border-black/10 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-sm text-gray-700">
              <span className="col-span-2 sm:col-span-3">{t('pt_config')}: <b>{prettyConfig(d.config)}</b>{d.configEstimated && <span className="text-gray-500"> ({t('pt_estimated')})</span>}</span>
              <span>{t('pt_shells')}: <b>{d.shells ? d.shells.split(',').length : '—'}</b></span>
              <span>{t('pt_state')}: <b>{t(`pt_s_${d.state}`)}</b>{d.stateEstimated && <span className="text-gray-500"> ({t('pt_estimated')})</span>}</span>
              <span>{t('pt_eneg')}: <b>{d.eneg ?? '—'}</b></span>
              <span>{t('pt_melt')}: <b>{temp(d.melt)}</b></span>
              <span>{t('pt_boil')}: <b>{temp(d.boil)}</b></span>
              <span>{t('pt_discovered')}: <b>{d.year ?? t('pt_ancient')}</b></span>
              {useText && <span className="col-span-2 sm:col-span-3">{t('pt_use')}: <b>{useText}</b></span>}
            </div>
          )}
         </div>
         {d && shellArr.length > 0 && (
           <div className="shrink-0 self-center sm:self-start mx-auto sm:mx-0">
             <div className="text-xs font-semibold text-gray-700 text-center mb-1">{t('pt_bohr')}</div>
             <div className="rounded-xl bg-white/55 px-2 py-2">
               <BohrModel shells={shellArr} color={COLORS[sel.cat]} symbol={sel.sym} number={sel.n} />
             </div>
           </div>
         )}
        </div>

        {/* table */}
        <div className="overflow-x-auto pb-2">
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(18, minmax(30px, 1fr))', minWidth: 600 }}>
            {/* f-block markers in the main grid */}
            <div style={{ gridColumn: 3, gridRow: 6 }} className="rounded-[3px] bg-gray-100 text-gray-400 text-[8px] flex items-center justify-center">57–71</div>
            <div style={{ gridColumn: 3, gridRow: 7 }} className="rounded-[3px] bg-gray-100 text-gray-400 text-[8px] flex items-center justify-center">89–103</div>
            <div style={{ gridColumn: '1 / 19', gridRow: 8 }} className="h-2" />
            {ELEMENTS.map((e) => {
              const p = pos(e)
              return (
                <button key={e.n} onClick={() => select(e)} style={{ gridColumn: p.col, gridRow: p.row, background: COLORS[e.cat] }}
                  aria-label={name(e)}
                  className={`aspect-square rounded-[3px] p-0.5 text-center transition hover:ring-2 hover:ring-gray-800 hover:z-10 ${sel.n === e.n ? 'ring-2 ring-gray-900 z-10' : ''}`}>
                  <div className="text-[7px] text-gray-700 leading-none">{e.n}</div>
                  <div className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight">{e.sym}</div>
                  <div className="text-[6px] text-gray-700 leading-none truncate">{name(e)}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-600">
          {CATS.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] inline-block" style={{ background: COLORS[c] }} />{catName(c)}
            </span>
          ))}
        </div>

        <p className="text-xs text-gray-400">{t('pt_note')}</p>
      </div>
    </ToolLayout>
  )
}
