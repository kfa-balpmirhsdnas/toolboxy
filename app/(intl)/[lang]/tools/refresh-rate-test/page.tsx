'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('refresh-rate-test')!
const COMMON = [30, 50, 60, 75, 90, 100, 120, 144, 165, 240, 360]
const nearest = (fps: number) => COMMON.reduce((a, b) => (Math.abs(b - fps) < Math.abs(a - fps) ? b : a))

export default function RefreshRatePage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [fps, setFps] = useState(0)
  const [info, setInfo] = useState<Record<string, string>>({})
  const rafRef = useRef(0)

  useEffect(() => {
    let frames = 0, last = performance.now(), acc: number[] = []
    const loop = (now: number) => {
      frames++
      if (now - last >= 500) {
        acc.push((frames * 1000) / (now - last))
        if (acc.length > 6) acc.shift()
        setFps(acc.reduce((a, b) => a + b, 0) / acc.length)
        frames = 0; last = now
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    setInfo({
      resolution: `${window.screen.width} × ${window.screen.height}`,
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      dpr: String(window.devicePixelRatio),
      depth: `${window.screen.colorDepth}-bit`,
    })
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const hz = nearest(fps)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('rr_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('rr_subtitle')}</p>
        </div>

        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-8 text-center">
          <div className="text-6xl font-bold text-brand-700 tabular-nums">{fps ? Math.round(fps) : '—'}<span className="text-2xl font-medium ml-1">FPS</span></div>
          <div className="text-sm text-gray-500 mt-2">{fps ? t('rr_likely', { hz }) : t('rr_measuring')}</div>
        </div>

        <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 text-sm">
          {[['rr_resolution', info.resolution], ['rr_viewport', info.viewport], ['rr_dpr', info.dpr], ['rr_depth', info.depth]].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-2.5"><span className="text-gray-500">{t(k!)}</span><span className="font-medium text-gray-800 tabular-nums">{v || '—'}</span></div>
          ))}
        </div>

        <p className="text-xs text-gray-400">{t('rr_note')}</p>
      </div>
    </ToolLayout>
  )
}
