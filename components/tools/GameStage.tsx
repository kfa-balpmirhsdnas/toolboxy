'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Shared "ready, set, go" stage for games: a 3·2·1·START! countdown with beeps
 * and a FINISH!! flourish with a short fanfare. Sounds are synthesized with the
 * Web Audio API (no asset files) and unlocked on the Start click (a user gesture,
 * so autoplay policy is satisfied). Honors a persisted mute flag.
 *
 * Usage:
 *   const stage = useGameStage()
 *   // Start button -> stage.begin(); real game starts when stage.phase === 'playing'
 *   // call stage.finish() when the round ends
 *   // render <GameStageOverlay stage={stage} /> inside a `relative` play area
 */

let _ctx: AudioContext | null = null
function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!_ctx) _ctx = new AC()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.18) {
  const ctx = ac(); if (!ctx) return
  const t = ctx.currentTime + start
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = freq
  o.connect(g); g.connect(ctx.destination)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.start(t); o.stop(t + dur + 0.03)
}
const isMuted = () => typeof window !== 'undefined' && localStorage.getItem('game-muted') === '1'
// 3·2·1·START — rising pitch (C5 → E5 → G5 → high C6) for building tension.
function countdownBeeps() { if (isMuted()) return; tone(523.25, 0, 0.15); tone(659.25, 0.6, 0.15); tone(783.99, 1.2, 0.15); tone(1046.5, 1.8, 0.5, 'square', 0.22) }
// Victory fanfare: a quick ascending run that resolves into a big sustained
// major chord with a high sparkle and a bass root for fullness.
function fanfare() {
  if (isMuted()) return
  const run = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  run.forEach((f, i) => tone(f, i * 0.085, 0.12, 'square', 0.16))
  const t = run.length * 0.085
  ;[1046.5, 1318.51, 1567.98].forEach((f) => tone(f, t, 0.8, 'triangle', 0.17)) // C6 major chord
  tone(2093.0, t + 0.12, 0.5, 'square', 0.09) // high sparkle
  tone(261.63, t, 0.8, 'triangle', 0.13) // C4 bass root
}

export const isGameMuted = () => isMuted()
// Tiny per-action sound effects — every game calls these for feedback; the same
// 'game-muted' flag (toggled by SoundToggle) turns ALL game audio off.
export type Sfx = 'move' | 'rotate' | 'lock' | 'clear' | 'drop' | 'eat' | 'point' | 'hit' | 'lose'
export function sfx(kind: Sfx) {
  if (isMuted()) return
  switch (kind) {
    case 'move': tone(330, 0, 0.04, 'square', 0.07); break
    case 'rotate': tone(523, 0, 0.05, 'square', 0.1); break
    case 'lock': tone(196, 0, 0.07, 'square', 0.12); break
    case 'clear': tone(659, 0, 0.08, 'square', 0.15); tone(880, 0.09, 0.12, 'square', 0.15); break
    case 'drop': tone(392, 0, 0.06, 'square', 0.12); tone(262, 0.05, 0.07, 'square', 0.1); break
    case 'eat': case 'point': tone(880, 0, 0.05, 'square', 0.14); tone(1318, 0.05, 0.07, 'square', 0.1); break
    case 'hit': tone(1200, 0, 0.04, 'square', 0.16); tone(500, 0.03, 0.07, 'square', 0.12); break
    case 'lose': tone(196, 0, 0.25, 'sawtooth', 0.16); tone(155, 0.12, 0.35, 'sawtooth', 0.14); break
  }
}

/** Standalone sound on/off — reads/writes the shared 'game-muted' flag, no Stage needed. */
export function useMute() {
  const [muted, setMuted] = useState(false)
  useEffect(() => { setMuted(isMuted()) }, [])
  const toggle = useCallback(() => setMuted((m) => { const n = !m; try { localStorage.setItem('game-muted', n ? '1' : '0') } catch { /* */ } return n }), [])
  return { muted, toggle }
}
export function SoundToggle({ className = '' }: { className?: string }) {
  const { muted, toggle } = useMute()
  return (
    <button type="button" onClick={toggle} aria-label="toggle sound" aria-pressed={!muted} title="sound on/off"
      className={`text-lg leading-none text-gray-400 hover:text-gray-700 transition-colors ${className}`}>{muted ? '🔇' : '🔊'}</button>
  )
}

