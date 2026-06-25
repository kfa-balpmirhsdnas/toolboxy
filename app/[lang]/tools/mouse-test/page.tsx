'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('mouse-test')!

export default function MouseTestPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [btn, setBtn] = useState<Set<number>>(new Set())
  const [dbl, setDbl] = useState(false)
  const [scroll, setScroll] = useState<'up' | 'down' | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [rate, setRate] = useState(0)
  const [maxRate, setMaxRate] = useState(0)
  const times = useRef<number[]>([])

  function onMove(e: React.MouseEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPos({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) })
    const now = performance.now()
    times.current.push(now)
    times.current = times.current.filter((tm) => now - tm < 1000)
    const hz = times.current.length
    setRate(hz); setMaxRate((m) => Math.max(m, hz))
  }
  const press = (n: number) => setBtn((s) => new Set(s).add(n))
  const release = (n: number) => setBtn((s) => { const x = new Set(s); x.delete(n); return x })

  const Mb = ({ n, label }: { n: number; label: string }) => (
    <div className={`flex-1 h-14 flex items-center justify-center rounded-xl border-2 text-sm font-semibold ${btn.has(n) ? 'bg-brand-500 text-white border-brand-600' : 'bg-white text-gray-500 border-gray-200'}`}>{label}</div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('mo_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('mo_subtitle')}</p>
        </div>

        <div
          onMouseMove={onMove}
          onMouseDown={(e) => press(e.button)}
          onMouseUp={(e) => release(e.button)}
          onMouseLeave={() => setBtn(new Set())}
          onDoubleClick={() => { setDbl(true); setTimeout(() => setDbl(false), 500) }}
          onWheel={(e) => { setScroll(e.deltaY > 0 ? 'down' : 'up'); setTimeout(() => setScroll(null), 400) }}
          onContextMenu={(e) => e.preventDefault()}
          className="h-40 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-center text-sm text-gray-400 cursor-crosshair select-none">
          {t('mo_pad')}<br />{pos.x},{pos.y}
        </div>

        <div className="flex gap-2">
          <Mb n={0} label={t('mo_left')} />
          <Mb n={1} label={t('mo_middle')} />
          <Mb n={2} label={t('mo_right')} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className={`rounded-xl border-2 py-3 ${dbl ? 'bg-brand-500 text-white border-brand-600' : 'border-gray-200 text-gray-500'}`}>{t('mo_dblclick')}</div>
          <div className={`rounded-xl border-2 py-3 ${scroll ? 'bg-brand-500 text-white border-brand-600' : 'border-gray-200 text-gray-500'}`}>{t('mo_scroll')} {scroll === 'up' ? '↑' : scroll === 'down' ? '↓' : ''}</div>
        </div>

        <div className="flex justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm">
          <span className="text-gray-500">{t('mo_polling')}</span>
          <span className="font-medium text-gray-800 tabular-nums">{rate} Hz <span className="text-gray-400">({t('mo_max')} {maxRate})</span></span>
        </div>

        <p className="text-xs text-gray-400">{t('mo_note')}</p>
      </div>
    </ToolLayout>
  )
}
