'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('image-comparison')!
type Img = { url: string; name: string; w: number; h: number }
type Mode = 'slider' | 'side' | 'overlay' | 'sync'

const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const x = new Image(); x.onload = () => res(x); x.onerror = rej; x.src = src })
// Draw an image object-contain into the (dx,dy,dw,dh) box of a canvas ctx.
function drawContain(ctx: CanvasRenderingContext2D, im: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
  const ar = im.naturalWidth / im.naturalHeight, br = dw / dh
  let w = dw, h = dh
  if (ar > br) h = dw / ar; else w = dh * ar
  ctx.drawImage(im, dx + (dw - w) / 2, dy + (dh - h) / 2, w, h)
}

export default function ImageComparisonPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const toolNames = (useMessages() as { toolNames?: Record<string, string> }).toolNames ?? {}
  const [a, setA] = useState<Img | null>(null)
  const [b, setB] = useState<Img | null>(null)
  const [mode, setMode] = useState<Mode>('slider')
  const [pos, setPos] = useState(50) // slider %
  const [opacity, setOpacity] = useState(50) // overlay %
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [labelA, setLabelA] = useState('')
  const [labelB, setLabelB] = useState('')
  const [saving, setSaving] = useState(false)

  const refA = useRef<HTMLInputElement>(null)
  const refB = useRef<HTMLInputElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sliderDrag = useRef(false)
  const panDrag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  const la = labelA || t('ic_before')
  const lb = labelB || t('ic_after')
  const both = a && b
  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [])

  const load = useCallback(async (file: File, which: 'a' | 'b') => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const im = await loadImg(url).catch(() => null)
    const img: Img = { url, name: file.name, w: im?.naturalWidth || 0, h: im?.naturalHeight || 0 }
    if (which === 'a') setA((p) => { if (p) URL.revokeObjectURL(p.url); return img }); else setB((p) => { if (p) URL.revokeObjectURL(p.url); return img })
    trackToolUsed('image-comparison')
  }, [])

  function clearAll() { if (a) URL.revokeObjectURL(a.url); if (b) URL.revokeObjectURL(b.url); setA(null); setB(null); resetView(); setPos(50) }
  function swap() { setA(b); setB(a); const l = labelA; setLabelA(labelB); setLabelB(l) }

  // Slider drag (pointer = mouse + touch).
  const sliderFromEvent = (clientX: number) => {
    const r = stageRef.current!.getBoundingClientRect()
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)))
  }
  const capture = (e: React.PointerEvent) => { try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* not a live pointer */ } }
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (mode === 'slider') { sliderDrag.current = true; capture(e); sliderFromEvent(e.clientX) }
    else if ((mode === 'overlay' || mode === 'sync') && zoom > 1) { panDrag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; capture(e) }
  }
  const onStagePointerMove = (e: React.PointerEvent) => {
    if (sliderDrag.current) sliderFromEvent(e.clientX)
    else if (panDrag.current) setPan({ x: panDrag.current.px + (e.clientX - panDrag.current.x), y: panDrag.current.py + (e.clientY - panDrag.current.y) })
  }
  const onStagePointerUp = () => { sliderDrag.current = false; panDrag.current = null }
  const onWheel = (e: React.WheelEvent) => { if (mode === 'side') return; e.preventDefault(); setZoom((z) => Math.min(8, Math.max(1, z + (e.deltaY < 0 ? 0.2 : -0.2)))) }

  const showZoom = mode !== 'side'
  const tf = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`

  // Save the current comparison as a PNG (composited on a canvas at image A's resolution).
  async function saveComparison() {
    if (!a || !b) return
    setSaving(true)
    try {
      const ia = await loadImg(a.url), ib = await loadImg(b.url)
      const W = a.w || ia.naturalWidth, H = a.h || ia.naturalHeight
      const cv = document.createElement('canvas')
      const ctx = (() => { cv.width = mode === 'side' || mode === 'sync' ? W * 2 : W; cv.height = H; return cv.getContext('2d')! })()
      ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, cv.width, cv.height)
      if (mode === 'side' || mode === 'sync') { drawContain(ctx, ia, 0, 0, W, H); drawContain(ctx, ib, W, 0, W, H) }
      else if (mode === 'overlay') { drawContain(ctx, ia, 0, 0, W, H); ctx.globalAlpha = opacity / 100; drawContain(ctx, ib, 0, 0, W, H); ctx.globalAlpha = 1 }
      else { // slider
        drawContain(ctx, ia, 0, 0, W, H)
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * (pos / 100), H); ctx.clip(); drawContain(ctx, ib, 0, 0, W, H); ctx.restore()
        ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, W / 500); ctx.beginPath(); ctx.moveTo(W * (pos / 100), 0); ctx.lineTo(W * (pos / 100), H); ctx.stroke()
      }
      cv.toBlob((blob) => { if (!blob) return; const u = URL.createObjectURL(blob); const el = document.createElement('a'); el.href = u; el.download = 'comparison.png'; el.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); trackToolDownload('image-comparison', 'png') }, 'image/png')
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  // Reset pan/zoom when switching to a mode that ignores them.
  useEffect(() => { if (mode === 'side') resetView() }, [mode, resetView])

  const dropZone = (which: 'a' | 'b', img: Img | null, ref: React.RefObject<HTMLInputElement>, label: string) => (
    <div onClick={() => ref.current?.click()}
      onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0], which) }} onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { e.target.files?.[0] && load(e.target.files[0], which); e.target.value = '' }} />
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.url} alt={img.name} className="max-h-40 mx-auto rounded-lg" />
      ) : (
        <><p className="text-4xl mb-2">🖼️</p><p className="text-sm font-medium text-gray-600">{label}</p></>
      )}
      <p className="text-xs text-brand-600 mt-2">{img ? t('ic_change') : t('ui_pick_files')}</p>
    </div>
  )

  const Chip = ({ text, side }: { text: string; side: 'l' | 'r' }) => (
    <span className={'absolute top-2 z-10 rounded-full bg-black/60 text-white text-xs px-2.5 py-1 backdrop-blur ' + (side === 'l' ? 'left-2' : 'right-2')}>{text}</span>
  )

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div className="space-y-4">
        {/* Uploaders (always available so users can swap either side) */}
        <div className="grid grid-cols-2 gap-3">
          {dropZone('a', a, refA, t('ic_first'))}
          {dropZone('b', b, refB, t('ic_second'))}
        </div>

        {both && (
          <>
            {/* Mode tabs + controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
                {([['slider', t('ic_mode_slider')], ['side', t('ic_mode_side')], ['overlay', t('ic_mode_overlay')], ['sync', t('ic_mode_sync')]] as const).map(([m, label]) => (
                  <button key={m} onClick={() => setMode(m)} className={'px-2.5 py-1 rounded-md transition-colors ' + (mode === m ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>{label}</button>
                ))}
              </div>
              <div className="flex items-center gap-0.5 ml-auto">
                {showZoom && <>
                  <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100" title={t('iv_zoom_out')} aria-label={t('iv_zoom_out')} onClick={() => setZoom((z) => Math.max(1, z - 0.25))}><ToolIcon name="zoom-out" /></button>
                  <span className="text-xs w-11 text-center tabular-nums text-gray-500">{Math.round(zoom * 100)}%</span>
                  <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100" title={t('iv_zoom_in')} aria-label={t('iv_zoom_in')} onClick={() => setZoom((z) => Math.min(8, z + 0.25))}><ToolIcon name="zoom-in" /></button>
                  <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100" title={t('iv_fit')} aria-label={t('iv_fit')} onClick={resetView}><ToolIcon name="fit" /></button>
                </>}
                <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100" title={t('ic_swap')} aria-label={t('ic_swap')} onClick={swap}><ToolIcon name="refresh" /></button>
              </div>
            </div>

            {/* Editable labels */}
            <div className="flex items-center gap-2 text-xs">
              <input value={labelA} onChange={(e) => setLabelA(e.target.value)} placeholder={t('ic_before')} className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <input value={labelB} onChange={(e) => setLabelB(e.target.value)} placeholder={t('ic_after')} className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>

            {/* Stage */}
            {mode === 'side' || mode === 'sync' ? (
              <div className="grid grid-cols-2 gap-1">
                {[{ img: a, lbl: la }, { img: b, lbl: lb }].map((p, i) => (
                  <div key={i}
                    onWheel={onWheel}
                    onPointerDown={onStagePointerDown} onPointerMove={onStagePointerMove} onPointerUp={onStagePointerUp} onPointerLeave={onStagePointerUp}
                    ref={i === 0 ? stageRef : undefined}
                    className={'relative overflow-hidden rounded-xl bg-gray-900 h-[46vh] select-none ' + (mode === 'sync' && zoom > 1 ? 'cursor-grab active:cursor-grabbing' : '')}>
                    <Chip text={p.lbl} side="l" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img!.url} alt={p.lbl} draggable={false} style={mode === 'sync' ? { transform: tf } : undefined} className="absolute inset-0 m-auto max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <div ref={stageRef}
                onWheel={onWheel}
                onPointerDown={onStagePointerDown} onPointerMove={onStagePointerMove} onPointerUp={onStagePointerUp} onPointerLeave={onStagePointerUp}
                style={{ touchAction: mode === 'slider' ? 'none' : undefined }}
                className={'relative overflow-hidden rounded-xl bg-gray-900 h-[58vh] select-none ' + (mode === 'slider' ? 'cursor-ew-resize' : zoom > 1 ? 'cursor-grab active:cursor-grabbing' : '')}>
                {/* bottom = A */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={la} draggable={false} style={{ transform: tf }} className="absolute inset-0 m-auto max-w-full max-h-full object-contain" />
                {/* top = B (clipped for slider, opacity for overlay) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.url} alt={lb} draggable={false}
                  style={{ transform: tf, ...(mode === 'slider' ? { clipPath: `inset(0 ${100 - pos}% 0 0)` } : { opacity: opacity / 100 }) }}
                  className="absolute inset-0 m-auto max-w-full max-h-full object-contain" />
                {mode === 'slider' && (
                  <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${pos}%` }}>
                    <div className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white/90" />
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700"><ToolIcon name="chevron-left" className="w-3.5 h-3.5" /><ToolIcon name="chevron-right" className="w-3.5 h-3.5" /></div>
                  </div>
                )}
                <Chip text={mode === 'slider' ? lb : la} side="l" />
                <Chip text={mode === 'slider' ? la : lb} side="r" />
              </div>
            )}

            {/* Overlay opacity control */}
            {mode === 'overlay' && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="shrink-0">{t('ic_opacity')}</span>
                <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="flex-1 accent-brand-600" />
                <span className="w-8 text-right tabular-nums">{opacity}%</span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={saveComparison} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50"><ToolIcon name="save" className="w-4 h-4" />{saving ? t('ic_saving') : t('ic_save')}</button>
              <button onClick={clearAll} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">{t('ui_clear')}</button>
            </div>
          </>
        )}

        {/* Privacy banner */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span><b>{t('im_privacy_title')}</b> {t('im_privacy')}</span>
        </div>

        {/* Cross-links to the tools whose results people compare */}
        <p className="text-xs text-gray-400">
          {t('ic_related')}{' '}
          <Link href={`/${lang}/tools/image-compress`} className="text-brand-600 hover:underline">{toolNames['image-compress'] || 'Image Compress'}</Link>
          {' · '}
          <Link href={`/${lang}/tools/image-resizer`} className="text-brand-600 hover:underline">{toolNames['image-resizer'] || 'Image Resizer'}</Link>
        </p>
      </div>
    </ToolLayout>
  )
}
