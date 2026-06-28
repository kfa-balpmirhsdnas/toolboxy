'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('powerball-results')!
const SNAPSHOT_URL = '/data/powerball.json'
const LIVE_URL = 'https://data.ny.gov/resource/d6yy-54nr.json?$limit=60&$order=draw_date%20DESC'
const CUR_START = '2015-10-07' // current matrix (5× 1–69 + Powerball 1–26)
const LOCALE_TAG: Record<string, string> = { en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' }

type Draw = { date: string; white: number[]; pb: number; pp: number | null; era: string }
type Meta = { source: string; url: string; collectedAt: string }

function parseRow(r: { winning_numbers?: string; draw_date?: string; multiplier?: string }): Draw | null {
  const nums = (r.winning_numbers || '').trim().split(/\s+/).map(Number)
  if (nums.length !== 6 || nums.some((n) => !Number.isFinite(n))) return null
  const date = (r.draw_date || '').slice(0, 10)
  if (!date) return null
  const pp = r.multiplier != null && r.multiplier !== '' ? parseInt(r.multiplier, 10) : null
  return { date, white: nums.slice(0, 5), pb: nums[5], pp, era: date >= CUR_START ? 'current' : 'legacy' }
}

// Next Powerball draw (Mon/Wed/Sat, US ET): the first draw day after the latest draw,
// advanced to today or later if the snapshot is stale. Local dates, no UTC round-trip.
function nextDrawDate(latest: string): Date {
  const DRAW_DAYS = [1, 3, 6] // Mon, Wed, Sat
  const today = new Date(); today.setHours(12, 0, 0, 0)
  const d = new Date(latest + 'T12:00:00')
  do { d.setDate(d.getDate() + 1) } while (!DRAW_DAYS.includes(d.getDay()))
  while (d < today) { do { d.setDate(d.getDate() + 1) } while (!DRAW_DAYS.includes(d.getDay())) }
  return d
}

export default function PowerballResultsPage() {
  const t = useTranslations('toolui')
  const locale = useLocale()
  const lang = (['en', 'ja', 'ko'].includes(locale) ? locale : 'en') as 'en' | 'ja' | 'ko'
  const fmt = (iso: string) => { try { return new Date(iso + 'T12:00:00').toLocaleDateString(LOCALE_TAG[lang], { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }) } catch { return iso } }

  const [draws, setDraws] = useState<Draw[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback' | 'error'>('loading')
  const [pickDate, setPickDate] = useState('')
  const [limit, setLimit] = useState(20)
  const [showFreq, setShowFreq] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    ;(async () => {
      // 1) Snapshot first — full history, instant, always-available fallback.
      let snap: { draws: Draw[]; source: string; source_url: string; collected_at: string } | null = null
      try {
        const r = await fetch(SNAPSHOT_URL)
        if (r.ok) snap = await r.json()
      } catch { /* ignore */ }
      if (snap && !cancelled) { setDraws(snap.draws); setMeta({ source: snap.source, url: snap.source_url, collectedAt: snap.collected_at }) }

      // 2) Live top-up — newest draws straight from the source.
      try {
        const r = await fetch(LIVE_URL, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const raw = await r.json()
        const recent = (raw as Parameters<typeof parseRow>[0][]).map(parseRow).filter((d): d is Draw => !!d)
        if (!recent.length) throw new Error('empty')
        if (!cancelled) {
          const base = snap?.draws ?? []
          const seen = new Set(base.map((d) => d.date))
          const merged = [...recent.filter((d) => !seen.has(d.date)), ...base].sort((a, b) => b.date.localeCompare(a.date))
          setDraws(merged)
          setMeta((m) => ({ source: snap?.source ?? 'NY State Open Data (d6yy-54nr)', url: snap?.source_url ?? 'https://data.ny.gov/Government-Finance/Lottery-Powerball-Winning-Numbers-Beginning-2010/d6yy-54nr', collectedAt: new Date().toISOString() }))
          setStatus('live')
        }
      } catch {
        if (!cancelled) setStatus(snap ? 'fallback' : 'error')
      }
    })()
    return () => { cancelled = true; ctrl.abort() }
  }, [])

  const latest = draws[0]
  const current = useMemo(() => draws.filter((d) => d.era === 'current'), [draws])
  const picked = useMemo(() => (pickDate ? draws.find((d) => d.date === pickDate) : undefined), [pickDate, draws])

  // Number frequency over the current matrix only (mixing eras would skew counts).
  const freq = useMemo(() => {
    const w = new Array(70).fill(0), p = new Array(27).fill(0)
    for (const d of current) { for (const n of d.white) w[n]++; p[d.pb]++ }
    const top = (arr: number[], k: number) => arr.map((c, n) => ({ n, c })).filter((x) => x.n >= 1).sort((a, b) => b.c - a.c || a.n - b.n).slice(0, k)
    return { white: top(w, 10), pb: top(p, 6) }
  }, [current])

  const Ball = ({ n, pb, big }: { n: number; pb?: boolean; big?: boolean }) => (
    <span className={'inline-flex items-center justify-center rounded-full font-bold tabular-nums shadow-sm ' + (big ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm') + ' ' + (pb ? 'bg-red-600 text-white' : 'bg-white text-gray-900 border border-gray-300')}>{n}</span>
  )

  const Row = ({ d, big }: { d: Draw; big?: boolean }) => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {d.white.map((n) => <Ball key={n} n={n} big={big} />)}
      <Ball n={d.pb} pb big={big} />
      {d.pp != null && <span className={'ml-1 rounded-md bg-amber-100 text-amber-700 font-semibold ' + (big ? 'text-sm px-2 py-1' : 'text-xs px-1.5 py-0.5')}>{t('pr_powerplay')} ×{d.pp}</span>}
    </div>
  )

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* status / fallback notice */}
        {status === 'fallback' && (
          <p className="text-sm rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2">
            ⚠️ {t('pr_fallback')}{meta && <> ({fmt((meta.collectedAt || '').slice(0, 10))})</>}
          </p>
        )}
        {status === 'error' && <p className="text-sm rounded-xl bg-red-50 border border-red-200 text-red-700 px-3 py-2">{t('pr_error')}</p>}

        {/* HERO — latest draw */}
        {latest ? (
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('pr_latest')}</div>
            <div className="text-sm text-gray-500 mt-0.5 mb-3">{fmt(latest.date)}{status === 'live' && <span className="ml-2 inline-flex items-center gap-1 text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{t('pr_live')}</span>}</div>
            <div className="flex justify-center"><Row d={latest} big /></div>
            <div className="mt-4 text-sm text-gray-500">{t('pr_nextdraw')}: <span className="font-medium text-gray-700">{nextDrawDate(latest.date).toLocaleDateString(LOCALE_TAG[lang], { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' })}</span> <span className="text-gray-400">(ET)</span></div>
          </div>
        ) : status === 'loading' ? (
          <p className="text-center text-gray-400 py-10 animate-pulse">{t('pr_loading')}</p>
        ) : null}

        {/* LOOKUP by date */}
        {latest && (
          <div className="rounded-2xl border border-gray-200 p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('pr_lookup')}</label>
            <input type="date" value={pickDate} min={draws[draws.length - 1]?.date} max={latest.date} onChange={(e) => setPickDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
            {pickDate && (picked ? (
              <div className="mt-3 rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-xs text-gray-500 mb-2">{fmt(picked.date)}{picked.era === 'legacy' && <span className="ml-2 text-amber-600">{t('pr_legacy')}</span>}</div>
                <Row d={picked} />
              </div>
            ) : <p className="mt-3 text-sm text-gray-500">{t('pr_nodraw')}</p>)}
          </div>
        )}

        {/* RECENT draws */}
        {latest && (
          <div className="rounded-2xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('pr_recent')}</h2>
            <div className="divide-y divide-gray-100">
              {draws.slice(0, limit).map((d) => (
                <div key={d.date} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-xs text-gray-400 shrink-0 w-24">{fmt(d.date)}</span>
                  <Row d={d} />
                </div>
              ))}
            </div>
            {limit < draws.length && <button onClick={() => setLimit((l) => l + 20)} className="mt-3 text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">{t('pr_showmore')}</button>}
          </div>
        )}

        {/* FREQUENCY (optional, neutral stats) */}
        {current.length > 0 && (
          <div className="rounded-2xl border border-gray-200 p-4">
            <button onClick={() => setShowFreq((s) => !s)} className="w-full flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>{t('pr_freq')}</span><span className="text-gray-400">{showFreq ? '▲' : '▼'}</span>
            </button>
            {showFreq && (
              <div className="mt-3 space-y-3">
                <p className="text-xs rounded-lg bg-gray-50 text-gray-500 px-3 py-2">📊 {t('pr_freq_note')} · {t('pr_draws_analyzed', { n: current.length })}</p>
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">{t('pr_freq_white')}</div>
                  <div className="flex flex-wrap gap-2">{freq.white.map(({ n, c }) => <span key={n} className="inline-flex items-center gap-1"><Ball n={n} /><span className="text-xs text-gray-400">{c}</span></span>)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">{t('pr_freq_pb')}</div>
                  <div className="flex flex-wrap gap-2">{freq.pb.map(({ n, c }) => <span key={n} className="inline-flex items-center gap-1"><Ball n={n} pb /><span className="text-xs text-gray-400">{c}</span></span>)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* source + safety */}
        {meta && (
          <div className="text-xs text-gray-400 space-y-1">
            <p>{t('pr_source')}: <a href={meta.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">{meta.source}</a></p>
            <p>{t('pr_updated')}: {fmt((meta.collectedAt || '').slice(0, 10))}</p>
            <p className="text-gray-400 pt-1">{t('pr_disclaimer')}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
