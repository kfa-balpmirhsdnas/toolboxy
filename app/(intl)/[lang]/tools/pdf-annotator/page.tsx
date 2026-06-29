'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const tool = getToolBySlug('pdf-annotator')!
const WORKER = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs'
const COLORS = ['#ef4444', '#f59e0b', '#fde047', '#22c55e', '#3b82f6', '#111827']
const COLOR_LABEL: Record<string, string> = { '#ef4444': '🔴', '#f59e0b': '🟠', '#fde047': '🟡', '#22c55e': '🟢', '#3b82f6': '🔵', '#111827': '⚫' }
const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]
const WIDTHS = [2, 4, 8]
const EXPORT_SCALE = 2

type Pt = { x: number; y: number }
type Anno = {
  id: number; page: number; type: string; color: string; width: number
  pts?: Pt[]; x1?: number; y1?: number; x2?: number; y2?: number
  x?: number; y?: number; w?: number; h?: number; text?: string; size?: number
}

// Draw one annotation onto a 2D canvas. Coords are in PDF points; `s` scales to pixels.
function drawAnno(ctx: CanvasRenderingContext2D, a: Anno, s: number) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 1
  ctx.strokeStyle = a.color; ctx.fillStyle = a.color; ctx.lineWidth = a.width * s
  if (a.type === 'pen' || a.type === 'highlight') {
    if (a.type === 'highlight') ctx.globalAlpha = 0.35
    ctx.beginPath()
    ;(a.pts || []).forEach((p, i) => (i ? ctx.lineTo(p.x * s, p.y * s) : ctx.moveTo(p.x * s, p.y * s)))
    ctx.stroke(); ctx.globalAlpha = 1
  } else if (a.type === 'underline' || a.type === 'strike' || a.type === 'arrow') {
    ctx.beginPath(); ctx.moveTo((a.x1 || 0) * s, (a.y1 || 0) * s); ctx.lineTo((a.x2 || 0) * s, (a.y2 || 0) * s); ctx.stroke()
    if (a.type === 'arrow') {
      const ang = Math.atan2((a.y2 || 0) - (a.y1 || 0), (a.x2 || 0) - (a.x1 || 0)); const hl = 12 * s
      const ex = (a.x2 || 0) * s, ey = (a.y2 || 0) * s
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang - Math.PI / 6), ey - hl * Math.sin(ang - Math.PI / 6))
      ctx.moveTo(ex, ey); ctx.lineTo(ex - hl * Math.cos(ang + Math.PI / 6), ey - hl * Math.sin(ang + Math.PI / 6)); ctx.stroke()
    }
  } else if (a.type === 'rect') {
    ctx.strokeRect((a.x || 0) * s, (a.y || 0) * s, (a.w || 0) * s, (a.h || 0) * s)
  } else if (a.type === 'text') {
    ctx.font = `${(a.size || 16) * s}px sans-serif`; ctx.textBaseline = 'top'
    ;(a.text || '').split('\n').forEach((line, i) => ctx.fillText(line, (a.x || 0) * s, (a.y || 0) * s + i * (a.size || 16) * s * 1.2))
  }
}

