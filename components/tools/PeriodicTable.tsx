'use client'

import { useRef, useState, useMemo } from 'react'
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

// Temperature ("state of matter") mode: colour each element by its phase at T.
const STATE_COLORS: Record<string, string> = { solid: '#93c5fd', liquid: '#86efac', gas: '#fca5a5', unknown: '#e5e7eb' }
const PHASES = ['solid', 'liquid', 'gas', 'unknown'] as const
// Slider track [0,SMAX]. A piecewise scale gives the cold end (where gases liquefy
// and water freezes/boils) 40% of the track so those transitions are easy to reach,
// then -200..6000°C fills the rest. T(-273°C)→0, T(6000°C)→SMAX.
const SMAX = 1000, TMIN = -273, TMAX = 6000, TBREAK = 200, SBREAK = 0.4
const sToT = (s: number) => {
  const f = s / SMAX
  return Math.round(f <= SBREAK ? TMIN + (TBREAK - TMIN) * (f / SBREAK) : TBREAK + (TMAX - TBREAK) * ((f - SBREAK) / (1 - SBREAK)))
}
const tToPct = (T: number) => 100 * (T <= TBREAK ? SBREAK * (T - TMIN) / (TBREAK - TMIN) : SBREAK + (1 - SBREAK) * (T - TBREAK) / (TMAX - TBREAK))
// An element's phase at temperature T — needs both melting & boiling points.
function phaseAt(n: number, T: number): typeof PHASES[number] {
  const e = ELEMENT_DETAIL[n]
  if (!e || e.melt == null || e.boil == null) return 'unknown'
  return T < e.melt ? 'solid' : T < e.boil ? 'liquid' : 'gas'
}
const TEMP_MARKERS = [0, 100, 1538] // water freezes, water boils, iron melts

function pos(e: Element): { col: number; row: number } {
  if (e.cat === 'lanthanide') return { col: 3 + (e.n - 57), row: 9 }
  if (e.cat === 'actinide') return { col: 3 + (e.n - 89), row: 10 }
  return { col: e.group, row: e.period }
}