/** Largest square cell (px, incl. 1px grid gaps) for a cols×rows board that keeps
 * the whole board inside the mobile viewport on BOTH axes — the game box never
 * overflows width or height. `reserve` = vertical space taken by the box's other
 * chrome (header, title, score, controls). Recomputes on resize/orientation. */
export function useFitCell(cols: number, rows: number, opts?: { reserve?: number; maxCell?: number; minCell?: number; gap?: number; pad?: number }) {
  const { reserve = 250, maxCell = 30, minCell = 10, gap = 1, pad = 1 } = opts || {}
  const ref = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState(minCell)
  useEffect(() => {
    const calc = () => {
      // Measure the ACTUAL box width (includes page px-4 + panel p-6 + max-width),
      // so the board never overflows on any device. Height is viewport-based.
      // `gap`/`pad` are the board's inter-cell gap + per-side padding in px.
      const availW = ref.current?.clientWidth || (window.innerWidth - 32)
      const availH = window.innerHeight - reserve
      const byW = Math.floor((availW - 2 * pad - gap * (cols - 1)) / cols)
      const byH = Math.floor((availH - 2 * pad - gap * (rows - 1)) / rows)
      setCell(Math.max(minCell, Math.min(maxCell, byW, byH)))
    }
    calc()
    const raf = requestAnimationFrame(calc) // re-measure once layout settles
    window.addEventListener('resize', calc)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', calc) }
  }, [cols, rows, reserve, maxCell, minCell, gap, pad])
  return [cell, ref] as const
}

/** Scroll the game box ([data-game-stage]) up so its top sits just BELOW the
 * sticky site header — never under it, or the game title gets hidden. Shared so
 * every game — GameStage-driven or not — behaves the same on Start. */
export function scrollGameToTop() {
  if (typeof window === 'undefined') return
  const el = document.querySelector('[data-game-stage]') as HTMLElement | null
  if (!el) return
  const header = document.querySelector('header')
  const offset = (header ? header.getBoundingClientRect().height : 0) + 12
  const y = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
}

export type Stage = ReturnType<typeof useGameStage>

export function useGameStage() {
  const [phase, setPhase] = useState<'idle' | 'count' | 'playing' | 'finished'>('idle')
  const [label, setLabel] = useState('3')
  const [muteOn, setMuteOn] = useState(false)
  const timers = useRef<number[]>([])
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  useEffect(() => { setMuteOn(isMuted()) }, [])
  useEffect(() => () => clear(), [])

  const toggleMute = useCallback(() => setMuteOn((m) => { const n = !m; localStorage.setItem('game-muted', n ? '1' : '0'); return n }), [])

  const begin = useCallback(() => {
    ac() // unlock/resume audio within the click gesture
    scrollGameToTop() // pull the game box to the top so the board + countdown have room (all viewports)
    clear(); setPhase('count'); setLabel('3'); countdownBeeps()
    ;([[600, '2'], [1200, '1'], [1800, 'START!']] as [number, string][]).forEach(([ms, txt]) => timers.current.push(window.setTimeout(() => setLabel(txt), ms)))
    timers.current.push(window.setTimeout(() => setPhase('playing'), 2400))
  }, [])

  const finish = useCallback(() => { setPhase((p) => (p === 'playing' ? 'finished' : p)); fanfare() }, [])
  const reset = useCallback(() => { clear(); setPhase('idle') }, [])

  return { phase, label, muteOn, toggleMute, begin, finish, reset, playing: phase === 'playing', started: phase === 'playing' || phase === 'finished' }
}

const GS_KEYFRAMES =
  '@keyframes gsCount{0%{transform:scale(0.45);opacity:0}18%{transform:scale(0.8);opacity:1}100%{transform:scale(2);opacity:0}}' +
  '@keyframes gsGo{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.25);opacity:1}70%{transform:scale(0.95)}100%{transform:scale(1.08);opacity:1}}' +
  '@keyframes gsGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5)}}' +
  '@keyframes gsBounceIn{0%{transform:scale(0.2);opacity:0}45%{transform:scale(1.35)}65%{transform:scale(0.92)}82%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}' +
  '@keyframes gsShimmer{to{background-position:200% center}}' +
  '@keyframes gsRing{0%{transform:scale(0.3);opacity:0.85}100%{transform:scale(2.6);opacity:0}}'

