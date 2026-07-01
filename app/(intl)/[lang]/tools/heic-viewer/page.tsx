'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'
import { readHeicExif, type Exif } from '@/lib/exif'

const tool = getToolBySlug('heic-viewer')!
const HEIC_RE = /\.(heic|heif)$/i
const isHeic = (f: File) => HEIC_RE.test(f.name) || /hei[cf]/i.test(f.type)
const baseName = (n: string) => n.replace(/\.(heic|heif)$/i, '')
const fmtBytes = (b: number) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(2) + ' MB')
const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const x = new Image(); x.onload = () => res(x); x.onerror = rej; x.src = src })

type Item = { name: string; size: number; url: string; blob: Blob; dims: { w: number; h: number }; exif: Exif }

export default function HeicViewerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const lang = params.lang
  const [items, setItems] = useState<Item[]>([])
  const [idx, setIdx] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [rot, setRot] = useState(0)
  const [showInfo, setShowInfo] = useState(true)
  const [fs, setFs] = useState(false)
  const [prog, setProg] = useState<{ done: number; total: number } | null>(null)
  const [err, setErr] = useState('')
  const [zipping, setZipping] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const cur = items[idx]

  const resetView = useCallback(() => { setZoom(1); setRot(0) }, [])

  const addFiles = useCallback(async (list: FileList | File[] | null) => {
    if (!list) return
    const heics = Array.from(list).filter(isHeic)
    if (!heics.length) { setErr(t('hv_error')); return }
    setErr('')
    setItems((p) => { if (!p.length) trackToolUsed('heic-viewer'); return p })
    setProg({ done: 0, total: heics.length })
    // heic2any bundles libheif — load it once, on demand.
    const heic2any = (await import('heic2any')).default
    for (let i = 0; i < heics.length; i++) {
      const f = heics[i]
      try {
        const out = await heic2any({ blob: f, toType: 'image/jpeg', quality: 0.9 })
        const blob = (Array.isArray(out) ? out[0] : out) as Blob
        const url = URL.createObjectURL(blob)
        const [dimsImg, exif] = await Promise.all([loadImg(url).catch(() => null), readHeicExif(f)])
        const dims = dimsImg ? { w: dimsImg.naturalWidth, h: dimsImg.naturalHeight } : { w: 0, h: 0 }
        setItems((p) => [...p, { name: f.name, size: f.size, url, blob, dims, exif }])
      } catch { /* skip files libheif can't decode */ }
      setProg({ done: i + 1, total: heics.length })
    }
    setProg(null)
  }, [t])

  // Accept files dropped anywhere on the page.
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() }
    const drop = (e: DragEvent) => { const f = e.dataTransfer?.files; if (f && f.length) { e.preventDefault(); addFiles(f) } }
    window.addEventListener('dragover', over); window.addEventListener('drop', drop)
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop) }
  }, [addFiles])

  const go = useCallback((d: number) => {
    const n = items.length
    if (!n) return
    setIdx((i) => (i + d + n) % n)
    resetView()
  }, [items.length, resetView])

  function clearAll() { items.forEach((i) => URL.revokeObjectURL(i.url)); setItems([]); setIdx(0); resetView() }

  // Preview the most-recently-added image (the last one in the list) whenever new files load.
  const prevLen = useRef(0)
  useEffect(() => { if (items.length > prevLen.current) setIdx(items.length - 1); prevLen.current = items.length }, [items.length])

  // Keep active thumbnail in view.
  useEffect(() => { thumbRef.current?.querySelector(`[data-i="${idx}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest' }) }, [idx])

  // Keyboard: arrows / zoom / reset / escape-fullscreen.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!items.length) return
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(8, z + 0.25))
      else if (e.key === '-') setZoom((z) => Math.max(1, z - 0.25))
      else if (e.key === '0') resetView()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [items.length, go, resetView])

  // Fullscreen sync.
  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])
  const toggleFs = () => { if (document.fullscreenElement) document.exitFullscreen(); else viewerRef.current?.requestFullscreen?.() }

  // Save the current image as JPG/PNG, baking in the current rotation.
  async function saveOne(kind: 'jpg' | 'png') {
    if (!cur) return
    try {
      const im = await loadImg(cur.url)
      const deg = ((rot % 360) + 360) % 360, swap = deg % 180 !== 0
      const w = im.naturalWidth, h = im.naturalHeight
      const cw = swap ? h : w, ch = swap ? w : h
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch
      const ctx = cv.getContext('2d'); if (!ctx) return
      const type = kind === 'jpg' ? 'image/jpeg' : 'image/png'
      if (kind === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch) }
      ctx.translate(cw / 2, ch / 2); ctx.rotate((deg * Math.PI) / 180); ctx.drawImage(im, -w / 2, -h / 2)
      cv.toBlob((b) => {
        if (!b) return
        const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${baseName(cur.name)}.${kind}`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000)
        trackToolDownload('heic-viewer', kind)
      }, type, 0.92)
    } catch { /* ignore */ }
  }

  // Convert every loaded HEIC to JPG and download as one zip (blobs are already decoded).
  async function downloadZip() {
    if (!items.length) return
    setZipping(true)
    try {
      const { zipSync } = await import('fflate')
      const data: Record<string, Uint8Array> = {}
      for (const it of items) {
        let name = `${baseName(it.name)}.jpg`, i = 1
        while (name in data) name = `${baseName(it.name)} (${i++}).jpg`
        data[name] = new Uint8Array(await it.blob.arrayBuffer())
      }
      const blob = new Blob([zipSync(data)], { type: 'application/zip' })
      const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = 'heic-converted.zip'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000)
      trackToolDownload('heic-viewer', 'zip')
    } catch { /* ignore */ } finally { setZipping(false) }
  }

  const onTStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTEnd = (e: React.TouchEvent) => {
    if (!touch.current || zoom > 1) return
    const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
    touch.current = null
  }
  const transform = `scale(${zoom}) rotate(${rot}deg)`
  const ctrlBtn = 'p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'

  return (
    <ToolLayout tool={tool} lang={lang}>
      <div ref={viewerRef} className={'flex flex-col gap-2 ' + (fs ? 'fixed inset-0 z-50 bg-gray-900 p-3' : '')}>
        {items.length === 0 ? (
          <div className="space-y-4">
            <div onClick={() => fileRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }} onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
              <p className="text-5xl mb-3">🍏</p>
              <p className="text-base font-medium text-gray-700">{t('hv_drop')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('hv_drop_sub')}</p>
              <div className="flex justify-center mt-4">
                <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
              </div>
            </div>
            {prog && <p className="text-sm text-brand-600 text-center">{t('hv_decoding', { n: prog.done, t: prog.total })}</p>}
            {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{err}</p>}
            {/* Privacy banner — unified with the other image tools */}
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
              <span><b>{t('im_privacy_title')}</b> {t('im_privacy')}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center gap-0.5 flex-wrap rounded-xl bg-gray-100 border border-gray-200 px-2 py-1.5">
              <button className={ctrlBtn} title={t('iv_rotate_l')} aria-label={t('iv_rotate_l')} onClick={() => setRot((r) => r - 90)}><ToolIcon name="rotate-ccw" /></button>
              <button className={ctrlBtn} title={t('iv_rotate_r')} aria-label={t('iv_rotate_r')} onClick={() => setRot((r) => r + 90)}><ToolIcon name="rotate-cw" /></button>
              <span className="w-px h-5 bg-gray-300 mx-1" />
              <button className={ctrlBtn} title={t('iv_zoom_out')} aria-label={t('iv_zoom_out')} onClick={() => setZoom((z) => Math.max(1, z - 0.25))}><ToolIcon name="zoom-out" /></button>
              <span className="text-xs w-12 text-center tabular-nums text-gray-500">{Math.round(zoom * 100)}%</span>
              <button className={ctrlBtn} title={t('iv_zoom_in')} aria-label={t('iv_zoom_in')} onClick={() => setZoom((z) => Math.min(8, z + 0.25))}><ToolIcon name="zoom-in" /></button>
              <button className={ctrlBtn} title={t('iv_fit')} aria-label={t('iv_fit')} onClick={resetView}><ToolIcon name="fit" /></button>
              <span className="w-px h-5 bg-gray-300 mx-1" />
              <button className={ctrlBtn + (showInfo ? ' bg-brand-100 text-brand-600' : '')} title={t('iv_info')} aria-label={t('iv_info')} onClick={() => setShowInfo((s) => !s)}><ToolIcon name="info" /></button>
              <button className={ctrlBtn} title={t('iv_fullscreen')} aria-label={t('iv_fullscreen')} onClick={toggleFs}><ToolIcon name={fs ? 'minimize' : 'maximize'} /></button>
              <button className={ctrlBtn + ' ml-auto'} title={t('iv_newfile')} aria-label={t('iv_newfile')} onClick={() => fileRef.current?.click()}><ToolIcon name="folder" /></button>
              <button className={ctrlBtn} title={t('ui_clear')} aria-label={t('ui_clear')} onClick={clearAll}><ToolIcon name="trash" /></button>
            </div>

            {/* Stage */}
            <div onTouchStart={onTStart} onTouchEnd={onTEnd}
              className={'relative overflow-hidden rounded-xl bg-gray-900 select-none ' + (fs ? 'flex-1' : 'h-[58vh]')}>
              {cur && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cur.url} alt={cur.name} draggable={false} style={{ transform }} className="absolute inset-0 m-auto max-w-full max-h-full object-contain transition-transform" />
              )}
              {items.length > 1 && (
                <>
                  <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center" aria-label={t('iv_prev')}><ToolIcon name="chevron-left" className="w-6 h-6" /></button>
                  <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center" aria-label={t('iv_next')}><ToolIcon name="chevron-right" className="w-6 h-6" /></button>
                </>
              )}
              {showInfo && cur && (
                <div className="absolute top-2 left-2 max-w-[85%] rounded-xl bg-black/70 text-gray-100 text-xs p-3 space-y-1 backdrop-blur">
                  <p className="font-semibold break-all">{cur.name}</p>
                  <p>{t('iv_res')}: {cur.dims.w ? `${cur.dims.w} × ${cur.dims.h}` : '—'}</p>
                  <p>{t('iv_size')}: {fmtBytes(cur.size)}</p>
                  {cur.exif.date && <p>{t('iv_taken')}: {cur.exif.date}</p>}
                  {cur.exif.camera && <p>{t('iv_camera')}: {cur.exif.camera}</p>}
                  {cur.exif.gps && <p>{t('iv_gps')}: <a href={`https://www.google.com/maps?q=${cur.exif.gps}`} target="_blank" rel="noreferrer" className="text-brand-300 hover:underline">{cur.exif.gps}</a></p>}
                </div>
              )}
              {prog && <div className="absolute bottom-2 right-2 rounded-lg bg-black/70 text-white text-xs px-3 py-1.5">{t('hv_decoding', { n: prog.done, t: prog.total })}</div>}
            </div>

            {/* Thumbnail grid — same style as remove-exif */}
            {items.length > 1 && (
              <div ref={thumbRef} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {items.map((im, i) => (
                  <button key={im.url} data-i={i} onClick={() => { setIdx(i); resetView() }}
                    className={'relative aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 transition-colors ' + (i === idx ? 'border-brand-500' : 'border-gray-200 opacity-70 hover:opacity-100')}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.url} alt={im.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Save + count */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => saveOne('jpg')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700"><ToolIcon name="save" className="w-4 h-4" />JPG</button>
              <button onClick={() => saveOne('png')} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100"><ToolIcon name="save" className="w-4 h-4" />PNG</button>
              {items.length > 1 && (
                <button onClick={downloadZip} disabled={zipping} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"><ToolIcon name="archive" className="w-4 h-4" />{zipping ? t('hv_zipping') : t('hv_download_all')}</button>
              )}
              <span className="ml-auto text-xs text-gray-400 tabular-nums">{idx + 1} / {items.length}</span>
            </div>
          </>
        )}
        <input ref={fileRef} type="file" accept=".heic,.heif,image/heic,image/heif" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />

        {/* Cross-link to the converter (distinct keyword: convert vs view) — always a button */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">{t('hv_related')}</span>
          <Link href={`/${lang}/tools/heic-to-jpg`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-brand-300 text-sm font-medium transition-colors">HEIC → JPG</Link>
        </div>
      </div>
    </ToolLayout>
  )
}
