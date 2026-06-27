'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('screen-test')!
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000', '#00ffff', '#ff00ff', '#ffff00', '#808080']

export default function ScreenTestPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [active, setActive] = useState(false)
  const [idx, setIdx] = useState(0)
  const [hint, setHint] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  function start(i: number) {
    setIdx(i); setActive(true); setHint(true)
    setTimeout(() => { ref.current?.requestFullscreen?.().catch(() => {}) }, 0)
    setTimeout(() => setHint(false), 2500)
  }
  function exit() {
    setActive(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }

  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement) setActive(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(false) }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('keydown', onKey) }
  }, [])

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('st_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('st_subtitle')}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {COLORS.map((c, i) => (
            <button key={c} onClick={() => start(i)} style={{ background: c, border: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
              className="h-16 rounded-xl shadow-sm hover:scale-[1.03] transition-transform" aria-label={c} />
          ))}
        </div>
        <p className="text-xs text-gray-400">{t('st_note')}</p>
      </div>

      {active && (
        <div ref={ref} onClick={() => { setIdx((i) => (i + 1) % COLORS.length); setHint(false) }}
          style={{ background: COLORS[idx] }}
          className="fixed inset-0 z-[9999] cursor-pointer flex items-center justify-center">
          {hint && (
            <div className="px-4 py-2 rounded-lg bg-black/60 text-white text-sm pointer-events-none">{t('st_hint')}</div>
          )}
          <button onClick={(e) => { e.stopPropagation(); exit() }}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 text-white text-sm">{t('st_exit')} ✕</button>
        </div>
      )}
    </ToolLayout>
  )
}