export default function PdfAnnotatorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.3)
  const [tool_, setTool] = useState('highlight')
  const [color, setColor] = useState('#fde047')
  const [penW, setPenW] = useState(4)
  const [annos, setAnnos] = useState<Anno[]>([])
  const [thumbs, setThumbs] = useState<string[]>([])
  const [showThumbs, setShowThumbs] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [showPenTools, setShowPenTools] = useState(false) // annotation-tool palette toggled by the "pen tools" button
  const [wOpen, setWOpen] = useState(false) // stroke-width dropdown (shows line-thickness images)
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<number[]>([])
  const [matchIdx, setMatchIdx] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [fileName, setFileName] = useState('annotated')

  const pdfRef = useRef<{ numPages: number; getPage: (n: number) => Promise<{ getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: unknown) => { promise: Promise<void> }; getTextContent: () => Promise<{ items: { str: string }[] }> }> } | null>(null)
  const origBytes = useRef<Uint8Array | null>(null)
  const pdfCanvas = useRef<HTMLCanvasElement>(null)
  const annoCanvas = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null) // whole tool — fullscreen target so page nav etc. stay usable
  const fileInput = useRef<HTMLInputElement>(null)
  const dims = useRef<Record<number, { w: number; h: number }>>({})
  const pageText = useRef<string[]>([])
  const drawing = useRef(false)
  const draftRef = useRef<Anno | null>(null)
  const renderTok = useRef(0)

  const idRef = useRef(1)
  const annosRef = useRef<Anno[]>([]); annosRef.current = annos

  async function openFile(f: File) {
    if (!f) return
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) { setStatus('error'); return } // not a PDF → show the error instead of doing nothing
    setStatus('loading'); setFileName(f.name.replace(/\.pdf$/i, '') || 'annotated')
    try {
      const buf = await f.arrayBuffer()
      const u8 = new Uint8Array(buf)
      origBytes.current = u8.slice()
      const pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = WORKER
      const pdf = await pdfjs.getDocument({ data: u8 }).promise
      pdfRef.current = pdf as never
      dims.current = {}; pageText.current = []
      setNumPages(pdf.numPages); setPage(1); setAnnos([]); setThumbs([]); setMatches([]); setQuery('')
      setStatus('ready')
    } catch (e) { console.error(e); setStatus('error') }
  }

  // Render the current page + size the annotation canvas.
  const renderPage = useCallback(async (n: number, sc: number) => {
    const pdf = pdfRef.current; if (!pdf || !pdfCanvas.current) return
    const tok = ++renderTok.current
    const pg = await pdf.getPage(n)
    const vp1 = pg.getViewport({ scale: 1 }); dims.current[n] = { w: vp1.width, h: vp1.height }
    const vp = pg.getViewport({ scale: sc })
    if (tok !== renderTok.current) return
    const c = pdfCanvas.current; c.width = vp.width; c.height = vp.height
    await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise
    const ac = annoCanvas.current; if (ac) { ac.width = vp.width; ac.height = vp.height }
    drawAll(n, sc)
  }, [])

  const drawAll = useCallback((n: number, sc: number) => {
    const ac = annoCanvas.current; if (!ac) return
    const ctx = ac.getContext('2d'); if (!ctx) return
    ctx.clearRect(0, 0, ac.width, ac.height)
    for (const a of annosRef.current) if (a.page === n) drawAnno(ctx, a, sc)
    if (draftRef.current && draftRef.current.page === n) drawAnno(ctx, draftRef.current, sc)
  }, [])

  // Open with: open the PDF the OS launched the installed app with (File Handling API).
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const lq = (window as any).launchQueue
    if (!lq?.setConsumer) return
    lq.setConsumer(async (p: any) => { const h = p?.files?.[0]; if (!h) return; try { openFile(await h.getFile()) } catch { /* skip */ } })
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // On load, default the zoom so the page fits the viewer width (PC + mobile).
  useEffect(() => {
    if (status !== 'ready' || !pdfRef.current) return
    let cancel = false
    ;(async () => {
      try {
        const pg = await pdfRef.current!.getPage(1)
        const vp = pg.getViewport({ scale: 1 })
        if (cancel) return
        const avail = (stageRef.current?.clientWidth || 720) - 52 // p-4 padding (32) + vertical scrollbar (~16) + buffer
        // floor (not round) so the page is never wider than the viewer → no horizontal scroll
        setScale(Math.max(0.4, Math.min(3, Math.floor((avail / vp.width) * 100) / 100)))
      } catch { /* keep default */ }
    })()
    return () => { cancel = true }
  }, [status])

  // Import a PDF dropped ANYWHERE on the page (the small drop box alone made dropping
  // elsewhere open the PDF in the browser instead). preventDefault stops that navigation.
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() }
    const drop = (e: DragEvent) => { const f = e.dataTransfer?.files?.[0]; if (f) { e.preventDefault(); openFile(f) } }
    window.addEventListener('dragover', over); window.addEventListener('drop', drop)
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (status === 'ready') renderPage(page, scale) }, [status, page, scale, renderPage])
  useEffect(() => { if (status === 'ready') drawAll(page, scale) }, [annos, page, scale, status, drawAll])

  // Progressive thumbnails.
  useEffect(() => {
    if (status !== 'ready') return
    let cancel = false
    ;(async () => {
      const pdf = pdfRef.current!; const out: string[] = []
      for (let i = 1; i <= numPages && !cancel; i++) {
        const pg = await pdf.getPage(i); const vp = pg.getViewport({ scale: 0.25 })
        const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height
        await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise
        out.push(c.toDataURL('image/png')); if (!cancel) setThumbs([...out])
      }
    })()
    return () => { cancel = true }
  }, [status, numPages])

  // Extract text for search.
  useEffect(() => {
    if (status !== 'ready') return
    let cancel = false
    ;(async () => {
      const pdf = pdfRef.current!; const txt: string[] = []
      for (let i = 1; i <= numPages && !cancel; i++) { const pg = await pdf.getPage(i); const tc = await pg.getTextContent(); txt[i] = tc.items.map((it) => it.str).join(' ') }
      pageText.current = txt
    })()
    return () => { cancel = true }
  }, [status, numPages])

  function runSearch(q: string) {
    setQuery(q)
    const s = q.trim().toLowerCase()
    if (!s) { setMatches([]); return }
    const m: number[] = []
    for (let i = 1; i <= numPages; i++) if ((pageText.current[i] || '').toLowerCase().includes(s)) m.push(i)
    setMatches(m); setMatchIdx(0); if (m.length) setPage(m[0])
  }
  function jumpMatch(d: number) { if (!matches.length) return; const i = (matchIdx + d + matches.length) % matches.length; setMatchIdx(i); setPage(matches[i]) }

  // Pointer drawing
  function pt(e: React.PointerEvent): Pt { const r = annoCanvas.current!.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale } }
  function onDown(e: React.PointerEvent) {
    if (tool_ === 'pan') return
    e.preventDefault(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    const p = pt(e)
    if (tool_ === 'text') {
      const txt = window.prompt(t('pa_textprompt')); if (!txt) return
      setAnnos((a) => [...a, { id: idRef.current++, page, type: 'text', color, width: 1, x: p.x, y: p.y, text: txt, size: 16 }]); return
    }
    drawing.current = true
    const base = { id: idRef.current++, page, color, width: tool_ === 'highlight' ? 14 : penW }
    if (tool_ === 'pen' || tool_ === 'highlight') draftRef.current = { ...base, type: tool_, pts: [p] }
    else if (tool_ === 'rect') draftRef.current = { ...base, type: 'rect', x: p.x, y: p.y, w: 0, h: 0 }
    else draftRef.current = { ...base, type: tool_, x1: p.x, y1: p.y, x2: p.x, y2: p.y }
    drawAll(page, scale)
  }
  function onMove(e: React.PointerEvent) {
    if (!drawing.current || !draftRef.current) return
    const p = pt(e); const d = draftRef.current
    if (d.type === 'pen' || d.type === 'highlight') d.pts!.push(p)
    else if (d.type === 'rect') { d.w = p.x - (d.x || 0); d.h = p.y - (d.y || 0) }
    else { d.x2 = p.x; d.y2 = p.y }
    drawAll(page, scale)
  }
  function onUp() {
    if (!drawing.current) return
    drawing.current = false
    const d = draftRef.current; draftRef.current = null
    if (d) {
      // ignore zero-size shapes/dots
      const tiny = (d.type === 'rect' && Math.abs(d.w || 0) < 3 && Math.abs(d.h || 0) < 3) ||
        ((d.type === 'pen' || d.type === 'highlight') && (d.pts?.length || 0) < 2)
      if (!tiny) setAnnos((a) => [...a, d])
    }
    drawAll(page, scale)
  }

  function undo() { setAnnos((a) => a.slice(0, -1)) }
  function clearPage() { setAnnos((a) => a.filter((x) => x.page !== page)) }

  async function download() {
    if (!origBytes.current) return
    setExporting(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.load(origBytes.current)
      const pages = doc.getPages()
      const byPage: Record<number, Anno[]> = {}
      for (const a of annos) (byPage[a.page] = byPage[a.page] || []).push(a)
      for (const k of Object.keys(byPage)) {
        const pn = +k; const pl = pages[pn - 1]; if (!pl) continue
        let d = dims.current[pn]
        if (!d) { const pg = await pdfRef.current!.getPage(pn); const vp = pg.getViewport({ scale: 1 }); d = { w: vp.width, h: vp.height } }
        const c = document.createElement('canvas'); c.width = Math.round(d.w * EXPORT_SCALE); c.height = Math.round(d.h * EXPORT_SCALE)
        const ctx = c.getContext('2d')!; for (const a of byPage[pn]) drawAnno(ctx, a, EXPORT_SCALE)
        const png = await doc.embedPng(c.toDataURL('image/png'))
        pl.drawImage(png, { x: 0, y: 0, width: pl.getWidth(), height: pl.getHeight() })
      }
      const bytes = await doc.save()
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
      a.download = `${fileName}-annotated.pdf`; a.click()
    } catch (e) { console.error(e); alert(t('pa_error')) } finally { setExporting(false) }
  }

  const TOOLS: [string, string][] = [['highlight', '🖍️'], ['pen', '✏️'], ['underline', 'U̲'], ['strike', 'S̶'], ['rect', '▭'], ['arrow', '↗'], ['text', '🅰'], ['pan', '✋']]
  const DRAW_TOOLS = TOOLS.filter(([k]) => k !== 'pan') // shown in the toggled pen-tools palette
  const activeDrawIcon = DRAW_TOOLS.find(([k]) => k === tool_)?.[1] ?? '🖍️' // the pen-tools toggle mirrors the active drawing tool

  if (status === 'idle' || status === 'loading' || status === 'error') {
    return (
      <ToolLayout tool={tool} lang={params.lang}>
        <div className="max-w-xl mx-auto space-y-3">
          <div onClick={() => fileInput.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && openFile(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <div className="text-4xl mb-3">📄✍️</div>
            <p className="font-medium text-gray-700">{t('pa_open')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('pa_drop')}</p>
            {status === 'loading' && <p className="text-sm text-brand-600 mt-3 animate-pulse">{t('pa_loading')}</p>}
            {status === 'error' && <p className="text-sm text-red-500 mt-3">{t('pa_error')}</p>}
          </div>
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">🔒 {t('pa_local')}</p>
          <input ref={fileInput} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.currentTarget.value = ''; if (f) openFile(f) }} />
        </div>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div ref={wrapRef} className="space-y-3 bg-white overflow-auto">
        {/* Top toolbar: thumbnails · pen-tools toggle · move · undo · clear · zoom · fullscreen · find */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-2">
          <button onClick={() => setShowThumbs((s) => !s)} title={t('pa_thumbs')} aria-label={t('pa_thumbs')} className={'w-9 h-9 rounded-lg ' + (showThumbs ? 'bg-brand-100 text-brand-700' : 'bg-white border border-gray-200 hover:bg-gray-100')}>◧</button>
          <span className="w-px h-6 bg-gray-300 mx-0.5" />
          {/* Pen tools — opens the annotation palette below; mirrors the active drawing tool */}
          <button onClick={() => setShowPenTools((s) => !s)} title={t('pa_pentools')} aria-label={t('pa_pentools')}
            className={'h-9 px-2 rounded-lg text-sm flex items-center gap-1 ' + (showPenTools ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-100')}>{activeDrawIcon}<span className="text-xs">{showPenTools ? '▲' : '▼'}</span></button>
          <button onClick={() => setTool('pan')} title={t('pa_pan')} aria-label={t('pa_pan')} className={'w-9 h-9 rounded-lg text-sm ' + (tool_ === 'pan' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-100')}>✋</button>
          <span className="w-px h-6 bg-gray-300 mx-0.5" />
          <button onClick={undo} title={t('pa_undo')} aria-label={t('pa_undo')} className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-base hover:bg-gray-100">↩</button>
          <button onClick={clearPage} title={t('pa_clear')} aria-label={t('pa_clear')} className="w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-700" aria-hidden="true">
              <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7" /><path d="m5 11 9 9" />
            </svg>
          </button>
          <span className="w-px h-6 bg-gray-300 mx-0.5" />
          <select value={String(scale)} onChange={(e) => setScale(+e.target.value)} title={t('pa_zoom')} aria-label={t('pa_zoom')}
            className="h-9 rounded-lg border border-gray-200 bg-white px-1.5 text-sm">
            {(ZOOMS.includes(scale) ? ZOOMS : [scale, ...ZOOMS]).sort((a, b) => a - b).map((z) => <option key={z} value={z}>{Math.round(z * 100)}%</option>)}
          </select>
          <button onClick={() => wrapRef.current?.requestFullscreen?.()} title={t('pa_fullscreen')} className="w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-100">⛶</button>
          <button onClick={() => setShowSearch((s) => !s)} title={t('pa_search')} aria-label={t('pa_search')} className={'w-9 h-9 rounded-lg ' + (showSearch ? 'bg-brand-100 text-brand-700' : 'bg-white border border-gray-200 hover:bg-gray-100')}>🔍</button>
        </div>

        {/* Pen-tools palette — revealed by the pen-tools button: drawing tools + colour + width */}
        {showPenTools && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-2">
            {DRAW_TOOLS.map(([k, icon]) => (
              <button key={k} title={t('pa_' + k)} onClick={() => setTool(k)}
                className={'w-9 h-9 rounded-lg text-sm font-bold ' + (tool_ === k ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100')}>{icon}</button>
            ))}
            <span className="w-px h-6 bg-gray-300 mx-0.5" />
            <select value={color} onChange={(e) => setColor(e.target.value)} title={t('pa_color')} aria-label={t('pa_color')}
              className="h-9 rounded-lg border border-gray-200 bg-white px-1.5 text-sm">
              {COLORS.map((c) => <option key={c} value={c}>{COLOR_LABEL[c]}</option>)}
            </select>
            {/* Stroke width — dropdown showing the actual line thickness as images */}
            <div className="relative">
              {wOpen && <div className="fixed inset-0 z-10" onClick={() => setWOpen(false)} />}
              <button onClick={() => setWOpen((o) => !o)} title={t('pa_width')} aria-label={t('pa_width')}
                className="h-9 px-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center gap-1.5">
                <span style={{ width: 20, height: penW, borderRadius: 9999, background: '#374151', display: 'block' }} />
                <span className="text-xs text-gray-400">▼</span>
              </button>
              {wOpen && (
                <div className="absolute z-20 mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-1 space-y-1">
                  {WIDTHS.map((w) => (
                    <button key={w} onClick={() => { setPenW(w); setWOpen(false) }}
                      className={'flex items-center justify-center w-16 h-8 rounded ' + (penW === w ? 'bg-brand-50' : 'hover:bg-gray-100')}>
                      <span style={{ width: 34, height: w, borderRadius: 9999, background: '#374151', display: 'block' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thumbnails on top (mobile) / left column (desktop) */}
        <div className="flex flex-col md:flex-row gap-3">
          {showThumbs && (
            <div className="flex md:block gap-2 md:space-y-2 shrink-0 w-full md:w-28 overflow-x-auto md:overflow-x-visible md:max-h-[70vh] md:overflow-y-auto pb-1 md:pb-0 md:pr-1">
              {thumbs.map((src, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={'block shrink-0 w-16 md:w-full rounded border-2 ' + (page === i + 1 ? 'border-brand-500' : 'border-gray-200')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`p${i + 1}`} className="w-full" />
                  <span className="block text-[10px] text-gray-500">{i + 1}</span>
                </button>
              ))}
            </div>
          )}
          {/* Page stage */}
          <div ref={stageRef} className="flex-1 overflow-auto bg-gray-100 rounded-xl p-4 flex justify-center max-h-[56vh] md:max-h-[78vh]">
            <div className="relative shadow-lg" style={{ width: 'fit-content', height: 'fit-content' }}>
              <canvas ref={pdfCanvas} className="block" />
              <canvas ref={annoCanvas} className="absolute inset-0" style={{ touchAction: 'none', cursor: tool_ === 'pan' ? 'grab' : 'crosshair' }}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} />
            </div>
          </div>
        </div>

        {/* Bottom bar — page navigation + download + new file */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} title={t('pa_page')} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">◀</button>
          <span className="tabular-nums"><input type="number" min={1} max={numPages} value={page} onChange={(e) => setPage(Math.min(numPages, Math.max(1, +e.target.value || 1)))} className="w-10 text-center border border-gray-300 rounded px-1 py-0.5" /> / {numPages}</span>
          <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} title={t('pa_page')} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">▶</button>
          <button onClick={download} disabled={exporting} className="ml-auto px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60">{exporting ? t('pa_exporting') : '⬇ ' + t('pa_download')}</button>
          <button onClick={() => { setStatus('idle'); pdfRef.current = null }} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">{t('pa_newfile')}</button>
        </div>

        {/* Find bar (editor-style: toggled by the 🔍 button, sits at the bottom) */}
        {showSearch && (
          <div className="flex items-center gap-2 text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <input autoFocus value={query} onChange={(e) => runSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') jumpMatch(e.shiftKey ? -1 : 1); if (e.key === 'Escape') setShowSearch(false) }}
              placeholder={t('pa_search')} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-400" />
            {query && (matches.length ? (
              <span className="flex items-center gap-1 text-gray-500 shrink-0">
                <button onClick={() => jumpMatch(-1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">‹</button>
                {matchIdx + 1}/{matches.length}
                <button onClick={() => jumpMatch(1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">›</button>
              </span>
            ) : <span className="text-gray-400 shrink-0">{t('pa_nomatch')}</span>)}
            <button onClick={() => setShowSearch(false)} aria-label="close" className="text-gray-400 hover:text-gray-700 text-lg leading-none px-1 shrink-0">×</button>
          </div>
        )}

        <p className="text-xs text-emerald-700 text-center">🔒 {t('pa_local')}</p>
      </div>
    </ToolLayout>
  )
}
