'use client'

// Post-capture editor for the screen-capture tool: crop, arrow/rectangle/text
// annotations, and mosaic (to hide sensitive info), then export the edited image
// (PNG/JPG download or clipboard copy). All client-side. Drawing is imperative
// on a canvas; React state is only used for the toolbar.

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { trackToolDownload, trackToolCopy } from '@/lib/gtag'

type Tool = 'crop' | 'arrow' | 'rect' | 'text' | 'mosaic'
type Rect = { x: number; y: number; w: number; h: number }
type Shape =
  | ({ type: 'rect'; color: string; lw: number } & Rect)
  | ({ type: 'ellipse'; color: string; lw: number } & Rect)
  | { type: 'arrow'; x1: number; y1: number; x2: number; y2: number; color: string; lw: number }
  | { type: 'text'; x: number; y: number; text: string; color: string; size: number }
  | ({ type: 'mosaic' } & Rect)

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#111827', '#ffffff']
const STROKE_MUL = [0.6, 1, 1.8] // 가늘게 / 보통 / 두껍게
const FONT_MUL = [0.7, 1, 1.5]   // 작게 / 중간 / 크게

function normRect(x1: number, y1: number, x2: number, y2: number): Rect {
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) }
}

export default function ScreenCaptureEditor({ source, onRecapture, timingToggle }: { source: HTMLCanvasElement; onRecapture: () => void; timingToggle?: React.ReactNode }) {
  const t = useTranslations('toolui')
  const baseRef = useRef<HTMLCanvasElement | null>(null) // current image (crop replaces it)
  const dispRef = useRef<HTMLCanvasElement | null>(null) // visible canvas
  const shapesRef = useRef<Shape[]>([])
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const draftRef = useRef<Shape | null>(null)
  const lwRef = useRef(4)
  const fontRef = useRef(28)
  const inputRef = useRef<HTMLInputElement>(null)

  const [tool, setTool] = useState<Tool>('arrow')
  const [color, setColor] = useState(COLORS[0])
  const [strokeLevel, setStrokeLevel] = useState(1)        // 0 가늘게 / 1 보통 / 2 두껍게
  const [fontLevel, setFontLevel] = useState(1)            // 0 작게 / 1 중간 / 2 크게
  const [shapeKind, setShapeKind] = useState<'rect' | 'ellipse'>('rect')
  const [colorOpen, setColorOpen] = useState(false)        // collapse the colour palette behind one swatch
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const [editing, setEditing] = useState<{ x: number; y: number; value: string } | null>(null)
  const [count, setCount] = useState(0) // bump to refresh toolbar (undo enabled etc.)
  const bump = () => setCount((c) => c + 1)

  // Focus the text box when it opens. autoFocus alone can fail for an input
  // rendered from a pointer event; rAF runs after the click settles so focus sticks.
  useEffect(() => {
    if (!editing) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.x, editing?.y])

  // (Re)initialise the base image whenever a new capture comes in.
  useEffect(() => {
    const b = document.createElement('canvas')
    b.width = source.width; b.height = source.height
    b.getContext('2d')!.drawImage(source, 0, 0)
    baseRef.current = b
    shapesRef.current = []
    lwRef.current = Math.max(3, Math.round(b.width / 500))
    fontRef.current = Math.max(18, Math.round(b.width / 45))
    setEditing(null)
    setDims({ w: b.width, h: b.height })
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

  function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, c: string, lw: number) {
    const head = Math.max(22, lw * 8) // bigger, more visible arrowhead
    const ang = Math.atan2(y2 - y1, x2 - x1)
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = lw; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - head * Math.cos(ang - Math.PI / 6), y2 - head * Math.sin(ang - Math.PI / 6))
    ctx.lineTo(x2 - head * Math.cos(ang + Math.PI / 6), y2 - head * Math.sin(ang + Math.PI / 6))
    ctx.closePath(); ctx.fill()
  }

  function drawMosaic(ctx: CanvasRenderingContext2D, base: HTMLCanvasElement, r: Rect) {
    const w = Math.max(1, Math.round(r.w)), h = Math.max(1, Math.round(r.h))
    if (w < 2 || h < 2) return
    const block = Math.max(6, Math.round(base.width / 90))
    const tmp = document.createElement('canvas')
    tmp.width = Math.max(1, Math.round(w / block)); tmp.height = Math.max(1, Math.round(h / block))
    tmp.getContext('2d')!.drawImage(base, r.x, r.y, w, h, 0, 0, tmp.width, tmp.height)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, r.x, r.y, w, h)
    ctx.imageSmoothingEnabled = true
  }

  function drawShape(ctx: CanvasRenderingContext2D, base: HTMLCanvasElement, s: Shape) {
    if (s.type === 'rect') { ctx.strokeStyle = s.color; ctx.lineWidth = s.lw; ctx.strokeRect(s.x, s.y, s.w, s.h) }
    else if (s.type === 'ellipse') {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.lw
      ctx.beginPath(); ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, Math.abs(s.w) / 2, Math.abs(s.h) / 2, 0, 0, 2 * Math.PI); ctx.stroke()
    }
    else if (s.type === 'arrow') drawArrow(ctx, s.x1, s.y1, s.x2, s.y2, s.color, s.lw)
    else if (s.type === 'text') { ctx.fillStyle = s.color; ctx.font = `bold ${s.size}px sans-serif`; ctx.textBaseline = 'top'; ctx.fillText(s.text, s.x, s.y) }
    else if (s.type === 'mosaic') drawMosaic(ctx, base, s)
  }

  function paint(draft?: Shape | null) {
    const disp = dispRef.current, b = baseRef.current
    if (!disp || !b) return
    if (disp.width !== b.width) disp.width = b.width
    if (disp.height !== b.height) disp.height = b.height
    const ctx = disp.getContext('2d')!
    ctx.clearRect(0, 0, disp.width, disp.height)
    ctx.drawImage(b, 0, 0)
    for (const s of shapesRef.current) drawShape(ctx, b, s)
    if (draft) drawShape(ctx, b, draft)
  }

  function flatten(): HTMLCanvasElement {
    const b = baseRef.current!
    const c = document.createElement('canvas')
    c.width = b.width; c.height = b.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(b, 0, 0)
    for (const s of shapesRef.current) drawShape(ctx, b, s)
    return c
  }

  function pos(e: { clientX: number; clientY: number }) {
    const c = dispRef.current!, r = c.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) }
  }

  function buildDraft(s: { x: number; y: number }, p: { x: number; y: number }): Shape | null {
    const lw = Math.max(2, Math.round(lwRef.current * STROKE_MUL[strokeLevel]))
    if (tool === 'arrow') return { type: 'arrow', x1: s.x, y1: s.y, x2: p.x, y2: p.y, color, lw }
    const r = normRect(s.x, s.y, p.x, p.y)
    if (tool === 'rect') return { type: shapeKind === 'ellipse' ? 'ellipse' : 'rect', ...r, color, lw }
    if (tool === 'mosaic') return { type: 'mosaic', ...r }
    if (tool === 'crop') return { type: 'rect', ...r, color: '#3b82f6', lw: Math.max(2, lwRef.current - 1) } // visual only
    return null
  }

  function onDown(e: React.PointerEvent) {
    if (editing || tool === 'text') return // text opens on click (after the press), so mouseup can't blur it shut
    startRef.current = pos(e)
    try { dispRef.current!.setPointerCapture(e.pointerId) } catch { /* not capturable (e.g. synthetic) */ }
  }
  function onClick(e: React.MouseEvent) {
    // Place the text box on click — by now the full press is over, so the
    // freshly-focused input won't be blurred shut by the trailing mouseup.
    if (tool === 'text' && !editing) setEditing({ x: pos(e).x, y: pos(e).y, value: '' })
  }
  function onMove(e: React.PointerEvent) {
    const s = startRef.current
    if (!s) return
    draftRef.current = buildDraft(s, pos(e))
    paint(draftRef.current)
  }
  function onUp(e: React.PointerEvent) {
    const s = startRef.current
    if (!s) return
    const p = pos(e)
    startRef.current = null; draftRef.current = null
    if (tool === 'crop') {
      const r = normRect(s.x, s.y, p.x, p.y)
      if (r.w > 5 && r.h > 5) applyCrop(r)
      else paint()
      return
    }
    const draft = buildDraft(s, p)
    if (draft && ((draft.type === 'arrow') || ('w' in draft && draft.w > 3 && draft.h > 3))) {
      shapesRef.current = [...shapesRef.current, draft]
      bump()
    }
    paint()
  }

  function applyCrop(r: Rect) {
    const flat = flatten()
    const nb = document.createElement('canvas')
    nb.width = Math.round(r.w); nb.height = Math.round(r.h)
    nb.getContext('2d')!.drawImage(flat, r.x, r.y, r.w, r.h, 0, 0, nb.width, nb.height)
    baseRef.current = nb
    shapesRef.current = []
    setDims({ w: nb.width, h: nb.height })
    bump(); paint()
  }

  function commitText() {
    if (editing && editing.value.trim()) {
      shapesRef.current = [...shapesRef.current, { type: 'text', x: editing.x, y: editing.y, text: editing.value, color, size: Math.round(fontRef.current * FONT_MUL[fontLevel]) }]
      bump()
    }
    setEditing(null); paint()
  }
  function undo() { shapesRef.current = shapesRef.current.slice(0, -1); bump(); paint() }
  function clearAll() { shapesRef.current = []; bump(); paint() }

  function exportBlob(type: string, q?: number): Promise<Blob | null> {
    return new Promise((res) => flatten().toBlob((b) => res(b), type, q))
  }
  async function download(fmt: 'png' | 'jpg') {
    const blob = await exportBlob(fmt === 'jpg' ? 'image/jpeg' : 'image/png', fmt === 'jpg' ? 0.92 : undefined)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `screenshot-${Date.now()}.${fmt}`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    trackToolDownload('screen-capture', fmt)
  }
  const [copied, setCopied] = useState(false)
  const [copyErr, setCopyErr] = useState(false)
  async function copy() {
    setCopyErr(false)
    try {
      if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) throw new Error()
      const blob = await exportBlob('image/png')
      if (!blob) throw new Error()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true); setTimeout(() => setCopied(false), 1600)
      trackToolCopy('screen-capture')
    } catch { setCopyErr(true) }
  }

  const TOOLS: [Tool, string][] = [['crop', t('sc_ed_crop')], ['arrow', t('sc_ed_arrow')], ['rect', t('sc_ed_rect')], ['text', t('sc_ed_text')], ['mosaic', t('sc_ed_mosaic')]]
  const ICONS: Record<Tool, string> = { crop: '✂', arrow: '↗', rect: '▭', text: 'T', mosaic: '▦' }
  const tbtn = (active: boolean) =>
    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ' +
    (active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
  const optBtn = (active: boolean) =>
    'px-3 py-1 rounded-md text-xs font-medium transition-colors ' +
    (active ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {TOOLS.map(([id, label]) => (
          <button key={id} onClick={() => { setEditing(null); setTool(id) }} className={tbtn(tool === id)}><span className="mr-1">{ICONS[id]}</span>{label}</button>
        ))}
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button onClick={() => setColorOpen((o) => !o)} aria-label={t('sc_ed_color')} title={t('sc_ed_color')}
          className="flex items-center gap-1 pl-1.5 pr-1 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">
          <span className="w-5 h-5 rounded-full border border-gray-300" style={{ background: color }} />
          <span className="text-gray-400 text-[10px]">▾</span>
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button onClick={undo} disabled={shapesRef.current.length === 0} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40">↶ {t('sc_ed_undo')}</button>
        <button onClick={clearAll} disabled={shapesRef.current.length === 0} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"><span className="mr-1">🗑</span>{t('sc_ed_clear')}</button>
      </div>
      {/* Colour palette — revealed by the single swatch button */}
      {colorOpen && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">🎨 {t('sc_ed_color')}</span>
          {COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setColorOpen(false) }} aria-label={c}
              className={'w-6 h-6 rounded-full border transition-transform ' + (color === c ? 'ring-2 ring-offset-1 ring-brand-500 scale-110' : 'border-gray-300')}
              style={{ background: c }} />
          ))}
        </div>
      )}

      {tool === 'crop' && <p className="text-xs text-gray-500">✂ {t('sc_ed_crop_hint')}</p>}
      {tool === 'mosaic' && <p className="text-xs text-gray-500">🔲 {t('sc_ed_mosaic_hint')}</p>}

      {/* Per-tool options */}
      {tool === 'arrow' && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1">↗ {t('sc_ed_thickness')}</span>
          {[t('sc_ed_stroke_thin'), t('sc_ed_stroke_normal'), t('sc_ed_stroke_thick')].map((lbl, i) => (
            <button key={i} onClick={() => setStrokeLevel(i)} className={optBtn(strokeLevel === i)}>{lbl}</button>
          ))}
        </div>
      )}
      {tool === 'rect' && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1">▭ {t('sc_ed_shape')}</span>
          <button onClick={() => setShapeKind('rect')} className={optBtn(shapeKind === 'rect')}>▭ {t('sc_ed_shape_rect')}</button>
          <button onClick={() => setShapeKind('ellipse')} className={optBtn(shapeKind === 'ellipse')}>◯ {t('sc_ed_shape_circle')}</button>
        </div>
      )}
      {tool === 'text' && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1">T {t('sc_ed_fontsize')}</span>
          {[t('sc_ed_font_small'), t('sc_ed_font_medium'), t('sc_ed_font_large')].map((lbl, i) => (
            <button key={i} onClick={() => setFontLevel(i)} className={optBtn(fontLevel === i)}>{lbl}</button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div className="text-center">
        <div className="relative inline-block">
          <canvas
            ref={dispRef}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onClick={onClick}
            className={'block mx-auto max-w-full max-h-[60vh] w-auto rounded-xl border border-gray-200 touch-none ' + (tool === 'text' ? 'cursor-text' : 'cursor-crosshair')}
          />
          {editing && (
            <input
              ref={inputRef}
              autoFocus
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setEditing(null) }}
              onBlur={commitText}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              placeholder={t('sc_ed_text_ph')}
              className="absolute -translate-y-1 px-1 py-0.5 border border-brand-400 rounded bg-white/90 text-sm outline-none"
              style={{ left: `${(editing.x / dims.w) * 100}%`, top: `${(editing.y / dims.h) * 100}%`, color }}
            />
          )}
        </div>
      </div>

      {dims.w > 0 && <p className="text-center text-xs text-gray-400">📐 {dims.w} × {dims.h} px</p>}

      {/* Export */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => download('png')} className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">⬇ {t('sc_download_png')}</button>
        <button onClick={() => download('jpg')} className="px-5 py-2 bg-gray-700 text-white text-sm font-semibold rounded-xl hover:bg-gray-600 transition-colors">⬇ {t('sc_download_jpg')}</button>
        <button onClick={copy} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">{copied ? '✓ ' + t('sc_copied') : '📋 ' + t('sc_copy')}</button>
        <button onClick={onRecapture} className="px-5 py-2 bg-brand-50 text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-100 transition-colors">↻ {t('sc_recapture')}</button>
        {timingToggle}
      </div>
      {copyErr && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{t('sc_copyfail')}</p>}
    </div>
  )
}
