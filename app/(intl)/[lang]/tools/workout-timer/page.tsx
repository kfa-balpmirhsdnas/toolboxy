'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import ExerciseFigure from '@/components/tools/ExerciseFigure'
import { getToolBySlug } from '@/lib/tools/registry'
import { EXERCISES, exName, exDescKey, type Exercise } from '@/lib/tools/exercises'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('workout-timer')!

type Phase = 'idle' | 'prep' | 'work' | 'rest' | 'done'
type Seg = { ph: 'prep' | 'work' | 'rest'; dur: number; set: number; round: number }
type Routine = { name: string; ex: string; prep: number; work: number; rest: number; sets: number; rounds: number }

const fmt = (s: number) => { const m = Math.floor(Math.max(0, s) / 60); const ss = Math.max(0, s) % 60; return m > 0 ? `${m}:${String(ss).padStart(2, '0')}` : String(ss) }
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// Phase → full-card colour (text labels always shown alongside — colour-blind safe).
const PHASE_BG: Record<Phase, string> = {
  idle: 'bg-gradient-to-b from-gray-700 to-gray-900',
  prep: 'bg-gradient-to-b from-amber-400 to-amber-600',
  work: 'bg-gradient-to-b from-green-500 to-green-700',
  rest: 'bg-gradient-to-b from-blue-500 to-blue-700',
  done: 'bg-gradient-to-b from-violet-500 to-violet-700',
}

