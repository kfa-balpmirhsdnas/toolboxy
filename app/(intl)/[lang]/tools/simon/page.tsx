'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Leaderboard from '@/components/tools/Leaderboard'
import { useGameStage, GameStageOverlay, SoundToggle, isGameMuted, useFitCell } from '@/components/tools/GameStage'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('simon')!
const PADS = [
  { c: '#22c55e', lit: '#bbf7d0', f: 329.63 },
  { c: '#ef4444', lit: '#fecaca', f: 261.63 },
  { c: '#eab308', lit: '#fef08a', f: 392.0 },
  { c: '#3b82f6', lit: '#bfdbfe', f: 440.0 },
]

let _ctx: AudioContext | null = null
function tone(freq: number, dur = 0.35) {
  if (isGameMuted()) return
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!_ctx) _ctx = new AC()
    if (_ctx.state === 'suspended') _ctx.resume()
    const o = _ctx.createOscillator(), g = _ctx.createGain()
    o.type = 'sine'; o.frequency.value = freq; o.connect(g); g.connect(_ctx.destination)
    const t = _ctx.currentTime
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.start(t); o.stop(t + dur + 0.03)
  } catch { /* ignore */ }
}

export default function SimonPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const stage = useGameStage()
  const [CELL, boxRef] = useFitCell(2, 2, { reserve: 290, maxCell: 150, gap: 12, pad: 0 })
  const [seq, setSeq] = useState<number[]>([])
  const [phase, setPhase] = useState<'idle' | 'watch' | 'input' | 'over'>('idle')
  const [active, setActive] = useState(-1)
  const [best, setBest] = useState(0)
  const inputIdx = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const round = seq.length

  useEffect(() => { try { setBest(Number(localStorage.getItem('simon-best') || 0)) } catch { /* */ } }, [])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  const playSeq = useCallback((s: number[]) => {
    setPhase('watch'); timers.current.forEach(clearTimeout); timers.current = []
    s.forEach((pad, i) => {
      timers.current.push(setTimeout(() => { setActive(pad); tone(PADS[pad].f) }, 620 * i + 350))
      timers.current.push(setTimeout(() => setActive(-1), 620 * i + 350 + 360))
    })
    timers.current.push(setTimeout(() => { setPhase('input'); inputIdx.current = 0 }, 620 * s.length + 450))
  }, [])

  // A round begins once the shared START countdown finishes (stage.phase === 'playing').
  const startRound = useCallback(() => { const s = [Math.floor(Math.random() * 4)]; setSeq(s); playSeq(s) }, [playSeq])
  useEffect(() => { if (stage.phase === 'playing') startRound() }, [stage.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function press(pad: number) {
    if (phase !== 'input') return
    setActive(pad); tone(PADS[pad].f); setTimeout(() => setActive((a) => (a === pad ? -1 : a)), 200)
    if (seq[inputIdx.current] === pad) {
      inputIdx.current++
      if (inputIdx.current === seq.length) {
        const r = seq.length
        if (r > best) { setBest(r); try { localStorage.setItem('simon-best', String(r)) } catch { /* */ } }
        const ns = [...seq, Math.floor(Math.random() * 4)]
        setSeq(ns); setTimeout(() => playSeq(ns), 750)
      }
    } else { setPhase('over'); stage.finish() }
  }

  const status = phase === 'watch' ? t('si_watch') : phase === 'input' ? t('si_your') : phase === 'over' ? t('si_over', { n: round }) : t('si_ready')

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div ref={boxRef} data-game-stage className="relative w-full max-w-xs mx-auto space-y-4 text-center select-none">
        <SoundToggle className="absolute top-0 right-0 z-10" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('si_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('si_subtitle')}</p>
        </div>
        <div className="flex justify-center gap-6 font-semibold text-gray-700">
          <span>{t('si_round')}: {phase === 'idle' ? 0 : round}</span>
          <span>{t('si_best')}: {best}</span>
        </div>
        <div className="font-semibold text-gray-700 h-6">{status}</div>
        <div className="relative mx-auto" style={{ width: CELL * 2 + 12 }}>
          <div className="grid grid-cols-2 gap-3">
            {PADS.map((p, i) => (
              <button key={i} onClick={() => press(i)} disabled={phase !== 'input'} aria-label={`pad ${i + 1}`}
                className="aspect-square rounded-2xl transition-all active:scale-95"
                style={{ background: active === i ? p.lit : p.c, boxShadow: active === i ? `0 0 24px ${p.lit}` : 'none', opacity: phase === 'input' || active === i ? 1 : 0.8 }} />
            ))}
          </div>
          <GameStageOverlay stage={stage} />
        </div>
        <p className="text-xs text-gray-400">{t('si_help')}</p>
      </div>
      <Leaderboard game="simon" score={best || null} better="higher" />
    </ToolLayout>
  )
}
