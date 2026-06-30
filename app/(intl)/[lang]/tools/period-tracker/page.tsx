'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('period-tracker')!
const DAY = 86_400_000
const LOC: Record<string, string> = { en: 'en-US', ko: 'ko-KR', ja: 'ja-JP' }
const KEY = 'toolboxy-period-tracker-v1'

type Rec = { id: string; start: string; length: number; note?: string }

const todayStr = () => new Date().toISOString().slice(0, 10)
const parseDay = (s: string) => { const d = new Date(s + 'T00:00:00'); return isNaN(d.getTime()) ? null : d }
const dayDiff = (a: number, b: number) => Math.round((a - b) / DAY)
const midnight = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() }

export default function PeriodTrackerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const locale = useLocale()
  const loc = LOC[locale] || undefined

  const [records, setRecords] = useState<Rec[]>([])
  const [ready, setReady] = useState(false)
  const [start, setStart] = useState(todayStr())
  const [length, setLength] = useState('5')
  const [note, setNote] = useState('')
  const [view, setView] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const fileRef = useRef<HTMLInputElement>(null)

  // Load once, then persist on change (browser-only; never sent anywhere).
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) setRecords(a) } } catch { /* ignore */ }
    setReady(true)
  }, [])
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(records)) } catch { /* ignore */ } }, [records, ready])

  const sorted = useMemo(() => [...records].sort((a, b) => a.start.localeCompare(b.start)), [records])

  const stats = useMemo(() => {
    const starts = sorted.map((r) => parseDay(r.start)?.getTime()).filter((x): x is number => x != null)
    const cycles: number[] = []
    for (let i = 1; i < starts.length; i++) cycles.push(dayDiff(starts[i], starts[i - 1]))
    const avgCycle = cycles.length ? Math.round(cycles.reduce((s, c) => s + c, 0) / cycles.length) : null
    const lengths = sorted.map((r) => r.length).filter((n) => n > 0)
    const avgLen = lengths.length ? Math.round(lengths.reduce((s, n) => s + n, 0) / lengths.length) : 5
    const last = starts.length ? starts[starts.length - 1] : null
    let next: number | null = null, ovulation: number | null = null, fertileStart: number | null = null, fertileEnd: number | null = null, dday: number | null = null
    if (last != null && avgCycle != null) {
      next = last + avgCycle * DAY
      ovulation = next - 14 * DAY
      fertileStart = ovulation - 5 * DAY
      fertileEnd = ovulation + 1 * DAY
      dday = dayDiff(next, midnight())
    }
    // regularity: max−min spread of recent cycles
    const recent = cycles.slice(-8)
    const spread = recent.length ? Math.max(...recent) - Math.min(...recent) : 0
    return { cycles, recent, spread, avgCycle, avgLen, last, next, ovulation, fertileStart, fertileEnd, dday }
  }, [sorted])

  function addRecord() {
    if (!parseDay(start)) return
    const len = Math.max(1, Math.min(15, Number(length) || 5))
    setRecords((r) => [...r.filter((x) => x.start !== start), { id: Date.now().toString(36), start, length: len, note: note.trim() || undefined }])
    setNote('')
  }
  function del(id: string) { setRecords((r) => r.filter((x) => x.id !== id)) }
  function clearAll() { if (confirm(t('pt_clear_confirm'))) setRecords([]) }

  function exportData() {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = 'period-records.json'; a.click(); URL.revokeObjectURL(url)
  }
  function importData(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const a = JSON.parse(String(reader.result))
        if (Array.isArray(a)) setRecords(a.filter((x) => x && typeof x.start === 'string').map((x) => ({ id: x.id || Date.now().toString(36) + Math.random(), start: x.start, length: Number(x.length) || 5, note: x.note })))
      } catch { /* ignore */ }
    }
    reader.readAsText(file)
  }

  const fmt = (ms: number) => new Date(ms).toLocaleDateString(loc, { year: 'numeric', month: 'short', day: 'numeric' })
  const fmtShort = (ms: number) => new Date(ms).toLocaleDateString(loc, { month: 'short', day: 'numeric' })

  // ---- Calendar (month grid) ----
  const cal = useMemo(() => {
    const { y, m } = view
    const first = new Date(y, m, 1)
    const lead = first.getDay()
    const days = new Date(y, m + 1, 0).getDate()
    const cells: ({ day: number; ms: number } | null)[] = []
    for (let i = 0; i < lead; i++) cells.push(null)
    for (let d = 1; d <= days; d++) cells.push({ day: d, ms: new Date(y, m, d).getTime() })
    return { cells, title: first.toLocaleDateString(loc, { year: 'numeric', month: 'long' }) }
  }, [view, loc])

  const weekdays = useMemo(() => {
    const base = new Date(2024, 5, 2) // a Sunday
    return Array.from({ length: 7 }, (_, i) => new Date(base.getTime() + i * DAY).toLocaleDateString(loc, { weekday: 'narrow' }))
  }, [loc])

  function dayKind(ms: number): 'period' | 'predicted' | 'ovulation' | 'fertile' | null {
    for (const r of sorted) { const s = parseDay(r.start)?.getTime(); if (s != null && ms >= s && ms < s + r.length * DAY) return 'period' }
    if (stats.ovulation != null && ms === stats.ovulation) return 'ovulation'
    if (stats.next != null && ms >= stats.next && ms < stats.next + stats.avgLen * DAY) return 'predicted'
    if (stats.fertileStart != null && stats.fertileEnd != null && ms >= stats.fertileStart && ms <= stats.fertileEnd) return 'fertile'
    return null
  }
  const KIND_CLS: Record<string, string> = {
    period: 'bg-rose-500 text-white',
    predicted: 'border-2 border-dashed border-rose-400 text-rose-600',
    ovulation: 'bg-emerald-500 text-white',
    fertile: 'bg-emerald-100 text-emerald-700',
  }
  const today = midnight()

  const sec = 'bg-white border border-gray-200 rounded-2xl p-4'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-xl mx-auto space-y-4">
        {/* Privacy — sensitive data, make it loud */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span><b>{t('pt_privacy_title')}</b> {t('pt_privacy')}</span>
        </div>

        {/* Add a record */}
        <div className={sec + ' space-y-3'}>
          <p className="text-sm font-semibold text-gray-700">{t('pt_add_title')}</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="block text-xs text-gray-500 mb-1">{t('pt_start_date')}</span>
              <input type="date" value={start} max={todayStr()} onChange={(e) => setStart(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </label>
            <label className="block">
              <span className="block text-xs text-gray-500 mb-1">{t('pt_length')}</span>
              <input type="number" min={1} max={15} value={length} onChange={(e) => setLength(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </label>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('pt_note_ph')} maxLength={80}
            className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button onClick={addRecord} className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">{t('pt_add_btn')}</button>
        </div>

        {/* Summary / predictions */}
        {stats.avgCycle == null ? (
          <p className="text-sm rounded-xl bg-gray-50 border border-gray-200 text-gray-500 px-3 py-3 text-center">{t('pt_need_more')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className={sec + ' text-center'}>
              <p className="text-xs text-gray-500">{t('pt_avg_cycle')}</p>
              <p className="text-2xl font-bold text-brand-600">{stats.avgCycle}<span className="text-sm font-medium text-gray-400 ml-0.5">{t('pt_days')}</span></p>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('pt_avg_len')}: {stats.avgLen}{t('pt_days')}</p>
            </div>
            <div className={sec + ' text-center'}>
              <p className="text-xs text-gray-500">{t('pt_next')}</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{stats.next != null && fmtShort(stats.next)}</p>
              <p className="text-lg font-bold text-rose-500">{stats.dday != null && (stats.dday > 0 ? `D-${stats.dday}` : stats.dday === 0 ? t('pt_today') : `D+${-stats.dday}`)}</p>
            </div>
            <div className={sec + ' col-span-2 flex items-center justify-around text-center'}>
              <div>
                <p className="text-xs text-gray-500">{t('pt_ovulation')}</p>
                <p className="text-sm font-semibold text-emerald-600 mt-0.5">{stats.ovulation != null && fmtShort(stats.ovulation)}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-500">{t('pt_fertile')}</p>
                <p className="text-sm font-semibold text-emerald-600 mt-0.5">{stats.fertileStart != null && stats.fertileEnd != null && `${fmtShort(stats.fertileStart)} – ${fmtShort(stats.fertileEnd)}`}</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className={sec}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setView((v) => { const d = new Date(v.y, v.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() } })} aria-label="prev" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ToolIcon name="chevron-left" className="w-4 h-4" /></button>
            <p className="text-sm font-semibold text-gray-700">{cal.title}</p>
            <button onClick={() => setView((v) => { const d = new Date(v.y, v.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() } })} aria-label="next" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ToolIcon name="chevron-right" className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((w, i) => <div key={i} className="text-[11px] text-gray-400 pb-1">{w}</div>)}
            {cal.cells.map((c, i) => {
              if (!c) return <div key={i} />
              const kind = dayKind(c.ms)
              const isToday = c.ms === today
              return (
                <div key={i} className={'aspect-square flex items-center justify-center text-xs rounded-lg ' + (kind ? KIND_CLS[kind] : 'text-gray-600') + (isToday ? ' ring-2 ring-brand-400 ring-offset-1' : '')}>
                  {c.day}
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500" />{t('pt_lg_period')}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border-2 border-dashed border-rose-400" />{t('pt_lg_predicted')}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100" />{t('pt_lg_fertile')}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" />{t('pt_lg_ovulation')}</span>
          </div>
        </div>

        {/* Cycle-length chart (regularity) */}
        {stats.cycles.length >= 1 && (
          <div className={sec}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">{t('pt_chart_title')}</p>
              <p className="text-[11px] text-gray-400">{t('pt_spread')}: {stats.spread}{t('pt_days')}</p>
            </div>
            <div className="flex items-end justify-center gap-1.5 h-24">
              {stats.recent.map((c, i) => {
                const mx = Math.max(...stats.recent, stats.avgCycle || 28)
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-[2.5rem]">
                    <span className="text-[10px] text-gray-400">{c}</span>
                    <div className="w-full rounded-t bg-brand-400" style={{ height: `${Math.max(6, (c / mx) * 72)}px` }} />
                  </div>
                )
              })}
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-1">{t('pt_chart_sub')}</p>
          </div>
        )}

        {/* Records list */}
        <div className={sec}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">{t('pt_records')} {sorted.length > 0 && <span className="text-gray-400 font-normal">({sorted.length})</span>}</p>
            {sorted.length > 0 && <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500">{t('pt_clear_all')}</button>}
          </div>
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">{t('pt_no_records')}</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {[...sorted].reverse().map((r) => {
                const ms = parseDay(r.start)?.getTime()
                return (
                  <div key={r.id} className="flex items-center gap-2 py-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800">{ms != null ? fmt(ms) : r.start} <span className="text-gray-400 text-xs">· {r.length}{t('pt_days')}</span></p>
                      {r.note && <p className="text-xs text-gray-400 truncate">{r.note}</p>}
                    </div>
                    <button onClick={() => del(r.id)} aria-label={t('pt_delete')} className="text-gray-300 hover:text-red-500 shrink-0"><ToolIcon name="trash" className="w-4 h-4" /></button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Backup: export / import */}
        <div className="flex gap-2">
          <button onClick={exportData} disabled={!records.length} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"><ToolIcon name="download" className="w-4 h-4" />{t('pt_export')}</button>
          <button onClick={() => fileRef.current?.click()} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"><ToolIcon name="folder" className="w-4 h-4" />{t('pt_import')}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = '' }} />
        </div>

        {/* Medical disclaimer — required */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1.5">
          <p className="font-semibold">⚠️ {t('pt_disc_title')}</p>
          <p>{t('pt_disc')}</p>
          <p className="font-medium">{t('pt_disc_contraception')}</p>
        </div>
      </div>
    </ToolLayout>
  )
}
