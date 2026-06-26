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
function countdownBeeps() { if (isMuted()) return; tone(700, 0, 0.14); tone(700, 0.6, 0.14); tone(700, 1.2, 0.14); tone(1175, 1.8, 0.5, 'square', 0.22) }
function fanfare() { if (isMuted()) return;[523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.11, 0.16, 'triangle', 0.2)); tone(1046.5, 0.33, 0.6, 'triangle', 0.24) }

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
    clear(); setPhase('count'); setLabel('3'); countdownBeeps()
    ;([[600, '2'], [1200, '1'], [1800, 'START!']] as [number, string][]).forEach(([ms, txt]) => timers.current.push(window.setTimeout(() => setLabel(txt), ms)))
    timers.current.push(window.setTimeout(() => setPhase('playing'), 2400))
  }, [])

  const finish = useCallback(() => { setPhase((p) => (p === 'playing' ? 'finished' : p)); fanfare() }, [])
  const reset = useCallback(() => { clear(); setPhase('idle') }, [])

  return { phase, label, muteOn, toggleMute, begin, finish, reset, playing: phase === 'playing', started: phase === 'playing' || phase === 'finished' }
}

/** Countdown + FINISH overlay. Covers the nearest positioned ancestor. */
export function GameStageOverlay({ stage, finishLabel = 'FINISH!!' }: { stage: Stage; finishLabel?: string }) {
  const [showFinish, setShowFinish] = useState(false)
  useEffect(() => {
    if (stage.phase === 'finished') { setShowFinish(true); const id = setTimeout(() => setShowFinish(false), 1700); return () => clearTimeout(id) }
    setShowFinish(false)
  }, [stage.phase])

  const finishing = stage.phase === 'finished'
  if (stage.phase !== 'count' && !(finishing && showFinish)) return null
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 pointer-events-none rounded-xl">
      <span key={finishing ? 'fin' : stage.label}
        className={`font-extrabold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] ${finishing ? 'text-5xl text-amber-300' : stage.label === 'START!' ? 'text-5xl text-emerald-300' : 'text-8xl text-white'}`}
        style={{ animation: 'gsPop 0.4s cubic-bezier(0.2,0.9,0.3,1.3)' }}>
        {finishing ? finishLabel : stage.label}
      </span>
      <style>{'@keyframes gsPop{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.18);opacity:1}100%{transform:scale(1);opacity:1}}'}</style>
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
