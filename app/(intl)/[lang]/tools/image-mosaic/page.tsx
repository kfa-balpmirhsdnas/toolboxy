'use client'
import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('image-mosaic')!
type Effect = 'mosaic' | 'blur' | 'black'
interface Region { x: number; y: number; w: number; h: number; effect: Effect; intensity: number }
const MAX_DIM = 2000 // cap working resolution for performance; downloads stay sharp

export default function ImageMosaicPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [hasImage, setHasImage] = useState(false)
  const [effect, setEffect] = useState<Effect>('mosaic')
  const [intensity, setIntensity] = useState(40)
  const [format, setFormat] = useState<'png' | 'jpg'>('png')
  const [dragOver, setDragOver] = useState(false)
  const [, bump] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const baseRef = useRef<HTMLCanvasElement | null>(null)  // image only
  const bakedRef = useRef<HTMLCanvasElement | null>(null) // image + committed regions
  const regionsRef = useRef<Region[]>([])
  const dragRef = useRef<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const tracked = useRef(false)

  const newCanvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }

  // Apply one region's effect onto a context (its canvas is also the pixel source).
  const applyEffect = (ctx: CanvasRenderingContext2D, r: Region) => {
    const src = ctx.canvas, W = src.width, H = src.height
    const x = Math.round(r.x), y = Math.round(r.y), w = Math.round(r.w), h = Math.round(r.h)
    if (w < 1 || h < 1) return
    if (r.effect === 'black') { ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h); return }
    if (r.effect === 'mosaic') {
      const block = Math.max(6, Math.round(Math.min(W, H) * 0.0015 * r.intensity + 6))
      const tw = Math.max(1, Math.round(w / block)), th = Math.max(1, Math.round(h / block))
      const tmp = newCanvas(tw, th); const tctx = tmp.getContext('2d')!
      tctx.imageSmoothingEnabled = false
      tctx.drawImage(src, x, y, w, h, 0, 0, tw, th)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(tmp, 0, 0, tw, th, x, y, w, h)
      ctx.imageSmoothingEnabled = true
      return
    }
    // blur — sample with padding so edges blend (no dark halo), then clip to the rect
    const radius = Math.max(2, Math.round(Math.min(W, H) * 0.0008 * r.intensity + 2))
    const p = radius * 3
    const ex = Math.max(0, x - p), ey = Math.max(0, y - p)
    const ew = Math.min(W, x + w + p) - ex, eh = Math.min(H, y + h + p) - ey
    const tmp = newCanvas(ew, eh); const tctx = tmp.getContext('2d')!
    tctx.filter = `blur(${radius}px)`
    tctx.drawImage(src, ex, ey, ew, eh, 0, 0, ew, eh)
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
    ctx.drawImage(tmp, ex, ey)
    ctx.restore()
  }

  const paint = useCallback((live?: { x: number; y: number; w: number; h: number }) => {
    const c = canvasRef.current, baked = bakedRef.current; if (!c || !baked) return
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(baked, 0, 0)
    if (live) {
      const s = c.width / (c.getBoundingClientRect().width || c.width)
      ctx.fillStyle = 'rgba(2,132,199,0.18)'; ctx.fillRect(live.x, live.y, live.w, live.h)
      ctx.lineWidth = 2 * s; ctx.setLineDash([6 * s, 4 * s]); ctx.strokeStyle = '#0284c7'
      ctx.strokeRect(live.x, live.y, live.w, live.h); ctx.setLineDash([])
    }
  }, [])

  const rebuild = useCallback(() => {
    const baked = bakedRef.current, base = baseRef.current; if (!baked || !base) return
    const ctx = baked.getContext('2d')!
    ctx.clearRect(0, 0, baked.width, baked.height); ctx.drawImage(base, 0, 0)
    for (const r of regionsRef.current) applyEffect(ctx, r)
    paint()
  }, [paint])

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight))
      const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale))
      const base = newCanvas(w, h); base.getContext('2d')!.drawImage(img, 0, 0, w, h)
      baseRef.current = base; bakedRef.current = newCanvas(w, h); regionsRef.current = []
      const c = canvasRef.current!; c.width = w; c.height = h
      setHasImage(true); rebuild(); bump((n) => n + 1)
      URL.revokeObjectURL(url)
      if (!tracked.current) { trackToolUsed(tool.slug); tracked.current = true }
    }
    img.src = url
  }

  const toCanvas = (e: React.PointerEvent) => {
    const c = canvasRef.current!, rect = c.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * (c.width / rect.width), y: (e.clientY - rect.top) * (c.height / rect.height) }
  }
  const rectOf = (d: { x0: number; y0: number; x1: number; y1: number }) => ({ x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1), w: Math.abs(d.x1 - d.x0), h: Math.abs(d.y1 - d.y0) })

  const onDown = (e: React.PointerEvent) => { if (!hasImage) return; try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* */ } const p = toCanvas(e); dragRef.current = { x0: p.x, y0: p.y, x1: p.x, y1: p.y } }
  const onMove = (e: React.PointerEvent) => { if (!dragRef.current) return; const p = toCanvas(e); dragRef.current.x1 = p.x; dragRef.current.y1 = p.y; paint(rectOf(dragRef.current)) }
  const onUp = () => {
    const d = dragRef.current; dragRef.current = null; if (!d) return
    const r = rectOf(d)
    if (r.w < 5 || r.h < 5) { paint(); return } // ignore tiny taps
    const region: Region = { ...r, effect, intensity }
    regionsRef.current.push(region)
    applyEffect(bakedRef.current!.getContext('2d')!, region)
    paint(); bump((n) => n + 1)
  }

  const undo = () => { regionsRef.current.pop(); rebuild(); bump((n) => n + 1) }
  const reset = () => { regionsRef.current = []; rebuild(); bump((n) => n + 1) }
  const download = () => {
    const baked = bakedRef.current; if (!baked) return
    baked.toBlob((blob) => { if (!blob) return; const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `masked.${format}`; a.click(); URL.revokeObjectURL(url) }, format === 'jpg' ? 'image/jpeg' : 'image/png', 0.92)
  }

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f) }
  const count = regionsRef.current.length
  const pill = (on: boolean) => `px-3 py-1.5 rounded-full text-sm font-medium border transition ${on ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-2xl mx-auto space-y-4"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}>
        {/* privacy banner — this tool handles sensitive info, so make it loud */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span><b>{t('im_privacy_title')}</b> {t('im_privacy')}</span>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = '' }} />

        {!hasImage && (
          <button onClick={() => fileRef.current?.click()}
            className={`w-full rounded-2xl border-2 border-dashed py-16 px-6 text-center transition ${dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-300 hover:bg-gray-50'}`}>
            <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
            <div className="mt-3 font-semibold text-gray-700">{t('im_upload')}</div>
            <div className="text-sm text-gray-400 mt-1">{t('im_upload_hint')}</div>
          </button>
        )}

        {hasImage && (
          <div className="flex flex-wrap items-center gap-2">
            {(['mosaic', 'blur', 'black'] as Effect[]).map((ef) => (
              <button key={ef} onClick={() => setEffect(ef)} className={pill(effect === ef)}>{t('im_effect_' + ef)}</button>
            ))}
            {effect !== 'black' && (
              <label className="flex items-center gap-2 text-sm text-gray-600 flex-1 min-w-[150px]">{t('im_intensity')}
                <input type="range" min={5} max={100} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="flex-1 accent-brand-600 cursor-pointer" />
              </label>
            )}
          </div>
        )}

        {hasImage && <p className="text-xs text-gray-500">{t('im_drag_hint')}</p>}

        {/* Canvas stays mounted (hidden until an image loads) so the ref is always available. */}
        <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          style={{ touchAction: 'none' }}
          className={`block max-w-full h-auto mx-auto rounded-lg border border-gray-200 cursor-crosshair select-none ${hasImage ? '' : 'hidden'}`} />

        {hasImage && (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={undo} disabled={!count} className="px-3 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">↶ {t('im_undo')}</button>
            <button onClick={reset} disabled={!count} className="px-3 py-2 text-sm text-gray-500 rounded-xl hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed">{t('im_reset')}</button>
            <button onClick={() => fileRef.current?.click()} className="px-3 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">{t('im_change')}</button>
            <div className="ml-auto flex items-center gap-2">
              <select value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpg')} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400">
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
              <button onClick={download} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">⬇ {t('im_download')}</button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center pt-2">{t('im_note')}</p>
      </div>
    </ToolLayout>
  )
}
