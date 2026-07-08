'use client'

// Animated stick-figure exercise guide for the workout timer. Each exercise is two keyframe
// poses (joint coordinates) interpolated on a loop; `active` (= timer in the WORK phase) plays
// the motion, otherwise the figure freezes at the start pose. Pure inline SVG — no assets.
import { useEffect, useRef, useState } from 'react'

// Flat pose: [headX,headY, neckX,neckY, hipX,hipY, knee1X,Y, foot1X,Y, knee2X,Y, foot2X,Y, elbowX,Y, handX,Y]
type Pose = number[]
type Fig = {
  a: Pose
  b: Pose
  period: number   // ms per rep cycle
  alt?: boolean    // legs alternate (flutter/scissors): leg2 runs in opposite phase
  bar?: boolean    // hanging exercises: draw a pull-up bar instead of the floor
}

// Lying base: head left, body along the floor (viewBox 200×120, floor y=110).
const L = { head: [26, 102], neck: [40, 102], hip: [92, 102], elbow: [56, 105], hand: [70, 106] }
const lying = (k1: number[], f1: number[], over?: Partial<typeof L>): Pose => {
  const o = { ...L, ...over }
  return [...o.head, ...o.neck, ...o.hip, ...k1, ...f1, ...k1, ...f1, ...o.elbow, ...o.hand]
}
const hang = (k: number[], f: number[]): Pose => [100, 30, 100, 42, 100, 74, ...k, ...f, ...k, ...f, 106, 30, 106, 18]

const FIGS: Record<string, Fig> = {
  'leg-raise': { period: 2400, a: lying([126, 100], [160, 98]), b: lying([98, 64], [102, 30]) },
  'knee-raise': { period: 2000, a: lying([124, 96], [156, 100]), b: lying([98, 68], [118, 88]) },
  'reverse-crunch': {
    period: 2000,
    a: lying([108, 72], [126, 94]),
    b: lying([88, 54], [108, 66], { hip: [86, 94] }),
  },
  'leg-raise-hold': { period: 1400, a: lying([122, 84], [152, 72]), b: lying([122, 80], [152, 66]) },
  'flutter-kick': {
    period: 700, alt: true,
    a: lying([122, 92], [154, 84]),
    b: lying([122, 98], [154, 100]),
  },
  scissors: {
    period: 900, alt: true,
    a: lying([120, 86], [152, 72]),
    b: lying([120, 98], [152, 104]),
  },
  'toe-touch': {
    period: 2000,
    a: lying([98, 62], [102, 28], { head: [26, 102], neck: [40, 102], elbow: [56, 100], hand: [70, 96] }),
    b: lying([98, 62], [102, 28], { head: [40, 78], neck: [50, 88], elbow: [66, 76], hand: [86, 52] }),
  },
  'v-up': {
    period: 2400,
    a: lying([128, 101], [162, 101]),
    b: lying([118, 70], [140, 46], { head: [48, 58], neck: [56, 70], hip: [92, 96], elbow: [76, 62], hand: [96, 54] }),
  },
  'seated-leg-raise': {
    period: 2000,
    a: lying([122, 90], [148, 96], { head: [70, 44], neck: [76, 56], hip: [96, 94], elbow: [88, 76], hand: [100, 92] }),
    b: lying([120, 72], [146, 54], { head: [70, 44], neck: [76, 56], hip: [96, 94], elbow: [88, 76], hand: [100, 92] }),
  },
  'hanging-knee-raise': { period: 2000, bar: true, a: hang([100, 94], [102, 110]), b: hang([114, 76], [106, 92]) },
  'hanging-leg-raise': { period: 2400, bar: true, a: hang([100, 94], [100, 110]), b: hang([124, 76], [148, 78]) },
}

const lerp = (a: Pose, b: Pose, t: number) => a.map((v, i) => v + (b[i] - v) * t)

export default function ExerciseFigure({ exId, active, className }: { exId: string; active: boolean; className?: string }) {
  const fig = FIGS[exId]
  const [pose, setPose] = useState<{ main: Pose; leg2T: number } | null>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!fig) return
    if (!active) { setPose({ main: fig.a, leg2T: fig.alt ? 1 : 0 }); return }
    const t0 = performance.now()
    const loop = (now: number) => {
      const t = ((now - t0) % fig.period) / fig.period
      const ease = 0.5 - 0.5 * Math.cos(2 * Math.PI * t) // smooth there-and-back per cycle
      setPose({ main: lerp(fig.a, fig.b, ease), leg2T: fig.alt ? 1 - ease : ease })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [exId, active, fig])

  if (!fig || !pose) return null
  const p = pose.main
  const leg2 = lerp(fig.a, fig.b, pose.leg2T)
  const S = { stroke: 'currentColor', strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' }
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden>
      {fig.bar
        ? <line x1="60" y1="16" x2="140" y2="16" {...S} strokeWidth={4} opacity={0.5} />
        : <line x1="14" y1="110" x2="186" y2="110" {...S} strokeWidth={3} opacity={0.35} />}
      {/* back leg (opposite phase when alternating) */}
      <g opacity={0.45}>
        <polyline points={`${p[4]},${p[5]} ${leg2[10]},${leg2[11]} ${leg2[12]},${leg2[13]}`} {...S} />
      </g>
      {/* front leg */}
      <polyline points={`${p[4]},${p[5]} ${p[6]},${p[7]} ${p[8]},${p[9]}`} {...S} />
      {/* torso */}
      <line x1={p[2]} y1={p[3]} x2={p[4]} y2={p[5]} {...S} />
      {/* arm */}
      <polyline points={`${p[2]},${p[3]} ${p[14]},${p[15]} ${p[16]},${p[17]}`} {...S} strokeWidth={4} opacity={0.85} />
      {/* head */}
      <circle cx={p[0]} cy={p[1]} r="8" fill="currentColor" />
    </svg>
  )
}
