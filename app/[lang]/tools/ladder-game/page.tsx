'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('ladder-game')!
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e']
const ROWS = 10, COL = 84, PADX = 46, TOP = 52, H = 440
const rowY = (r: number) => TOP + (r + 0.5) * ((H - TOP - 52) / ROWS)

export default function LadderGamePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [namesRaw, setNamesRaw] = useState(() => t('lg_sample_names'))
  const [resultsRaw, setResultsRaw] = useState(() => t('lg_sample_results'))
  const [seed, setSeed] = useState(1)
  const [selected, setSelected] = useState<number | null>(null)
  const [drawn, setDrawn] = useState(false)

  const names = useMemo(() => namesRaw.split('\n').map((s) => s.trim()).filter(Boolean), [namesRaw])
  const results = useMemo(() => resultsRaw.split('\n').map((s) => s.trim()).filter(Boolean), [resultsRaw])
  const n = names.length
  const colX = (i: number) => PADX + i * COL
  const W = PADX * 2 + (n - 1) * COL

  // random rungs[row][i] = horizontal bar between column i and i+1 (no adjacency clashes)
  const rungs = useMemo(() => {
    void seed
    const g: boolean[][] = []
    for (let r = 0; r < ROWS; r++) {
      const row: boolean[] = []
      for (let i = 0; i < n - 1; i++) row.push(!row[i - 1] && Math.random() < 0.45)
      g.push(row)
    }
    return g
  }, [n, seed])

  // trace one start column down the ladder → polyline points + final column
  const trace = (start: number) => {
    let c = start
    const pts: [number, number][] = [[colX(c), TOP]]
    for (let r = 0; r < ROWS; r++) {
      const y = rowY(r)
      pts.push([colX(c), y])
      if (rungs[r][c - 1]) { c -= 1; pts.push([colX(c), y]) }
      else if (rungs[r][c]) { c += 1; pts.push([colX(c), y]) }
    }
    pts.push([colX(c), H - 52])
    return { pts, end: c }
  }

  const path = selected != null ? trace(selected) : null

  useEffect(() => {
    if (selected == null) return
    setDrawn(false)
    const id = window.setTimeout(() => setDrawn(true), 30)
    return () => window.clearTimeout(id)
  }, [selected, seed])

  const pick = (i: number) => { trackToolUsed(tool.slug); setSelected(i) }
  const reshuffle = () => { setSelected(null); setSeed((s) => s + 1) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('lg_title')}</h1>
        <p className="text-gray-500 mb-6">{t('lg_subtitle')}</p>

        <div className="grid md:grid-cols-[1fr_240px] gap-6 items-start">
          <div className="overflow-x-auto">
            {n >= 2 && names.length === results.length ? (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl" style={{ minWidth: Math.min(W, 320) }}>
                {/* vertical lines */}
                {names.map((_, i) => (
                  <line key={i} x1={colX(i)} y1={TOP} x2={colX(i)} y2={H - 52} stroke="#d1d5db" strokeWidth={3} strokeLinecap="round" />
                ))}
                {/* rungs */}
                {rungs.map((row, r) => row.map((on, i) => on && (
                  <line key={`${r}-${i}`} x1={colX(i)} y1={rowY(r)} x2={colX(i + 1)} y2={rowY(r)} stroke="#d1d5db" strokeWidth={3} strokeLinecap="round" />
                )))}
                {/* traced path */}
                {path && (
                  <polyline points={path.pts.map((p) => p.join(',')).join(' ')} fill="none"
                    stroke={COLORS[selected! % COLORS.length]} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round"
                    pathLength={1} strokeDasharray={1} strokeDashoffset={drawn ? 0 : 1}
                    style={{ transition: 'stroke-dashoffset 1.15s linear' }} />
                )}
                {/* top buttons (names) */}
                {names.map((nm, i) => (
                  <g key={i} onClick={() => pick(i)} className="cursor-pointer">
                    <circle cx={colX(i)} cy={TOP - 26} r={16} fill={selected === i ? COLORS[i % COLORS.length] : '#fff'} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} />
                    <text x={colX(i)} y={TOP - 26} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="700" fill={selected === i ? '#fff' : '#374151'}>{i + 1}</text>
                    <text x={colX(i)} y={TOP - 46} textAnchor="middle" fontSize={12} fontWeight="600" fill="#111827">{nm.length > 6 ? nm.slice(0, 6) + '…' : nm}</text>
                  </g>
                ))}
                {/* bottom results */}
                {results.map((rs, i) => (
                  <text key={i} x={colX(i)} y={H - 26} textAnchor="middle" fontSize={12} fontWeight="600"
                    fill={drawn && path?.end === i ? COLORS[selected! % COLORS.length] : '#6b7280'}>{rs.length > 6 ? rs.slice(0, 6) + '…' : rs}</text>
                ))}
              </svg>
            ) : (
              <p className="text-sm text-amber-600 py-10">{t('lg_mismatch')}</p>
            )}

            {drawn && path && (
              <div className="mt-3 text-center md:text-left text-lg">
                <span className="font-bold text-gray-900">{names[selected!]}</span>
                <span className="text-gray-400 mx-2">→</span>
                <span className="font-bold" style={{ color: COLORS[selected! % COLORS.length] }}>{results[path.end]}</span>
              </div>
            )}
            <button onClick={reshuffle} className="mt-4 px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              🔀 {t('lg_shuffle')}
            </button>
          </div>

          {/* editors */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('lg_names')} ({names.length})</label>
              <textarea value={namesRaw} onChange={(e) => { setNamesRaw(e.target.value); setSelected(null) }} rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('lg_results')} ({results.length})</label>
              <textarea value={resultsRaw} onChange={(e) => { setResultsRaw(e.target.value); setSelected(null) }} rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
            </div>
            <p className="text-xs text-gray-400">{t('lg_hint')}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