export default function WorkoutTimerPage({ params: { lang } }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [exId, setExId] = useState('')
  const [levelFilter, setLevelFilter] = useState(0) // 0 = all
  const [prep, setPrep] = useState(10)
  const [work, setWork] = useState(30)
  const [rest, setRest] = useState(20)
  const [sets, setSets] = useState(3)
  const [rounds, setRounds] = useState(1)
  const [sound, setSound] = useState(true)
  const [vib, setVib] = useState(true)
  const [phase, setPhase] = useState<Phase>('idle')
  const [running, setRunning] = useState(false)
  const [left, setLeft] = useState(0)          // seconds left in the current segment
  const [totalLeft, setTotalLeft] = useState(0) // seconds left in the whole session
  const [segInfo, setSegInfo] = useState({ set: 0, round: 1 })
  const [routines, setRoutines] = useState<Routine[]>([])
  const [routineName, setRoutineName] = useState('')
  const [ddOpen, setDdOpen] = useState<'' | 'level' | 'ex'>('') // mobile custom dropdowns

  const segsRef = useRef<Seg[]>([])
  const segIdxRef = useRef(0)
  const segEndAtRef = useRef(0)      // absolute ms when the current segment ends (drift-free base)
  const pausedMsRef = useRef(0)      // remaining ms of the current segment while paused
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastBeepRef = useRef(-1)
  const acRef = useRef<AudioContext | null>(null)
  const soundRef = useRef(sound); soundRef.current = sound
  const vibRef = useRef(vib); vibRef.current = vib
  const runningRef = useRef(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeRef = useRef<any>(null)

  const ex = EXERCISES.find((e) => e.id === exId) || null

  // Restore persisted options/routines + the ?ex= preset from a shared URL.
  useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem('wkt_opts_v1') || '{}')
      if (typeof o.sound === 'boolean') setSound(o.sound)
      if (typeof o.vib === 'boolean') setVib(o.vib)
      const r = localStorage.getItem('wkt_routines_v1'); if (r) setRoutines(JSON.parse(r))
    } catch { /* ignore */ }
    const q = new URLSearchParams(window.location.search).get('ex')
    if (q && EXERCISES.some((e) => e.id === q)) pickExercise(q, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Options persist at the point of change (a save-effect would clobber them on StrictMode remount).
  const saveOpts = (s: boolean, v: boolean) => { try { localStorage.setItem('wkt_opts_v1', JSON.stringify({ sound: s, vib: v })) } catch { /* ignore */ } }
  const toggleSound = () => setSound((s) => { saveOpts(!s, vibRef.current); return !s })
  const toggleVib = () => setVib((v) => { saveOpts(soundRef.current, !v); return !v })

  function pickExercise(id: string, updateUrl = true) {
    const e = EXERCISES.find((x) => x.id === id)
    if (!e) return
    setExId(id); setWork(e.work); setRest(e.rest); setSets(e.sets)
    if (updateUrl) { try { const u = new URL(window.location.href); u.searchParams.set('ex', id); window.history.replaceState(null, '', u.toString()) } catch { /* ignore */ } }
  }

  // ---- audio cues (Web Audio, synthesized — no files, unlocked by the start tap) ----
  const beep = (freq: number, ms: number, delay = 0, gain = 0.35) => {
    if (!soundRef.current) return
    const ac = acRef.current
    if (!ac) return
    try {
      const o = ac.createOscillator(); const g = ac.createGain()
      o.type = 'sine'; o.frequency.value = freq
      o.connect(g); g.connect(ac.destination)
      const at = ac.currentTime + delay
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(gain, at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, at + ms / 1000)
      o.start(at); o.stop(at + ms / 1000 + 0.05)
    } catch { /* ignore */ }
  }
  const buzz = (pattern: number | number[]) => { if (vibRef.current) try { navigator.vibrate?.(pattern) } catch { /* ignore */ } }
  const cueCountdown = () => beep(880, 110)
  const cueSwitch = () => { beep(1318, 420); buzz(200) }
  const cueDone = () => { beep(880, 160); beep(1108, 160, 0.18); beep(1318, 400, 0.36); buzz([180, 80, 180, 80, 320]) }

  // ---- wake lock (keep the screen on while running) ----
  const acquireWake = async () => { try { wakeRef.current = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<unknown> } }).wakeLock?.request('screen') } catch { /* unsupported → ignore */ } }
  const releaseWake = () => { try { wakeRef.current?.release?.() } catch { /* ignore */ } wakeRef.current = null }
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible' && runningRef.current) acquireWake() }
    document.addEventListener('visibilitychange', onVis)
    return () => { document.removeEventListener('visibilitychange', onVis); releaseWake() }
  }, [])

  // ---- timer engine: absolute-time based so background-tab throttling never drifts the schedule ----
  const buildSegs = (): Seg[] => {
    const out: Seg[] = []
    if (prep > 0) out.push({ ph: 'prep', dur: prep, set: 0, round: 1 })
    for (let r = 1; r <= rounds; r++) {
      for (let s = 1; s <= sets; s++) {
        out.push({ ph: 'work', dur: work, set: s, round: r })
        const isLast = r === rounds && s === sets
        if (!isLast && rest > 0) out.push({ ph: 'rest', dur: rest, set: s, round: r })
      }
    }
    return out
  }
  const remainingAfter = (idx: number) => segsRef.current.slice(idx + 1).reduce((a, x) => a + x.dur, 0)

  const enterSeg = (idx: number, now: number) => {
    const seg = segsRef.current[idx]
    segIdxRef.current = idx
    segEndAtRef.current = now + seg.dur * 1000
    lastBeepRef.current = -1
    setPhase(seg.ph)
    setSegInfo({ set: seg.set, round: seg.round })
    setLeft(seg.dur)
    setTotalLeft(seg.dur + remainingAfter(idx))
  }

  const tick = () => {
    const now = Date.now()
    if (now >= segEndAtRef.current) {
      const next = segIdxRef.current + 1
      if (next >= segsRef.current.length) { finish(); return }
      cueSwitch()
      // anchor the next segment to the SCHEDULED end (not `now`) so late ticks don't stretch the session
      const anchor = segEndAtRef.current
      enterSeg(next, anchor)
      return
    }
    const leftS = Math.ceil((segEndAtRef.current - now) / 1000)
    setLeft(leftS)
    setTotalLeft(leftS + remainingAfter(segIdxRef.current))
    if (leftS <= 3 && leftS >= 1 && lastBeepRef.current !== leftS) { lastBeepRef.current = leftS; cueCountdown(); buzz(60) }
  }

  const startTicking = () => { if (tickRef.current) clearInterval(tickRef.current); tickRef.current = setInterval(tick, 100) }
  const stopTicking = () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null } }

  const start = () => {
    // Unlock audio inside the user gesture (iOS Safari stays silent otherwise).
    try {
      type AC = typeof AudioContext
      const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext) as AC | undefined
      if (Ctor && !acRef.current) acRef.current = new Ctor()
      acRef.current?.resume?.()
    } catch { /* ignore */ }
    trackToolUsed('workout-timer')
    const segs = buildSegs()
    if (!segs.length) return
    segsRef.current = segs
    runningRef.current = true; setRunning(true)
    enterSeg(0, Date.now())
    startTicking()
    acquireWake()
  }
  const pause = () => { pausedMsRef.current = Math.max(0, segEndAtRef.current - Date.now()); stopTicking(); runningRef.current = false; setRunning(false); releaseWake() }
  const resume = () => {
    try { acRef.current?.resume?.() } catch { /* ignore */ }
    segEndAtRef.current = Date.now() + pausedMsRef.current
    runningRef.current = true; setRunning(true)
    startTicking(); acquireWake()
  }
  const reset = () => { stopTicking(); runningRef.current = false; setRunning(false); setPhase('idle'); setLeft(0); setTotalLeft(0); setSegInfo({ set: 0, round: 1 }); releaseWake() }
  const finish = () => { stopTicking(); runningRef.current = false; setRunning(false); setPhase('done'); setLeft(0); setTotalLeft(0); cueDone(); releaseWake() }
  useEffect(() => () => stopTicking(), [])

  // ---- custom routines (localStorage) ----
  const saveRoutines = (list: Routine[]) => { setRoutines(list); try { localStorage.setItem('wkt_routines_v1', JSON.stringify(list)) } catch { /* ignore */ } }
  const saveRoutine = () => {
    const nm = routineName.trim(); if (!nm) return
    const next = routines.filter((r) => r.name !== nm).concat([{ name: nm, ex: exId, prep, work, rest, sets, rounds }])
    saveRoutines(next); setRoutineName('')
  }
  const loadRoutine = (r: Routine) => { if (r.ex && EXERCISES.some((e) => e.id === r.ex)) setExId(r.ex); setPrep(r.prep); setWork(r.work); setRest(r.rest); setSets(r.sets); setRounds(r.rounds) }

  const phaseLabel = phase === 'idle' ? t('wkt_ready') : phase === 'prep' ? t('wkt_prep') : phase === 'work' ? t('wkt_work') : phase === 'rest' ? t('wkt_rest') : t('wkt_done')
  const active = phase !== 'idle' && phase !== 'done'
  const shownEx = levelFilter ? EXERCISES.filter((e) => e.level === levelFilter) : EXERCISES

  const stepper = (label: string, value: number, set: (v: number) => void, lo: number, hi: number, step = 5) => (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => set(clamp(value - step, lo, hi))} disabled={running} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 disabled:opacity-40">−</button>
        <span className="w-10 text-center text-sm font-bold tabular-nums">{value}</span>
        <button onClick={() => set(clamp(value + step, lo, hi))} disabled={running} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 disabled:opacity-40">＋</button>
      </div>
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4 max-w-lg mx-auto">
        {/* ---- Exercise presets — chips on wide screens, compact custom dropdowns on mobile ---- */}
        <div className="rounded-xl border border-gray-200 p-3">
          {/* mobile: [레벨 ▾][운동 ▾] in one row (chips need too much vertical space) */}
          <div className="sm:hidden relative flex items-center gap-2">
            <button onClick={() => setDdOpen((o) => (o === 'level' ? '' : 'level'))} disabled={running}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 disabled:opacity-40">
              {levelFilter === 0 ? t('wkt_all') : 'Lv' + levelFilter}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={'w-3.5 h-3.5 transition-transform ' + (ddOpen === 'level' ? 'rotate-180' : '')}><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <button onClick={() => setDdOpen((o) => (o === 'ex' ? '' : 'ex'))} disabled={running}
              className={'flex-1 min-w-0 inline-flex items-center justify-between gap-1 px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 ' + (ex ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500')}>
              <span className="truncate">{ex ? exName(ex, lang) + ' · Lv' + ex.level : t('wkt_pick_ex')}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={'w-3.5 h-3.5 shrink-0 transition-transform ' + (ddOpen === 'ex' ? 'rotate-180' : '')}><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {ddOpen && (
              <>
                {/* click-away layer */}
                <div className="fixed inset-0 z-30" onClick={() => setDdOpen('')} />
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {ddOpen === 'level'
                      ? [0, 1, 2, 3, 4].map((lv) => (
                        <button key={lv} onClick={() => { setLevelFilter(lv); setDdOpen('') }}
                          className={'w-full px-4 py-2.5 text-left text-sm font-semibold ' + (levelFilter === lv ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:bg-gray-50')}>
                          {lv === 0 ? t('wkt_all') : 'Lv' + lv}
                        </button>
                      ))
                      : shownEx.map((e) => (
                        <button key={e.id} onClick={() => { pickExercise(e.id); setDdOpen('') }}
                          className={'w-full flex items-center justify-between px-4 py-2.5 text-left text-sm ' + (exId === e.id ? 'text-brand-600 bg-brand-50 font-bold' : 'text-gray-700 hover:bg-gray-50')}>
                          <span className="truncate">{exName(e, lang)}</span>
                          <span className="shrink-0 text-[11px] text-gray-400 font-semibold ml-2">Lv{e.level}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* ≥sm: original level chips + exercise chip grid */}
          <div className="hidden sm:block space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500 mr-1">{t('wkt_presets')}</span>
              {[0, 1, 2, 3, 4].map((lv) => (
                <button key={lv} onClick={() => setLevelFilter(lv)} className={'px-2 py-1 rounded-lg text-xs font-semibold transition ' + (levelFilter === lv ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                  {lv === 0 ? t('wkt_all') : 'Lv' + lv}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {shownEx.map((e) => (
                <button key={e.id} onClick={() => pickExercise(e.id)} disabled={running}
                  className={'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 ' + (exId === e.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {exName(e, lang)}<span className={'ml-1 text-[10px] ' + (exId === e.id ? 'text-white/70' : 'text-gray-400')}>Lv{e.level}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Big timer card (whole card takes the phase colour; label text alongside) ---- */}
        <div className={'rounded-2xl text-white shadow-sm overflow-hidden transition-colors ' + PHASE_BG[phase]}>
          <div className="p-6 text-center select-none">
            <p className="text-sm font-bold tracking-widest uppercase opacity-90">{phaseLabel}{ex && phase !== 'idle' ? ` · ${exName(ex, lang)}` : ''}</p>
            {/* Animated form guide, synced to the timer: moves during WORK, freezes otherwise */}
            {ex && <ExerciseFigure exId={ex.id} active={running && phase === 'work'} className="mx-auto mt-1 -mb-1 w-44 h-24 text-white/90" />}
            <p className="text-7xl font-black tabular-nums leading-tight my-2">{active || phase === 'done' ? fmt(left) : fmt(work)}</p>
            <div className="flex items-center justify-center gap-3 text-xs font-semibold opacity-90 tabular-nums">
              <span>{t('wkt_set')} {active ? Math.max(1, segInfo.set) : '—'}/{sets}</span>
              {rounds > 1 && <span>{t('wkt_round')} {segInfo.round}/{rounds}</span>}
              {active && <span>{t('wkt_total_left')} {fmt(totalLeft)}</span>}
            </div>
            {/* set progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3" aria-hidden>
              {Array.from({ length: sets }, (_, i) => (
                <span key={i} className={'w-2 h-2 rounded-full ' + (active && i < segInfo.set ? 'bg-white' : 'bg-white/30')} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 mt-5">
              {!running && !active && (
                <button onClick={start} className="px-8 py-3 rounded-2xl bg-white text-gray-900 text-base font-extrabold shadow hover:scale-[1.02] active:scale-95 transition">{t('wkt_start')}</button>
              )}
              {running && (
                <button onClick={pause} className="px-8 py-3 rounded-2xl bg-white/25 text-white text-base font-extrabold hover:bg-white/35 active:scale-95 transition">{t('wkt_pause')}</button>
              )}
              {!running && active && (
                <button onClick={resume} className="px-8 py-3 rounded-2xl bg-white text-gray-900 text-base font-extrabold shadow active:scale-95 transition">{t('wkt_resume')}</button>
              )}
              {(active || phase === 'done') && (
                <button onClick={reset} className="px-4 py-3 rounded-2xl bg-white/15 text-white text-sm font-bold hover:bg-white/25 active:scale-95 transition inline-flex items-center gap-1"><ToolIcon name="refresh" className="w-4 h-4" />{t('wkt_reset')}</button>
              )}
            </div>
            {/* sound / vibration toggles */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={toggleSound} className={'px-3 py-1.5 rounded-lg text-xs font-semibold transition ' + (sound ? 'bg-white/25' : 'bg-white/10 opacity-60 line-through')}>{t('wkt_sound')}</button>
              <button onClick={toggleVib} className={'px-3 py-1.5 rounded-lg text-xs font-semibold transition ' + (vib ? 'bg-white/25' : 'bg-white/10 opacity-60 line-through')}>{t('wkt_vibrate')}</button>
            </div>
          </div>
        </div>

        {/* ---- Settings (steppers) ---- */}
        <div className="rounded-xl border border-gray-200 px-3 py-1.5 divide-y divide-gray-100">
          {stepper(t('wkt_prep_s'), prep, setPrep, 0, 60, 5)}
          {stepper(t('wkt_work_s'), work, setWork, 5, 600, 5)}
          {stepper(t('wkt_rest_s'), rest, setRest, 0, 300, 5)}
          {stepper(t('wkt_sets'), sets, setSets, 1, 20, 1)}
          {stepper(t('wkt_rounds'), rounds, setRounds, 1, 10, 1)}
        </div>

        {/* ---- Custom routines (save / load / delete) ---- */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
            <input value={routineName} onChange={(e) => setRoutineName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveRoutine() }} placeholder={t('wkt_routine_ph')} className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-brand-400" />
            <button onClick={saveRoutine} disabled={!routineName.trim()} className="px-3 py-1.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40">{t('wkt_save')}</button>
          </div>
          {routines.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-4">{t('wkt_no_routines')}</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {routines.map((r) => {
                const rex = EXERCISES.find((e) => e.id === r.ex)
                return (
                  <div key={r.name} className="flex items-center gap-2 px-3 py-2">
                    <button onClick={() => loadRoutine(r)} disabled={running} className="flex-1 min-w-0 text-left disabled:opacity-40">
                      <span className="block text-sm font-semibold text-gray-800 truncate">{r.name}</span>
                      <span className="block text-[11px] text-gray-400 tabular-nums">{rex ? exName(rex, lang) + ' · ' : ''}{r.work}s / {r.rest}s × {r.sets}{r.rounds > 1 ? ` × ${r.rounds}R` : ''}</span>
                    </button>
                    <button onClick={() => saveRoutines(routines.filter((x) => x.name !== r.name))} aria-label="delete" className="p-1.5 shrink-0 text-gray-300 hover:text-red-500"><ToolIcon name="x" className="w-4 h-4" /></button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ---- Selected exercise guide ---- */}
        {ex && (
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-800 mb-1">{exName(ex, lang)} <span className="text-xs font-semibold text-gray-400">Lv{ex.level}</span></p>
            <p className="text-sm text-gray-600 leading-relaxed">{t(exDescKey(ex.id))}</p>
          </div>
        )}

        {/* Related tools */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {([['fasting-timer', '⏳', t('wkt_rel_fast')], ['stopwatch', '⏱️', t('wkt_rel_stopwatch')], ['metronome', '🎵', t('wkt_rel_metronome')]] as const).map(([slug, icon, label]) => (
            <a key={slug} href={`/${lang}/tools/${slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300"><span>{icon}</span><span>{label}</span></a>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
