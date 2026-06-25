'use client'

import { useState, useRef, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('spinner-wheel')!
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e']
const CX = 160, CY = 160, R = 150

// point on the wheel at `deg` measured clockwise from the top (12 o'clock)
function pt(r: number, deg: number): [number, number] {
  const t = (deg * Math.PI) / 180
  return [CX + r * Math.sin(t), CY - r * Math.cos(t)]
}

export default function SpinnerWheelPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [raw, setRaw] = useState(() => t('sw_sample'))
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [removeWinner, setRemoveWinner] = useState(false)
  const wheelRef = useRef<SVGGElement | null>(null)

  const entries = useMemo(() => raw.split('\n').map((s) => s.trim()).filter(Boolean), [raw])
  const n = entries.length
  const w = n > 0 ? 360 / n : 360

  const spin = () => {
    if (spinning || n < 2) return
    setWinner(null)
    trackToolUsed(tool.slug)
    const target = Math.floor(Math.random() * n)
    // rotate so the target wedge centre lands under the top pointer, + 6 full turns
    const base = 360 * 6 + (360 - (target + 0.5) * w)
    const next = rotation - (rotation % 360) + base
    setSpinning(true)
    setRotation(next)
    window.setTimeout(() => {
      setSpinning(false)
      setWinner(entries[target])
      if (removeWinner) setRaw(entries.filter((_, i) => i !== target).join('\n'))
    }, 4200)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('sw_title')}</h1>
        <p className="text-gray-500 mb-6">{t('sw_subtitle')}</p>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* wheel */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* pointer */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10"
                style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid #111827' }} />
              <svg viewBox="0 0 320 320" className="w-72 h-72 sm:w-80 sm:h-80 select-none">
                <circle cx={CX} cy={CY} r={R + 4} fill="#111827" />
                <g ref={wheelRef} style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}>
                  {n >= 2 ? entries.map((e, i) => {
                    const a0 = i * w, a1 = (i + 1) * w
                    const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1)
                    const large = w > 180 ? 1 : 0
                    const [lx, ly] = pt(R * 0.62, a0 + w / 2)
                    return (
                      <g key={i}>
                        <path d={`M ${CX} ${CY} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={COLORS[i % COLORS.length]} />
                        <text x={lx.toFixed(2)} y={ly.toFixed(2)} fill="#fff" fontSize={n > 12 ? 10 : 13} fontWeight="600"
                          textAnchor="middle" dominantBaseline="middle"
                          transform={`rotate(${a0 + w / 2} ${lx.toFixed(2)} ${ly.toFixed(2)})`}>
                          {e.length > 12 ? e.slice(0, 11) + '…' : e}
                        </text>
                      </g>
                    )
                  }) : (
                    <circle cx={CX} cy={CY} r={R} fill="#e5e7eb" />
                  )}
                </g>
                <circle cx={CX} cy={CY} r={16} fill="#fff" stroke="#111827" strokeWidth={3} />
              </svg>
            </div>
            <button onClick={spin} disabled={spinning || n < 2}
              className="mt-5 w-full max-w-xs py-3 text-base font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 transition-colors">
              {spinning ? t('sw_spinning') : t('sw_spin')}
            </button>
            {winner && (
              <div className="mt-4 w-full max-w-xs text-center rounded-xl border-2 border-brand-300 bg-brand-50 py-3 px-4">
                <div className="text-xs text-brand-500">{t('sw_winner')}</div>
                <div className="text-2xl font-bold text-brand-700 break-words">{winner}</div>
              </div>
            )}
          </div>

          {/* entries editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('sw_entries')} ({n})</label>
            <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={10}
              placeholder={t('sw_placeholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
            {n < 2 && <p className="text-xs text-amber-600 mt-1">{t('sw_min')}</p>}
            <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={removeWinner} onChange={(e) => setRemoveWinner(e.target.checked)} className="w-4 h-4 accent-brand-600" />
              {t('sw_remove_winner')}
            </label>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
