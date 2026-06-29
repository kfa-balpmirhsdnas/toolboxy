'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('image-viewer')!
const IMG_RE = /\.(jpe?g|png|gif|webp|bmp|svg|avif|ico|tiff?)$/i
type Img = { file: File; url: string; name: string; size: number }

const fmtBytes = (b: number) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(2) + ' MB')
const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const x = new Image(); x.onload = () => res(x); x.onerror = rej; x.src = src })

// Minimal JPEG EXIF reader — DateTimeOriginal + camera Make/Model (best effort).
async function readExif(file: File): Promise<{ date?: string; camera?: string }> {
  try {
    if (!/jpe?g/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return {}
    const dv = new DataView(await file.slice(0, 131072).arrayBuffer())
    if (dv.getUint16(0) !== 0xffd8) return {}
    let off = 2
    while (off + 4 < dv.byteLength) {
      const marker = dv.getUint16(off)
      if ((marker & 0xff00) !== 0xff00) break
      if (marker === 0xffe1) {
        const seg = off + 4
        if (dv.getUint32(seg) !== 0x45786966) return {} // 'Exif'
        const tiff = seg + 6
        const le = dv.getUint16(tiff) === 0x4949
        const u16 = (o: number) => dv.getUint16(o, le)
        const u32 = (o: number) => dv.getUint32(o, le)
        const ascii = (o: number, c: number) => { let s = ''; for (let i = 0; i < c - 1; i++) { const ch = dv.getUint8(o + i); if (!ch) break; s += String.fromCharCode(ch) } return s.trim() }
        const res: { make?: string; model?: string; date?: string; exif?: number } = {}
        const readIFD = (ifd: number, want: Record<number, 'make' | 'model' | 'date'>) => {
          const n = u16(ifd)
          for (let i = 0; i < n; i++) {
            const e = ifd + 2 + i * 12
            const tag = u16(e), count = u32(e + 4)
            const vOff = count <= 4 ? e + 8 : tiff + u32(e + 8)
            if (want[tag]) res[want[tag]] = ascii(vOff, count)
            if (tag === 0x8769) res.exif = tiff + u32(e + 8)
          }
        }
        readIFD(tiff + u32(tiff + 4), { 0x010f: 'make', 0x0110: 'model' })
        if (res.exif) readIFD(res.exif, { 0x9003: 'date', 0x9004: 'date' })
        const camera = [res.make, res.model].filter(Boolean).join(' ').trim()
        const date = res.date ? res.date.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3') : undefined
        return { date, camera: camera || undefined }
      }
      off += 2 + dv.getUint16(off + 2)
    }
  } catch { /* ignore */ }
  return {}
}

const INTERVALS = [3, 5, 10]

export default function ImageViewerPage() {
  const t = useTranslations('toolui')
  const [images, setImages] = useState<Img[]>([])
  const [idx, setIdx] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [rot, setRot] = useState(0)
  const [flip, setFlip] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const [exif, setExif] = useState<{ date?: string; camera?: string }>({})
  const [playing, setPlaying] = useState(false)
  const [interval, setIntervalSec] = useState(5)
  const [fs, setFs] = useState(false)
  const [fmt, setFmt] = useState<'orig' | 'jpg' | 'png' | 'webp'>('orig')
  const [cropMode, setCropMode] = useState(false)
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [viewMode, setViewMode] = useState<'film' | 'grid'>('film') // film: preview + bottom strip; grid (PC): left thumbnails + right preview/info
  const [saveMenu, setSaveMenu] = useState(false) // save → pick a format popover (replaces the format select + save confirm)
  const cropDrag = useRef<{ x: number; y: number } | null>(null)
  const scrolledOnce = useRef(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const dirRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)

  const cur = images[idx]
  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); setRot(0); setFlip(false) }, [])

  // Open with: load image file(s) the OS launched the installed app with (File Handling API).
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const lq = (window as any).launchQueue
    if (!lq?.setConsumer) return
    lq.setConsumer(async (p: any) => {
      const files: File[] = []
      for (const h of p?.files || []) { try { files.push(await h.getFile()) } catch { /* skip */ } }
      if (files.length) addFiles(files)
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Import images dropped ANYWHERE on the page (a drop outside the box otherwise made the
  // browser open the image). preventDefault on dragover stops that navigation.
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() }
    const drop = (e: DragEvent) => { const fs = e.dataTransfer?.files; if (fs && fs.length) { e.preventDefault(); addFiles(fs) } }
    window.addEventListener('dragover', over); window.addEventListener('drop', drop)
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addFiles(list: FileList | File[] | null) {
    if (!list) return
    const imgs = Array.from(list).filter((f) => f.type.startsWith('image/') || IMG_RE.test(f.name))
    if (!imgs.length) return
    const items = imgs.map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name, size: f.size }))
    setImages((p) => { if (!p.length) trackToolUsed('image-viewer'); return [...p, ...items] })
  }
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async function addEntries(entries: any[]) {
    const out: File[] = []
    const walk = async (en: any) => {
      if (en.isFile) { const f: File = await new Promise((res, rej) => en.file(res, rej)); out.push(f) }
      else if (en.isDirectory) {
        const rd = en.createReader()
        const read = () => new Promise<any[]>((r) => rd.readEntries((e: any[]) => r(e), () => r([])))
        let b = await read(); while (b.length) { for (const c of b) await walk(c); b = await read() }
      }
    }
    for (const e of entries) await walk(e)
    addFiles(out)
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const items = e.dataTransfer.items
    if (items?.length && (items[0] as any).webkitGetAsEntry) {
      const ents: any[] = []
      for (let i = 0; i < items.length; i++) { const en = (items[i] as any).webkitGetAsEntry?.(); if (en) ents.push(en) }
      if (ents.length) { addEntries(ents); return }
    }
    addFiles(e.dataTransfer.files)
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const go = useCallback((d: number) => {
    setIdx((i) => { const n = images.length; return n ? (i + d + n) % n : i })
    if (images.length) resetView()
  }, [images.length, resetView])

  function clearAll() { images.forEach((i) => URL.revokeObjectURL(i.url)); setImages([]); setIdx(0); resetView(); setPlaying(false) }

  // Load dimensions + EXIF for the current image.
  useEffect(() => {
    if (!cur) return
    setDims({ w: 0, h: 0 }); setExif({})
    const im = new Image(); im.onload = () => setDims({ w: im.naturalWidth, h: im.naturalHeight }); im.src = cur.url
    readExif(cur.file).then(setExif)
  }, [cur])

  // Keep the active thumbnail in view.
  useEffect(() => { thumbRef.current?.querySelector(`[data-i="${idx}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest' }) }, [idx])

  // When the first image(s) load, scroll the tool's top edge up to the top of the screen.
  useEffect(() => {
    if (images.length > 0 && !scrolledOnce.current) { scrolledOnce.current = true; requestAnimationFrame(() => viewerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })) }
    if (images.length === 0) scrolledOnce.current = false
  }, [images.length])

  // Keyboard controls.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!images.length) return
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(8, z + 0.25))
      else if (e.key === '-') setZoom((z) => Math.max(1, z - 0.25))
      else if (e.key === '0') resetView()
      else if (e.key === 'Escape') setPlaying(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [images.length, go, resetView])

  // Slideshow.
  useEffect(() => {
    if (!playing || images.length < 2) return
    const id = window.setInterval(() => go(1), interval * 1000)
    return () => window.clearInterval(id)
  }, [playing, interval, images.length, go])

  // Fullscreen state sync.
  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])
  const toggleFs = () => { if (document.fullscreenElement) document.exitFullscreen(); else viewerRef.current?.requestFullscreen?.() }

  // Save the current image. "orig" downloads the file as-is; the others re-encode
  // through a canvas, baking in the current rotation + flip (zoom/pan are view-only).
  async function save(f: 'orig' | 'jpg' | 'png' | 'webp' = fmt) {
    if (!cur) return
    const base = cur.name.replace(/\.[^.]+$/, '') || 'image'
    if (f === 'orig') { const a = document.createElement('a'); a.href = cur.url; a.download = cur.name; a.click(); return }
    try {
      const im = await new Promise<HTMLImageElement>((res, rej) => { const x = new Image(); x.onload = () => res(x); x.onerror = rej; x.src = cur.url })
      const deg = ((rot % 360) + 360) % 360
      const swap = deg % 180 !== 0
      const w = im.naturalWidth, h = im.naturalHeight
      const cw = swap ? h : w, ch = swap ? w : h
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch
      const ctx = cv.getContext('2d'); if (!ctx) return
      const type = f === 'jpg' ? 'image/jpeg' : f === 'webp' ? 'image/webp' : 'image/png'
      if (type === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch) } // JPEG has no alpha
      ctx.translate(cw / 2, ch / 2); ctx.rotate((deg * Math.PI) / 180); ctx.scale(flip ? -1 : 1, 1)
      ctx.drawImage(im, -w / 2, -h / 2)
      cv.toBlob((blob) => {
        if (!blob) return
        const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `${base}.${f}`; a.click()
        setTimeout(() => URL.revokeObjectURL(u), 2000)
      }, type, 0.92)
    } catch { /* ignore */ }
  }

  // Crop: drag a rectangle on the (un-zoomed, un-rotated) image, then save just that region.
  function toggleCrop() { if (cropMode) { setCropMode(false); setCrop(null) } else { resetView(); setCrop(null); setCropMode(true) } }
  const stageXY = (e: React.MouseEvent) => { const r = stageRef.current!.getBoundingClientRect(); return { x: Math.max(0, Math.min(e.clientX - r.left, r.width)), y: Math.max(0, Math.min(e.clientY - r.top, r.height)) } }
  const cropDown = (e: React.MouseEvent) => { const p = stageXY(e); cropDrag.current = p; setCrop({ x: p.x, y: p.y, w: 0, h: 0 }) }
  const cropMove = (e: React.MouseEvent) => { if (!cropDrag.current) return; const p = stageXY(e), s = cropDrag.current; setCrop({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) }) }
  const cropUp = () => { cropDrag.current = null }
  async function cropSave(f: 'orig' | 'jpg' | 'png' | 'webp' = fmt) {
    if (!cur || !crop || crop.w < 6 || crop.h < 6) return
    const sr = stageRef.current!.getBoundingClientRect()
    try {
      const im = await loadImg(cur.url)
      const ar = im.naturalWidth / im.naturalHeight, sar = sr.width / sr.height
      let rw: number, rh: number
      if (ar > sar) { rw = sr.width; rh = sr.width / ar } else { rh = sr.height; rw = sr.height * ar } // object-contain rendered box
      const ox = (sr.width - rw) / 2, oy = (sr.height - rh) / 2, sc = im.naturalWidth / rw
      let sx = (crop.x - ox) * sc, sy = (crop.y - oy) * sc, sw = crop.w * sc, sh = crop.h * sc
      sx = Math.max(0, sx); sy = Math.max(0, sy); sw = Math.min(sw, im.naturalWidth - sx); sh = Math.min(sh, im.naturalHeight - sy)
      if (sw < 1 || sh < 1) return
      const cv = document.createElement('canvas'); cv.width = Math.round(sw); cv.height = Math.round(sh)
      const ctx = cv.getContext('2d'); if (!ctx) return
      const type = f === 'jpg' ? 'image/jpeg' : f === 'webp' ? 'image/webp' : 'image/png'
      if (type === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height) }
      ctx.drawImage(im, sx, sy, sw, sh, 0, 0, cv.width, cv.height)
      const ext = f === 'orig' ? 'png' : f
      cv.toBlob((blob) => { if (!blob) return; const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `${cur.name.replace(/\.[^.]+$/, '') || 'image'}-crop.${ext}`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000) }, type, 0.92)
      setCropMode(false); setCrop(null)
    } catch { /* ignore */ }
  }
  // Save in the chosen format (from the popover), remembering it as the default.
  function doSave(f: 'orig' | 'jpg' | 'png' | 'webp') { setSaveMenu(false); setFmt(f); if (cropMode) cropSave(f); else save(f) }

  // Wheel zoom (centered).
  const onWheel = (e: React.WheelEvent) => { e.preventDefault(); setZoom((z) => Math.min(8, Math.max(1, z + (e.deltaY < 0 ? 0.2 : -0.2)))) }
  // Drag-to-pan (only when zoomed).
  const onDown = (e: React.MouseEvent) => { if (zoom > 1) drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y } }
  const onMove = (e: React.MouseEvent) => { if (drag.current) setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) }) }
  const onUp = () => { drag.current = null }
  // Touch: swipe to change image (when not zoomed).
  const onTStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTEnd = (e: React.TouchEvent) => {
    if (!touch.current || zoom > 1) return
    const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
    touch.current = null
  }

  const tBtn = 'inline-flex items-center justify-center p-2 rounded-lg text-gray-200 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rot}deg) scaleX(${flip ? -1 : 1})`

  const thumbBtn = (im: Img, i: number, sizeCls: string) => (
    <button key={im.url} data-i={i} onClick={() => { setIdx(i); resetView() }}
      className={'rounded-lg overflow-hidden border-2 transition-colors ' + sizeCls + (i === idx ? ' border-brand-500' : ' border-transparent opacity-60 hover:opacity-100')}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={im.url} alt={im.name} className="w-full h-full object-cover" />
    </button>
  )

  // The preview stage (shared by both view modes — only one is mounted at a time, so the ref is unique).
  const renderStage = (heightCls: string) => (
    <div ref={stageRef}
      onWheel={cropMode ? undefined : onWheel}
      onMouseDown={cropMode ? cropDown : onDown} onMouseMove={cropMode ? cropMove : onMove} onMouseUp={cropMode ? cropUp : onUp} onMouseLeave={cropMode ? cropUp : onUp}
      onTouchStart={cropMode ? undefined : onTStart} onTouchEnd={cropMode ? undefined : onTEnd}
      className={'relative overflow-hidden rounded-xl bg-gray-900 select-none ' + heightCls + (cropMode ? ' cursor-crosshair' : zoom > 1 ? ' cursor-grab active:cursor-grabbing' : '')}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cur.url} alt={cur.name} draggable={false} style={{ transform }} className="absolute inset-0 m-auto max-w-full max-h-full object-contain" />
      {cropMode && (
        crop && crop.w > 4 && crop.h > 4
          ? <div className="absolute border-2 border-white/90 pointer-events-none" style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h, boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
          : <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">{t('iv_crop_hint')}</span></div>
      )}
      {images.length > 1 && !cropMode && (
        <>
          <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center" aria-label={t('iv_prev')}><ToolIcon name="chevron-left" className="w-6 h-6" /></button>
          <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center" aria-label={t('iv_next')}><ToolIcon name="chevron-right" className="w-6 h-6" /></button>
        </>
      )}
      {showInfo && (
        <div className="absolute top-2 left-2 max-w-[80%] rounded-xl bg-black/70 text-gray-100 text-xs p-3 space-y-1 backdrop-blur">
          <p className="font-semibold break-all">{cur.name}</p>
          <p>{t('iv_res')}: {dims.w ? `${dims.w} × ${dims.h}` : '—'}</p>
          <p>{t('iv_size')}: {fmtBytes(cur.size)}</p>
          {exif.date && <p>{t('iv_taken')}: {exif.date}</p>}
          {exif.camera && <p>{t('iv_camera')}: {exif.camera}</p>}
        </div>
      )}
    </div>
  )

  return (
    <ToolLayout tool={tool}>
      <div ref={viewerRef} className={'flex flex-col gap-2 ' + (fs ? 'fixed inset-0 z-50 bg-gray-900 p-3' : '')}>
          {/* Toolbar — always visible; dimmed before any image loads to preview the features */}
          <div className={'flex items-center gap-1 flex-wrap rounded-xl bg-gray-800 px-2 py-1.5' + (images.length ? '' : ' opacity-50 pointer-events-none')}>
            <button className={tBtn} title={t('iv_zoom_out')} onClick={() => setZoom((z) => Math.max(1, z - 0.25))}><ToolIcon name="zoom-out" /></button>
            <span className="text-xs text-gray-300 w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <button className={tBtn} title={t('iv_zoom_in')} onClick={() => setZoom((z) => Math.min(8, z + 0.25))}><ToolIcon name="zoom-in" /></button>
            <button className={tBtn} title={t('iv_fit')} onClick={resetView}><ToolIcon name="fit" /></button>
            {/* View mode — PC only (the grid layout needs the width); placed right after zoom */}
            <span className="w-px h-5 bg-white/15 mx-1 hidden md:block" />
            <button className={tBtn + ' hidden md:inline-flex' + (viewMode === 'film' ? ' bg-white/15' : '')} title={t('iv_view_film')} aria-label={t('iv_view_film')} onClick={() => setViewMode('film')}><ToolIcon name="film" /></button>
            <button className={tBtn + ' hidden md:inline-flex' + (viewMode === 'grid' ? ' bg-white/15' : '')} title={t('iv_view_grid')} aria-label={t('iv_view_grid')} onClick={() => setViewMode('grid')}><ToolIcon name="grid" /></button>
            <span className="w-px h-5 bg-white/15 mx-1" />
            <button className={tBtn} title={t('iv_rotate_l')} onClick={() => setRot((r) => r - 90)}><ToolIcon name="rotate-ccw" /></button>
            <button className={tBtn} title={t('iv_rotate_r')} onClick={() => setRot((r) => r + 90)}><ToolIcon name="rotate-cw" /></button>
            <button className={tBtn} title={t('iv_flip')} onClick={() => setFlip((f) => !f)}><ToolIcon name="flip" /></button>
            <button className={tBtn + (cropMode ? ' bg-white/15' : '')} title={t('iv_crop')} onClick={toggleCrop}><ToolIcon name="crop" /></button>
            <span className="w-px h-5 bg-white/15 mx-1" />
            <button className={tBtn + (playing ? ' bg-white/15' : '')} title={t('iv_slideshow')} onClick={() => setPlaying((p) => !p)}><ToolIcon name={playing ? 'pause' : 'play'} /></button>
            <select value={interval} onChange={(e) => setIntervalSec(Number(e.target.value))} className="bg-gray-700 text-gray-200 text-xs rounded-md px-1 py-1 border-0 focus:outline-none">
              {INTERVALS.map((s) => <option key={s} value={s}>{t('iv_sec', { n: s })}</option>)}
            </select>
            <span className="w-px h-5 bg-white/15 mx-1" />
            <button className={tBtn + (showInfo ? ' bg-white/15' : '')} title={t('iv_info')} onClick={() => setShowInfo((s) => !s)}><ToolIcon name="info" /></button>
            <button className={tBtn} title={t('iv_fullscreen')} onClick={toggleFs}><ToolIcon name={fs ? 'minimize' : 'maximize'} /></button>
            <span className="w-px h-5 bg-white/15 mx-1" />
            {/* Save → pick a format */}
            <div className="relative">
              <button className={tBtn} title={cropMode ? t('iv_save_crop') : t('iv_save')} aria-label={t('iv_save')} onClick={() => setSaveMenu((s) => !s)}><ToolIcon name="save" /></button>
              {saveMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setSaveMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-30 min-w-[124px] rounded-lg border border-white/10 bg-gray-800 p-1 shadow-xl">
                    <p className="px-2 py-1 text-[11px] text-gray-400">{t('iv_save_as')}</p>
                    {([['orig', t('iv_orig')], ['jpg', 'JPG'], ['png', 'PNG'], ['webp', 'WebP']] as const).map(([f, label]) => (
                      <button key={f} onClick={() => doSave(f)} className={'block w-full rounded px-2 py-1.5 text-left text-xs text-gray-200 hover:bg-white/15' + (fmt === f ? ' bg-white/10' : '')}>{label}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className={tBtn} title={t('iv_newfile')} aria-label={t('iv_newfile')} onClick={() => { if (images.length === 0 || window.confirm(t('iv_newfile_confirm'))) { clearAll(); fileRef.current?.click() } }}><ToolIcon name="folder" /></button>
            <span className="ml-auto text-xs text-gray-400 tabular-nums px-1">{idx + 1} / {images.length}</span>
          </div>

          {images.length > 0 ? (
            viewMode === 'grid' ? (
            /* 썸네일 보기 (PC) — left thumbnail grid, right preview + info; stacks on mobile */
            <div className={'flex flex-col md:flex-row gap-2 ' + (fs ? 'flex-1' : 'md:h-[58vh]')}>
              <div ref={thumbRef} className="order-2 md:order-1 md:w-44 md:shrink-0 md:h-full flex md:grid md:grid-cols-2 gap-1.5 md:content-start overflow-x-auto md:overflow-y-auto rounded-xl bg-gray-100 p-2">
                {images.map((im, i) => thumbBtn(im, i, 'shrink-0 w-16 h-16 md:w-full md:h-auto md:aspect-square'))}
              </div>
              <div className="order-1 md:order-2 flex-1 flex flex-col gap-2 min-w-0 min-h-0">
                {renderStage(fs ? 'flex-1' : 'flex-1 min-h-[44vh] md:min-h-0')}
                <div className="hidden md:block shrink-0 rounded-xl bg-gray-100 p-3 text-xs text-gray-600 space-y-0.5">
                  <p className="font-semibold text-gray-800 break-all">{cur.name}</p>
                  <p>{t('iv_res')}: {dims.w ? `${dims.w} × ${dims.h}` : '—'}</p>
                  <p>{t('iv_size')}: {fmtBytes(cur.size)}</p>
                  {exif.date && <p>{t('iv_taken')}: {exif.date}</p>}
                  {exif.camera && <p>{t('iv_camera')}: {exif.camera}</p>}
                </div>
              </div>
            </div>
            ) : (
            /* 필름 보기 — preview on top, thumbnail strip at the bottom */
            <>
              {renderStage(fs ? 'flex-1' : 'h-[58vh]')}
              {images.length > 1 && (
                <div ref={thumbRef} className="flex gap-1.5 overflow-x-auto py-1">
                  {images.map((im, i) => thumbBtn(im, i, 'shrink-0 w-16 h-16'))}
                </div>
              )}
            </>
            )
          ) : (
            /* Drop zone — shown until images are added */
            <div className="space-y-4 pt-1">
              <div onClick={() => fileRef.current?.click()} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
                <p className="text-5xl mb-3">🖼️</p>
                <p className="text-base font-medium text-gray-700">{t('iv_drop')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('iv_drop_sub')}</p>
                <div className="flex gap-2 justify-center mt-4">
                  <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('iv_pick_files')}</button>
                  <button onClick={(e) => { e.stopPropagation(); dirRef.current?.click() }} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">{t('iv_pick_folder')}</button>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {['iv_badge_noinstall', 'iv_badge_free', 'iv_badge_private'].map((b) => (
                  <span key={b} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">✓ {t(b)}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* File inputs — always mounted so toolbar + drop zone can open them */}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <input ref={dirRef} type="file" className="hidden" {...({ webkitdirectory: '', directory: '' } as any)} onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
    </ToolLayout>
  )
}