export default function PeriodicTable({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [sel, setSel] = useState<Element>(ELEMENTS[0])
  // Bohr model is collapsible on mobile; defaults open and resets to open on every
  // fresh load (not persisted). On desktop it's always shown.
  const [bohrOpen, setBohrOpen] = useState(true)
  const [anim, setAnim] = useState(true) // electron orbit animation (on by default)
  const [bohrBig, setBohrBig] = useState(false) // reduced by default (aligns with the left column); click to zoom
  const [bohrHover, setBohrHover] = useState(false) // desktop: also enlarges on hover
  // Temperature mode: a table-wide slider recolours all 118 cells by phase at T.
  const [tempMode, setTempMode] = useState(false)
  const [tempS, setTempS] = useState(() => Math.round(SMAX * tToPct(25) / 100)) // start at room temp 25°C
  const T = sToT(tempS)
  const counts = useMemo(() => {
    const c = { solid: 0, liquid: 0, gas: 0, unknown: 0 }
    for (const e of ELEMENTS) c[phaseAt(e.n, T)]++
    return c
  }, [T])
  const cellBg = (e: Element) => (tempMode ? STATE_COLORS[phaseAt(e.n, T)] : COLORS[e.cat])
  // Search + category/phase filter (just dims the non-matching cells; click still works).
  const [query, setQuery] = useState('')
  const [legendFilter, setLegendFilter] = useState<string | null>(null) // a category (class mode) or a phase (temp mode)
  const q = query.trim().toLowerCase()
  const matchesText = (e: Element) => !q || String(e.n) === q || e.sym.toLowerCase().includes(q) || e.en.toLowerCase().includes(q) || e.ko.includes(q) || e.ja.includes(q)
  const matchesChip = (e: Element) => !legendFilter || (tempMode ? phaseAt(e.n, T) === legendFilter : e.cat === legendFilter)
  const matches = (e: Element) => matchesText(e) && matchesChip(e)
  const filtering = !!(q || legendFilter)
  const firstMatch = filtering ? ELEMENTS.find(matches) : undefined
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

        {/* search — type a name, symbol or atomic number to spotlight matches */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && firstMatch) select(firstMatch) }}
              placeholder={t('pt_search_ph')} aria-label={t('pt_search_ph')} autoComplete="off"
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          {filtering && <button type="button" onClick={() => { setQuery(''); setLegendFilter(null) }} className="shrink-0 px-3 py-2 text-sm text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50">{t('pt_clear')}</button>}
        </div>

        {/* detail card */}
        <div ref={cardRef} className="scroll-mt-20 sm:sticky sm:top-16 sm:z-20 rounded-2xl border-2 p-4 flex flex-col sm:flex-row gap-4 shadow-sm" style={{ borderColor: COLORS[sel.cat], background: `linear-gradient(${COLORS[sel.cat]}22, ${COLORS[sel.cat]}22), #fff` }}>
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
             <div className="flex items-center justify-center gap-1.5 mb-1">
               <button type="button" onClick={() => setBohrOpen((o) => !o)}
                 className="flex items-center gap-1 text-xs font-semibold text-gray-700 sm:pointer-events-none">
                 {t('pt_bohr')}
                 <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 sm:hidden transition-transform ${bohrOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
               </button>
               <button type="button" onClick={() => setAnim((a) => !a)} aria-pressed={anim} aria-label={t('pt_anim')} title={t('pt_anim')}
                 className={`leading-none text-[13px] w-5 h-5 rounded-full border transition-colors ${anim ? 'border-brand-300 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-400'}`}>⟳</button>
             </div>
             <button type="button" onClick={() => setBohrBig((b) => !b)} title={t('pt_bohr_zoom')} aria-label={t('pt_bohr_zoom')}
               onMouseEnter={() => setBohrHover(true)} onMouseLeave={() => setBohrHover(false)}
               className={`rounded-xl bg-white/55 px-2 py-2 transition-all ${bohrBig ? 'cursor-zoom-out' : 'cursor-zoom-in'} ${bohrOpen ? '' : 'hidden'} sm:block`}>
               <BohrModel shells={shellArr} color={COLORS[sel.cat]} symbol={sel.sym} number={sel.n} animate={anim} size={bohrBig || bohrHover ? 200 : 150} />
             </button>
           </div>
         )}
        </div>

        {/* temperature control — sits ABOVE the table and recolours the whole grid */}
        <div className="rounded-2xl border border-gray-200 p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button type="button" onClick={() => { setTempMode((m) => !m); setLegendFilter(null) }} aria-pressed={tempMode}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${tempMode ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>
              🌡 {t('pt_temp_toggle')}
            </button>
            <div className="text-sm text-gray-700">
              <b className="text-base">{T.toLocaleString()}°C</b>
              <span className="ml-2 inline-flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-gray-600">
                {(['solid', 'liquid', 'gas'] as const).map((s) => (
                  <span key={s} className="inline-flex items-center">
                    <span className="w-2.5 h-2.5 rounded-[2px] inline-block mr-1" style={{ background: STATE_COLORS[s] }} />
                    {t(`pt_s_${s}`)} {counts[s]}
                  </span>
                ))}
              </span>
            </div>
          </div>
          {/* slider (dragging also switches into temperature mode) */}
          <input type="range" min={0} max={SMAX} value={tempS} aria-label={t('pt_temp')}
            onChange={(e) => { setTempS(+e.target.value); setTempMode(true) }}
            className="w-full h-2 cursor-pointer accent-brand-600 touch-pan-x" style={{ touchAction: 'pan-x' }} />
          <div className="relative h-4 select-none">
            <span className="absolute left-0 top-0 text-[10px] text-gray-400">-273°C</span>
            <span className="absolute right-0 top-0 text-[10px] text-gray-400">{TMAX.toLocaleString()}°C</span>
            {TEMP_MARKERS.map((m) => (
              <span key={m} className="absolute top-0 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap" style={{ left: `${tToPct(m)}%` }}>
                <span className="block w-px h-1.5 bg-gray-300 mx-auto" />{m}°
              </span>
            ))}
          </div>
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
                <button key={e.n} onClick={() => select(e)} style={{ gridColumn: p.col, gridRow: p.row, background: cellBg(e) }}
                  aria-label={name(e)}
                  className={`aspect-square rounded-[3px] p-0.5 text-center transition hover:ring-2 hover:ring-gray-800 hover:z-10 ${sel.n === e.n ? 'ring-2 ring-gray-900 z-10' : ''} ${filtering && !matches(e) ? 'opacity-20' : ''}`}>
                  <div className="text-[7px] text-gray-700 leading-none">{e.n}</div>
                  <div className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight">{e.sym}</div>
                  <div className="text-[6px] text-gray-700 leading-none truncate">{name(e)}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* legend doubles as a filter — click to spotlight that phase/category */}
        <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-xs text-gray-600">
          {(tempMode ? PHASES : CATS).map((k) => (
            <button key={k} type="button" onClick={() => setLegendFilter((f) => (f === k ? null : k))}
              className={`inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 transition ${legendFilter === k ? 'ring-2 ring-gray-700 bg-gray-50' : 'hover:bg-gray-100'}`}>
              <span className="w-3 h-3 rounded-[2px] inline-block" style={{ background: (tempMode ? STATE_COLORS : COLORS)[k] }} />
              {tempMode ? (k === 'unknown' ? t('pt_nodata') : t(`pt_s_${k}`)) : catName(k)}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400">{t('pt_note')}</p>
      </div>
    </ToolLayout>
  )
}
