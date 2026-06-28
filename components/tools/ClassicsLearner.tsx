'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import Modal from '@/components/Modal'
import type { ToolMeta } from '@/lib/tools/registry'
import type { ClassicVerse } from '@/lib/classics/cheonjamun'
import { trackToolUsed } from '@/lib/gtag'

function TraceChar({ char, label, onClose }: { char: string; label: string; onClose: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const t = useTranslations('toolui')

  function pos(e: React.PointerEvent) {
    const c = ref.current!, r = c.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) }
  }
  function down(e: React.PointerEvent) { drawing.current = true; const ctx = ref.current!.getContext('2d')!; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return
    const ctx = ref.current!.getContext('2d')!; const p = pos(e)
    ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.lineTo(p.x, p.y); ctx.stroke()
  }
  const up = () => { drawing.current = false }
  const clear = () => { const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height) }

  return (
    <Modal open onClose={onClose}>
      <div className="bg-white rounded-2xl p-5 max-w-xs w-full text-center space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
          <div className="absolute inset-0 flex items-center justify-center text-[220px] leading-none text-gray-200 select-none pointer-events-none" style={{ fontFamily: 'serif' }}>{char}</div>
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-r border-b border-dashed border-gray-200" /><div className="border-b border-dashed border-gray-200" /><div className="border-r border-dashed border-gray-200" /><div />
          </div>
          <canvas ref={ref} width={280} height={280} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
            className="absolute inset-0 touch-none cursor-crosshair" />
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={clear} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">{t('cl_clear')}</button>
          <button onClick={onClose} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700">{t('cl_close')}</button>
        </div>
      </div>
    </Modal>
  )
}

export default function ClassicsLearner({ verses, tool, lang, slug, tkey }: { verses: ClassicVerse[]; tool: ToolMeta; lang: string; slug: string; tkey: string }) {
  const t = useTranslations('toolui')
  const topics = useMemo(() => [...new Set(verses.map((v) => v.topic).filter(Boolean))] as string[], [verses])
  const [topic, setTopic] = useState<string>('')
  const list = useMemo(() => (topic ? verses.filter((v) => v.topic === topic) : verses), [verses, topic])
  const [idx, setIdx] = useState(0)
  const [trace, setTrace] = useState<{ char: string; label: string } | null>(null)

  useEffect(() => { trackToolUsed(slug); const s = +(localStorage.getItem(`cl-${slug}`) || 0); if (s && !topic) setIdx(Math.min(s, verses.length - 1)) }, []) // eslint-disable-line
  useEffect(() => { if (!topic) localStorage.setItem(`cl-${slug}`, String(idx)) }, [idx, topic, slug])
  useEffect(() => { setIdx(0) }, [topic])

  const v = list[idx]
  if (!v) return null
  const go = (d: number) => setIdx((i) => Math.min(list.length - 1, Math.max(0, i + d)))

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(`${tkey}_title`)}</h1>
          <p className="text-gray-500 text-sm mt-1">{t(`${tkey}_subtitle`)}</p>
        </div>

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setTopic('')} className={`px-2.5 py-1 text-xs rounded-full border ${!topic ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{t('cl_all')}</button>
            {topics.map((tp) => (
              <button key={tp} onClick={() => setTopic(tp)} className={`px-2.5 py-1 text-xs rounded-full border ${topic === tp ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}>{tp}</button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{t('cl_verse', { n: idx + 1, total: list.length })}</span>
          {v.topic && <span className="text-brand-600">{v.topic}</span>}
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-brand-500 transition-[width]" style={{ width: `${((idx + 1) / list.length) * 100}%` }} /></div>

        <div className="rounded-2xl border-2 border-gray-100 p-6 text-center space-y-3">
          <div className="text-4xl font-bold tracking-wide text-gray-900" style={{ fontFamily: 'serif' }}>{v.hanja}</div>
          <div className="text-lg text-gray-600">{v.reading}</div>

          {v.chars && (
            <div className="grid grid-cols-4 gap-2 pt-2">
              {v.chars.map((c, i) => (
                <button key={i} onClick={() => setTrace({ char: c.hanja, label: `${c.hun} ${c.eum}` })}
                  className="rounded-xl border border-gray-100 py-2 hover:border-brand-400 hover:bg-brand-50">
                  <div className="text-3xl" style={{ fontFamily: 'serif' }}>{c.hanja}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.hun} {c.eum}</div>
                </button>
              ))}
            </div>
          )}

          {v.meaning && <p className="text-gray-700 pt-1">{v.meaning}</p>}
        </div>

        {v.chars && <p className="text-xs text-center text-gray-400">{t('cl_tracehint')}</p>}

        <div className="flex items-center justify-between">
          <button onClick={() => go(-1)} disabled={idx === 0} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">← {t('cl_prev')}</button>
          <span className="text-xs text-gray-400">{t('cl_saved')}</span>
          <button onClick={() => go(1)} disabled={idx === list.length - 1} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700">{t('cl_next')} →</button>
        </div>
      </div>

      {trace && <TraceChar char={trace.char} label={trace.label} onClose={() => setTrace(null)} />}
    </ToolLayout>
  )
}
