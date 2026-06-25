'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('minesweeper')!
const LEVELS: Record<string, [number, number]> = { ms_easy: [9, 10], ms_medium: [12, 24], ms_hard: [14, 40] }
type Cell = { mine: boolean; rev: boolean; flag: boolean; n: number }

function build(size: number, mines: number, safe: number): Cell[] {
  const cells: Cell[] = Array.from({ length: size * size }, () => ({ mine: false, rev: false, flag: false, n: 0 }))
  const idx = Array.from({ length: size * size }, (_, i) => i).filter((i) => i !== safe).sort(() => Math.random() - 0.5).slice(0, mines)
  idx.forEach((i) => (cells[i].mine = true))
  for (let i = 0; i < cells.length; i++) cells[i].n = neighbors(i, size).filter((j) => cells[j].mine).length
  return cells
}
function neighbors(i: number, size: number): number[] {
  const r = Math.floor(i / size), c = i % size, out: number[] = []
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (!dr && !dc) continue; const nr = r + dr, nc = c + dc; if (nr >= 0 && nr < size && nc >= 0 && nc < size) out.push(nr * size + nc) }
  return out
}

export default function MinesweeperPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [lvl, setLvl] = useState('ms_easy')
  const [size, mines] = LEVELS[lvl]
  const [cells, setCells] = useState<Cell[]>([])
  const [started, setStarted] = useState(false)
  const [dead, setDead] = useState(false)
  const [flagMode, setFlagMode] = useState(false)

  const reset = useCallback((l: string) => { setLvl(l); setCells([]); setStarted(false); setDead(false) }, [])
  const won = started && !dead && cells.length > 0 && cells.every((c) => c.mine || c.rev)

  function reveal(cells: Cell[], i: number, size: number) {
    const stack = [i]
    while (stack.length) { const k = stack.pop()!; const c = cells[k]; if (c.rev || c.flag) continue; c.rev = true; if (c.n === 0 && !c.mine) neighbors(k, size).forEach((j) => stack.push(j)) }
  }
  function tap(i: number) {
    if (dead || won) return
    if (flagMode) { setCells((cs) => cs.map((c, k) => (k === i && !c.rev ? { ...c, flag: !c.flag } : c))); return }
    let cs = cells
    if (!started) { cs = build(size, mines, i); setStarted(true) }
    else cs = cs.map((c) => ({ ...c }))
    if (cs[i].flag) return
    if (cs[i].mine) { cs.forEach((c) => { if (c.mine) c.rev = true }); setDead(true); setCells(cs); return }
    reveal(cs, i, size); setCells(cs)
  }
  function flag(e: React.MouseEvent, i: number) { e.preventDefault(); if (dead || won || !started) return; setCells((cs) => cs.map((c, k) => (k === i && !c.rev ? { ...c, flag: !c.flag } : c))) }

  const NC = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#1f2937', '#6b7280']
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-4 text-center select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ms_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ms_subtitle')}</p>
        </div>

        <div className="flex justify-center gap-2 text-sm">
          {Object.keys(LEVELS).map((l) => <button key={l} onClick={() => reset(l)} className={`px-3 py-1 rounded-full border ${lvl === l ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t(l)}</button>)}
        </div>
        <div className="text-sm text-gray-600">💣 {mines} · {dead ? `💥 ${t('ms_dead')}` : won ? `🎉 ${t('ms_won')}` : ''}</div>

        <div className="grid gap-0.5 mx-auto w-fit" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}>
          {(cells.length ? cells : Array.from({ length: size * size }, () => ({ mine: false, rev: false, flag: false, n: 0 }))).map((c, i) => (
            <button key={i} onClick={() => tap(i)} onContextMenu={(e) => flag(e, i)}
              className={`w-7 h-7 text-sm font-bold rounded-sm flex items-center justify-center ${c.rev ? (c.mine ? 'bg-rose-200' : 'bg-gray-100') : 'bg-gray-300 hover:bg-gray-200'}`}
              style={{ color: c.rev && !c.mine ? NC[c.n] : undefined }}>
              {c.flag ? '🚩' : c.rev ? (c.mine ? '💣' : c.n || '') : ''}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          <button onClick={() => setFlagMode((v) => !v)} className={`px-4 py-2 text-sm rounded-xl border-2 ${flagMode ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>🚩 {t('ms_flagmode')}</button>
          <button onClick={() => reset(lvl)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{t('ms_new')}</button>
        </div>
        <p className="text-xs text-gray-400">{t('ms_note')}</p>
      </div>
    </ToolLayout>
  )
}