// Vivid per-label colour (white is too flat for a countdown).
const GS_COLORS: Record<string, string> = { '3': '#38bdf8', '2': '#fb7185', '1': '#facc15', 'START!': '#4ade80' }

/** Countdown + FINISH overlay (+ optional idle Start button). Covers the nearest positioned ancestor. */
export function GameStageOverlay({ stage, showStart = true, startLabel = '▶ START', finishLabel = 'FINISH!!', replayLabel = '↻ REPLAY' }: { stage: Stage; showStart?: boolean; startLabel?: string; finishLabel?: string; replayLabel?: string }) {
  const [showFinish, setShowFinish] = useState(false)
  useEffect(() => {
    if (stage.phase === 'finished') { setShowFinish(true); const id = setTimeout(() => setShowFinish(false), 2200); return () => clearTimeout(id) }
    setShowFinish(false)
  }, [stage.phase])

  // Button overlay: idle → START, finished (after the flourish) → REPLAY. Both restart via begin().
  const replaying = stage.phase === 'finished' && !showFinish
  if ((stage.phase === 'idle' && showStart) || replaying) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl" style={{ background: 'rgba(0,0,0,0.32)' }}>
        <button type="button" onClick={stage.begin}
          className="px-8 py-3 rounded-full bg-brand-600 text-white text-lg font-bold shadow-lg hover:bg-brand-700 active:scale-95 transition">{replaying ? replayLabel : startLabel}</button>
        <button type="button" onClick={stage.toggleMute} aria-label="toggle sound"
          className="absolute top-2 right-2 text-lg leading-none opacity-80 hover:opacity-100">{stage.muteOn ? '🔇' : '🔊'}</button>
      </div>
    )
  }

  const finishing = stage.phase === 'finished'
  if (stage.phase !== 'count' && !(finishing && showFinish)) return null

  const isGo = stage.label === 'START!'
  const col = GS_COLORS[stage.label] || '#fff'

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-xl pointer-events-none" style={{ background: 'rgba(0,0,0,0.5)' }}>
      {finishing ? (
        <>
          <span className="absolute rounded-full" style={{ width: 110, height: 110, border: '6px solid #fbbf24', animation: 'gsRing 1.1s ease-out infinite' }} />
          <span className="absolute rounded-full" style={{ width: 110, height: 110, border: '6px solid #f472b6', animation: 'gsRing 1.1s ease-out 0.4s infinite' }} />
          <span key="fin" className="relative font-extrabold tracking-wider" style={{
            fontSize: '3.4rem',
            backgroundImage: 'linear-gradient(90deg,#f43f5e,#fbbf24,#4ade80,#38bdf8,#a78bfa,#f43f5e)',
            backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            animation: 'gsBounceIn 0.65s cubic-bezier(0.2,0.9,0.3,1.4), gsShimmer 1.5s linear infinite',
            filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.45))',
          }}>{finishLabel}</span>
        </>
      ) : (
        <span key={stage.label} className="font-extrabold" style={{
          color: col,
          fontSize: isGo ? '4.5rem' : '8rem',
          textShadow: `0 0 18px ${col}, 0 0 38px ${col}, 0 2px 6px rgba(0,0,0,0.4)`,
          animation: isGo ? 'gsGo 0.5s cubic-bezier(0.2,0.9,0.3,1.5) forwards, gsGlow 0.7s ease-in-out infinite' : 'gsCount 0.62s ease-out forwards',
        }}>{stage.label}</span>
      )}
      <style>{GS_KEYFRAMES}</style>
    </div>
  )
}

/** Small 🔊/🔇 toggle the game can place anywhere. */
export function MuteToggle({ stage, className = '' }: { stage: Stage; className?: string }) {
  return (
    <button type="button" onClick={stage.toggleMute} aria-label="toggle sound"
      className={`text-base leading-none text-gray-400 hover:text-gray-600 ${className}`}>{stage.muteOn ? '🔇' : '🔊'}</button>
  )
}
