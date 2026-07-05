'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import ColorSwatchSelect from '@/components/tools/ColorSwatchSelect'
import { getToolBySlug } from '@/lib/tools/registry'
import { useSharedFile } from '@/lib/tools/useSharedFile'

const tool = getToolBySlug('pdf-annotator')!
const WORKER = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs'
const COLORS = ['#ef4444', '#f59e0b', '#fde047', '#22c55e', '#3b82f6', '#111827']
const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]
const WIDTHS = [1, 2, 4, 8, 14]
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
  if (a.type === 'pen' || a.type === 'freehand') {
    ctx.beginPath()
    ;(a.pts || []).forEach((p, i) => (i ? ctx.lineTo(p.x * s, p.y * s) : ctx.moveTo(p.x * s, p.y * s)))
    ctx.stroke()
  } else if (a.type === 'underline' || a.type === 'strike' || a.type === 'arrow' || a.type === 'line' || a.type === 'highlight') {
    if (a.type === 'highlight') ctx.globalAlpha = 0.35 // semi-transparent thick horizontal stroke
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
  const [scale, setScale] = useState(0) // 0 = fit-to-width pending; the page isn't rendered until the fit scale is set (avoids a brief zoomed first render)
  const [tool_, setTool] = useState('highlight')
  const lastDraw = useRef('highlight') // remembers the active drawing tool so the pen button can restore it after pan
  const [saveDialog, setSaveDialog] = useState(false) // filename prompt before exporting the annotated PDF
  const [saveName, setSaveName] = useState('')
  const [captureMsg, setCaptureMsg] = useState('') // brief toast after a screen capture (clipboard / saved)
  const [color, setColor] = useState('#ef4444') // red by default
  const [penW, setPenW] = useState(4)
  const [annos, setAnnos] = useState<Anno[]>([])
  const [thumbs, setThumbs] = useState<string[]>([])
  const [showThumbs, setShowThumbs] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [showPenTools, setShowPenTools] = useState(false) // annotation-tool palette toggled by the "pen tools" button
  const [wOpen, setWOpen] = useState(false) // stroke-width dropdown (shows line-thickness images)
  const [textEdit, setTextEdit] = useState<{ x: number; y: number; val: string } | null>(null) // inline text-note input
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<number[]>([])
  const [matchIdx, setMatchIdx] = useState(0)
  const [searchHits, setSearchHits] = useState<{ x: number; y: number; w: number; h: number }[]>([]) // current-page search highlights (scale-1 coords)
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
  const flipLock = useRef(0) // cooldown so one wheel/swipe past a page edge flips only once
  const flipPending = useRef<'top' | 'bottom' | null>(null) // where to land after a page flip (next→top, prev→bottom)

  const idRef = useRef(1)
  const annosRef = useRef<Anno[]>([]); annosRef.current = annos
  const searchHitsRef = useRef<{ x: number; y: number; w: number; h: number }[]>([]); searchHitsRef.current = searchHits

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
      setScale(0) // re-fit this file from scratch (the fit effect sets the real scale on ready)
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
    // Size BOTH canvases together (before the async render) so the overlay can never end up
    // a different size than the page — a stale render already bailed at the check above.
    const c = pdfCanvas.current; c.width = vp.width; c.height = vp.height
    const ac = annoCanvas.current; if (ac) { ac.width = vp.width; ac.height = vp.height }
    await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise
    if (tok !== renderTok.current) return
    drawAll(n, sc)
    // continuous scroll: after a page flip, land at the top (next page) or bottom (prev page)
    const fp = flipPending.current; flipPending.current = null
    if (fp && stageRef.current) stageRef.current.scrollTop = fp === 'bottom' ? stageRef.current.scrollHeight : 0
  }, [])

  const drawAll = useCallback((n: number, sc: number) => {
    const ac = annoCanvas.current; if (!ac) return
    const ctx = ac.getContext('2d'); if (!ctx) return
    ctx.clearRect(0, 0, ac.width, ac.height)
    // search highlights (under the annotations); transient, never saved/exported
    if (searchHitsRef.current.length) { ctx.save(); ctx.fillStyle = 'rgba(250,204,21,.45)'; for (const h of searchHitsRef.current) ctx.fillRect(h.x * sc, h.y * sc, h.w * sc, h.h * sc); ctx.restore() }
    for (const a of annosRef.current) if (a.page === n) drawAnno(ctx, a, sc)
    const dr = draftRef.current
    if (dr && dr.page === n) {
      if (dr.type === 'capture') { // dashed marquee for the capture selection (not an annotation)
        const x = Math.min(dr.x || 0, (dr.x || 0) + (dr.w || 0)) * sc, y = Math.min(dr.y || 0, (dr.y || 0) + (dr.h || 0)) * sc
        const w = Math.abs(dr.w || 0) * sc, h = Math.abs(dr.h || 0) * sc
        ctx.save(); ctx.fillStyle = 'rgba(37,99,235,.12)'; ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4])
        ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.restore()
      } else drawAnno(ctx, dr, sc)
    }
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

  // Android "Share → ToolBoxy PDF Annotator": open the shared PDF.
  useSharedFile(openFile)

  // On load, default the zoom so the page fits the viewer width (PC + mobile).
  useEffect(() => {
    if (status !== 'ready' || !pdfRef.current) return
    let cancel = false
    ;(async () => {
      try {
        const pg = await pdfRef.current!.getPage(1)
        const vp = pg.getViewport({ scale: 1 })
        if (cancel) return
        const avail = (stageRef.current?.clientWidth || 720) - 34 // p-2 padding (16) + vertical scrollbar (~18) — fills the width
        // floor (not round) so the page is never wider than the viewer → no horizontal scroll
        setScale(Math.max(0.4, Math.min(3, Math.floor((avail / vp.width) * 100) / 100)))
        if (stageRef.current) stageRef.current.scrollTop = 0 // editor-style: start at the top of the page
        // After a file opens, scroll the tool card (its top line) into view. The card carries
        // scroll-mt-20, so it lands just under the sticky header instead of behind it.
        requestAnimationFrame(() => (wrapRef.current?.closest('.bg-white.rounded-2xl') as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      } catch { setScale(1) /* fall back so the page still renders */ }
    })()
    return () => { cancel = true }
  }, [status])

  // Continuous-scroll feel: scrolling past the bottom edge flips to the next page (landing
  // at its top), past the top edge flips to the previous page (landing at its bottom).
  // Wheel works for any tool; touch-swipe only with the pan tool (drawing tools use touch).
  useEffect(() => {
    const el = stageRef.current
    if (!el || status !== 'ready') return
    const EDGE = 2, COOL = 500
    const flip = (dir: 1 | -1) => {
      const now = Date.now(); if (now - flipLock.current < COOL) return
      const np = page + dir; if (np < 1 || np > numPages) return
      flipLock.current = now
      flipPending.current = dir > 0 ? 'top' : 'bottom'
      setPage(np)
    }
    const atBottom = () => el.scrollTop + el.clientHeight >= el.scrollHeight - EDGE
    const atTop = () => el.scrollTop <= EDGE
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && atBottom() && page < numPages) { e.preventDefault(); flip(1) }
      else if (e.deltaY < 0 && atTop() && page > 1) { e.preventDefault(); flip(-1) }
    }
    let ty: number | null = null
    const onTouchStart = (e: TouchEvent) => { ty = e.touches[0]?.clientY ?? null }
    const onTouchMove = (e: TouchEvent) => {
      if (ty == null || tool_ !== 'pan') return
      const dy = ty - (e.touches[0]?.clientY ?? ty) // + = swipe up (scroll down)
      if (dy > 60 && atBottom() && page < numPages) { flip(1); ty = e.touches[0].clientY }
      else if (dy < -60 && atTop() && page > 1) { flip(-1); ty = e.touches[0].clientY }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => { el.removeEventListener('wheel', onWheel); el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchmove', onTouchMove) }
  }, [status, page, numPages, tool_])

  // Import a PDF dropped ANYWHERE on the page (the small drop box alone made dropping
  // elsewhere open the PDF in the browser instead). preventDefault stops that navigation.
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() }
    const drop = (e: DragEvent) => { const f = e.dataTransfer?.files?.[0]; if (f) { e.preventDefault(); openFile(f) } }
    window.addEventListener('dragover', over); window.addEventListener('drop', drop)
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (status === 'ready' && scale > 0) renderPage(page, scale) }, [status, page, scale, renderPage])
  useEffect(() => { if (status === 'ready') drawAll(page, scale) }, [annos, page, scale, status, searchHits, drawAll])

  // Compute search-match highlight boxes for the current page (in scale-1 coords).
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (status !== 'ready' || !showSearch || !q || !pdfRef.current) { setSearchHits([]); return }
    let cancel = false
    ;(async () => {
      try {
        const { Util } = await import('pdfjs-dist')
        const pg = await pdfRef.current!.getPage(page)
        const tc = await pg.getTextContent()
        const vpTransform = (pg.getViewport({ scale: 1 }) as unknown as { transform: number[] }).transform
        const hits: { x: number; y: number; w: number; h: number }[] = []
        for (const it of tc.items as { str?: string; width?: number; transform: number[] }[]) {
          const s = it.str || ''; const sl = s.toLowerCase(); let from = 0; let idx: number
          while ((idx = sl.indexOf(q, from)) !== -1) {
            const tx = Util.transform(vpTransform, it.transform)
            const fontH = Math.hypot(tx[2], tx[3]) || 10
            const totalW = it.width || 0
            hits.push({ x: tx[4] + (idx / Math.max(1, s.length)) * totalW, y: tx[5] - fontH, w: (q.length / Math.max(1, s.length)) * totalW, h: fontH })
            from = idx + q.length
          }
        }
        if (!cancel) setSearchHits(hits)
      } catch { if (!cancel) setSearchHits([]) }
    })()
    return () => { cancel = true }
  }, [page, query, showSearch, status])

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
      // commit any open text box, then open a fresh inline input at the click point
      commitText()
      setTextEdit({ x: p.x, y: p.y, val: '' }); return
    }
    drawing.current = true
    // the stroke-width option applies to every tool; the highlighter is rendered ~3× as thick
    const base = { id: idRef.current++, page, color, width: tool_ === 'highlight' ? penW * 3 : penW }
    if (tool_ === 'pen' || tool_ === 'freehand') draftRef.current = { ...base, type: tool_, pts: [p] }
    else if (tool_ === 'rect' || tool_ === 'capture') draftRef.current = { ...base, type: tool_, x: p.x, y: p.y, w: 0, h: 0 }
    else draftRef.current = { ...base, type: tool_, x1: p.x, y1: p.y, x2: p.x, y2: p.y }
    drawAll(page, scale)
  }
  function onMove(e: React.PointerEvent) {
    if (!drawing.current || !draftRef.current) return
    const p = pt(e); const d = draftRef.current
    if (d.type === 'pen' || d.type === 'freehand') d.pts!.push(p)
    else if (d.type === 'rect' || d.type === 'capture') { d.w = p.x - (d.x || 0); d.h = p.y - (d.y || 0) }
    // highlight / underline / strikethrough are locked horizontal (clean line over/under/through text)
    else { d.x2 = p.x; d.y2 = (d.type === 'underline' || d.type === 'strike' || d.type === 'highlight') ? (d.y1 || 0) : p.y }
    drawAll(page, scale)
  }
  function onUp() {
    if (!drawing.current) return
    drawing.current = false
    const d = draftRef.current; draftRef.current = null
    if (d && d.type === 'capture') { drawAll(page, scale); captureRegion(d); return } // export the selected region, don't keep it as an annotation
    if (d) {
      // ignore zero-size shapes/dots
      const tiny = (d.type === 'rect' && Math.abs(d.w || 0) < 3 && Math.abs(d.h || 0) < 3) ||
        ((d.type === 'pen' || d.type === 'freehand') && (d.pts?.length || 0) < 2) ||
        (d.type === 'highlight' && Math.abs((d.x2 || 0) - (d.x1 || 0)) < 3)
      if (!tiny) setAnnos((a) => [...a, d])
    }
    drawAll(page, scale)
  }

  // Screen capture: crop the selected region (PDF render + annotations) to a PNG.
  // PC → copy to clipboard; mobile/unsupported → download.
  function captureRegion(d: Anno) {
    const pc = pdfCanvas.current; if (!pc) return
    const s = scale
    let x = Math.min(d.x || 0, (d.x || 0) + (d.w || 0)) * s
    let y = Math.min(d.y || 0, (d.y || 0) + (d.h || 0)) * s
    let w = Math.abs(d.w || 0) * s, h = Math.abs(d.h || 0) * s
    x = Math.max(0, x); y = Math.max(0, y); w = Math.min(w, pc.width - x); h = Math.min(h, pc.height - y)
    if (w < 4 || h < 4) return
    const out = document.createElement('canvas'); out.width = Math.round(w); out.height = Math.round(h)
    const octx = out.getContext('2d'); if (!octx) return
    octx.drawImage(pc, x, y, w, h, 0, 0, out.width, out.height) // the rendered page
    const ac = annoCanvas.current; if (ac) octx.drawImage(ac, x, y, w, h, 0, 0, out.width, out.height) // annotations on top
    const toast = (key: string) => { setCaptureMsg(t(key)); setTimeout(() => setCaptureMsg(''), 2200) }
    out.toBlob(async (blob) => {
      if (!blob) return
      const isPC = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
      const clip = navigator.clipboard as Clipboard & { write?: (items: ClipboardItem[]) => Promise<void> }
      if (isPC && clip?.write && typeof ClipboardItem !== 'undefined') {
        try { await clip.write([new ClipboardItem({ 'image/png': blob })]); toast('pa_captured_copy'); return } catch { /* fall back to download */ }
      }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `pdf-capture-p${page}.png`; a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('pa_captured_save')
    }, 'image/png')
  }

  function undo() { setAnnos((a) => a.slice(0, -1)) }
  function clearPage() {
    if (!annos.some((a) => a.page === page)) return // nothing drawn on this page
    if (!window.confirm(t('pa_clear_confirm'))) return
    setAnnos((a) => a.filter((x) => x.page !== page))
  }
  // Commit the open inline text box (if non-empty) as a text annotation, then close it.
  function commitText() {
    if (textEdit && textEdit.val.trim()) setAnnos((a) => [...a, { id: idRef.current++, page, type: 'text', color, width: 1, x: textEdit.x, y: textEdit.y, text: textEdit.val, size: 16 }])
    setTextEdit(null)
  }

  async function download(name = fileName) {
    if (!origBytes.current) return
    setSaveDialog(false); setExporting(true)
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
      a.download = `${(name || 'annotated').replace(/[\\/:*?"<>|]+/g, '').trim() || 'annotated'}.pdf`; a.click()
    } catch (e) { console.error(e); alert(t('pa_error')) } finally { setExporting(false) }
  }

  // [tool, ToolIcon name]
  const TOOLS: [string, string][] = [['highlight', 'highlighter'], ['pen', 'pen'], ['underline', 'underline'], ['strike', 'strike'], ['rect', 'rect'], ['line', 'line'], ['freehand', 'freehand'], ['arrow', 'arrow'], ['text', 'text'], ['capture', 'camera'], ['pan', 'hand']]
  const DRAW_TOOLS = TOOLS.filter(([k]) => k !== 'pan') // shown in the toggled pen-tools palette
  // the pen-tools toggle mirrors the active drawing tool (or the last one used, while panning)
  const activeDrawIcon = (DRAW_TOOLS.find(([k]) => k === tool_) || DRAW_TOOLS.find(([k]) => k === lastDraw.current))?.[1] ?? 'highlighter'

  const ready = status === 'ready' // toolbar always shows (dimmed before a PDF is loaded)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div ref={wrapRef} className="space-y-3 bg-white overflow-auto">
        {/* Toolbar + floating pen-tools palette (palette is absolute so opening it never
            shifts the page below — fixes the "menu jumps" feel). */}
        <div className="relative">
          {/* Top toolbar — one row: thumbnails · pen-tools · move · zoom · fullscreen · find · save · new file.
              Always visible (dimmed before a PDF loads) to preview the features. */}
          <div className={'flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-2' + (ready ? '' : ' opacity-50 pointer-events-none')}>
            <button onClick={() => setShowThumbs((s) => !s)} title={t('pa_thumbs')} aria-label={t('pa_thumbs')} className={'w-9 h-9 rounded-lg flex items-center justify-center ' + (showThumbs ? 'bg-brand-100 text-brand-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100')}><ToolIcon name="thumbnails" /></button>
            <span className="w-px h-6 bg-gray-300 mx-0.5" />
            {/* Save (download annotated PDF) + new file — right after thumbnails */}
            <button onClick={() => { setSaveName(`${fileName}-annotated`); setSaveDialog(true) }} disabled={exporting} title={t('pa_download')} aria-label={t('pa_download')} className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-60 flex items-center justify-center"><ToolIcon name={exporting ? 'loader' : 'save'} className={exporting ? 'w-[18px] h-[18px] animate-spin' : 'w-[18px] h-[18px]'} /></button>
            <button onClick={() => { if (annos.length === 0 || window.confirm(t('pa_newfile_confirm'))) fileInput.current?.click() }} title={t('pa_newfile')} aria-label={t('pa_newfile')} className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center"><ToolIcon name="folder" /></button>
            {/* Pen-tools (draw mode) ↔ pan (move mode): mutually exclusive toggle */}
            <button onClick={() => { setShowSearch(false); if (tool_ === 'pan') { setTool(lastDraw.current); setShowPenTools(true) } else setShowPenTools((s) => !s) }} title={t('pa_pentools')} aria-label={t('pa_pentools')}
              className={'w-9 h-9 rounded-lg flex items-center justify-center ' + (tool_ !== 'pan' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100')}><ToolIcon name={activeDrawIcon} /></button>
            <button onClick={() => { setTool('pan'); setShowPenTools(false) }} title={t('pa_pan')} aria-label={t('pa_pan')} className={'w-9 h-9 rounded-lg flex items-center justify-center ' + (tool_ === 'pan' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100')}><ToolIcon name="hand" /></button>
            {/* Zoom — −/select/+ on desktop (PC); a slider inside the bar on mobile */}
            <button onClick={() => setScale((s) => Math.max(0.4, +((s || 1) - 0.15).toFixed(2)))} title={t('pa_zoom')} aria-label="zoom out" className="hidden md:flex w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 items-center justify-center"><ToolIcon name="zoom-out" /></button>
            <select value={String(scale)} onChange={(e) => setScale(+e.target.value)} title={t('pa_zoom')} aria-label={t('pa_zoom')}
              className="hidden md:block h-9 rounded-lg border border-gray-200 bg-white px-1.5 text-sm">
              {(ZOOMS.includes(scale) ? ZOOMS : [scale, ...ZOOMS]).sort((a, b) => a - b).map((z) => <option key={z} value={z}>{Math.round(z * 100)}%</option>)}
            </select>
            <button onClick={() => setScale((s) => Math.min(3, +((s || 1) + 0.15).toFixed(2)))} title={t('pa_zoom')} aria-label="zoom in" className="hidden md:flex w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 items-center justify-center"><ToolIcon name="zoom-in" /></button>
            <button onClick={() => wrapRef.current?.requestFullscreen?.()} title={t('pa_fullscreen')} className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center"><ToolIcon name="maximize" /></button>
            <button onClick={() => { setShowSearch((s) => !s); setShowPenTools(false) }} title={t('pa_search')} aria-label={t('pa_search')} className={'w-9 h-9 rounded-lg flex items-center justify-center ' + (showSearch ? 'bg-brand-100 text-brand-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100')}><ToolIcon name="search" /></button>
          </div>

          {/* Pen-tools palette — floats below the toolbar (absolute → no layout shift) */}
          {showPenTools && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-2 shadow-lg">
              {DRAW_TOOLS.map(([k, icon]) => (
                <button key={k} title={t('pa_' + k)} onClick={() => { setTool(k); if (k !== 'capture') lastDraw.current = k }}
                  className={'w-9 h-9 rounded-lg flex items-center justify-center ' + (tool_ === k ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100')}><ToolIcon name={icon} /></button>
              ))}
              <span className="w-px h-6 bg-gray-300 mx-0.5" />
              <ColorSwatchSelect value={color} onChange={setColor} colors={COLORS} title={t('pa_color')} ariaLabel={t('pa_color')} />
              {/* Stroke width — dropdown showing the actual line thickness as images */}
              <div className="relative">
                {wOpen && <div className="fixed inset-0 z-10" onClick={() => setWOpen(false)} />}
                <button onClick={() => setWOpen((o) => !o)} title={t('pa_width')} aria-label={t('pa_width')}
                  className="h-9 px-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center gap-1.5">
                  <span style={{ width: 20, height: penW, borderRadius: 9999, background: '#374151', display: 'block' }} />
                  <span className="text-xs text-gray-400">▼</span>
                </button>
                {wOpen && (
                  <div className="absolute z-30 mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-1 space-y-1">
                    {WIDTHS.map((w) => (
                      <button key={w} onClick={() => { setPenW(w); setWOpen(false) }}
                        className={'flex items-center justify-center w-16 h-8 rounded ' + (penW === w ? 'bg-brand-50' : 'hover:bg-gray-100')}>
                        <span style={{ width: 34, height: w, borderRadius: 9999, background: '#374151', display: 'block' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="w-px h-6 bg-gray-300 mx-0.5" />
              {/* Undo + clear (eraser) — moved into the palette */}
              <button onClick={undo} title={t('pa_undo')} aria-label={t('pa_undo')} className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center"><ToolIcon name="undo" /></button>
              <button onClick={clearPage} title={t('pa_clear')} aria-label={t('pa_clear')} className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center"><ToolIcon name="eraser" /></button>
            </div>
          )}

          {/* Find bar — floats right below the toolbar (mutually exclusive with the pen palette) */}
          {showSearch && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 flex items-center gap-2 text-sm rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-lg">
              <input autoFocus value={query} onChange={(e) => runSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') jumpMatch(e.shiftKey ? -1 : 1); if (e.key === 'Escape') setShowSearch(false) }}
                placeholder={t('pa_search')} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-400" />
              {query && (matches.length ? (
                <span className="flex items-center gap-1 text-gray-500 shrink-0">
                  <button onClick={() => jumpMatch(-1)} aria-label="prev match" className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"><ToolIcon name="chevron-left" className="w-4 h-4" /></button>
                  {matchIdx + 1}/{matches.length}
                  <button onClick={() => jumpMatch(1)} aria-label="next match" className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"><ToolIcon name="chevron-right" className="w-4 h-4" /></button>
                </span>
              ) : <span className="text-gray-400 shrink-0">{t('pa_nomatch')}</span>)}
              <button onClick={() => setShowSearch(false)} aria-label="close" className="inline-flex items-center justify-center text-gray-400 hover:text-gray-700 px-1 shrink-0"><ToolIcon name="x" className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        {ready ? (
          <>
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
          <div ref={stageRef} className="flex-1 overflow-auto bg-gray-100 rounded-xl p-2 flex justify-center max-h-[56vh] md:max-h-[78vh]">
            <div className="relative shadow-lg" style={{ width: 'fit-content', height: 'fit-content' }}>
              <canvas ref={pdfCanvas} className="block" />
              <canvas ref={annoCanvas} className="absolute inset-0" style={{ touchAction: 'none', cursor: tool_ === 'pan' ? 'grab' : 'crosshair' }}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} />
              {/* Inline text-note input — typed straight on the page (Enter/blur commits, Esc cancels) */}
              {textEdit && (
                <input autoFocus value={textEdit.val}
                  onChange={(e) => setTextEdit((te) => (te ? { ...te, val: e.target.value } : te))}
                  onBlur={commitText}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitText() } if (e.key === 'Escape') setTextEdit(null) }}
                  size={Math.max(4, textEdit.val.length + 1)} placeholder={t('pa_textprompt')}
                  style={{ position: 'absolute', left: textEdit.x * scale, top: textEdit.y * scale, fontSize: 16 * scale, lineHeight: 1.2, color, padding: 0, margin: 0, border: '1px dashed ' + color, background: 'rgba(255,255,255,.7)', outline: 'none', fontFamily: 'sans-serif' }} />
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar — page navigation (centred) */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} title={t('pa_page')} aria-label={t('pa_page')} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center"><ToolIcon name="chevron-left" /></button>
          <span className="tabular-nums"><input type="number" min={1} max={numPages} value={page} onChange={(e) => setPage(Math.min(numPages, Math.max(1, +e.target.value || 1)))} className="w-10 text-center border border-gray-300 rounded px-1 py-0.5" /> / {numPages}</span>
          <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} title={t('pa_page')} aria-label={t('pa_page')} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center"><ToolIcon name="chevron-right" /></button>
        </div>

          </>
        ) : (
          /* Drop zone — shown until a PDF is opened */
          <div onClick={() => fileInput.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && openFile(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <div className="text-4xl mb-3">📄✍️</div>
            <p className="font-medium text-gray-700">{t('pa_open')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('pa_drop')}</p>
            {status === 'loading' && <p className="text-sm text-brand-600 mt-3 animate-pulse">{t('pa_loading')}</p>}
            {status === 'error' && <p className="text-sm text-red-500 mt-3">{t('pa_error')}</p>}
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); fileInput.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          </div>
        )}

        {/* Capture confirmation — fixed toast so it's clearly visible right after selecting */}
        {captureMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-gray-900 text-white text-sm px-4 py-2.5 shadow-lg">
            <ToolIcon name="check" className="w-4 h-4" />{captureMsg}
          </div>
        )}
        {/* Mobile zoom — moved out of the top toolbar to the bottom (only once a PDF is loaded) */}
        {ready && (
          <div className="md:hidden flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-xs text-gray-500 shrink-0">{t('pa_zoom')}</span>
            <input type="range" min={0.4} max={3} step={0.05} value={scale} onChange={(e) => setScale(+e.target.value)} aria-label={t('pa_zoom')} className="flex-1 accent-brand-600" />
            <span className="text-xs tabular-nums text-gray-500 w-10 text-right shrink-0">{Math.round(scale * 100)}%</span>
          </div>
        )}

        {/* Privacy banner — unified style with the other tools */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span>{t('pa_local')}</span>
        </div>

        {/* Convert this PDF with our other tools */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {([['pdf-to-jpg', '🖼️', 'PDF → JPG'], ['pdf-to-png', '🏞️', 'PDF → PNG'], ['pdf-to-text', '📄', 'PDF → TXT']] as const).map(([slug, icon, label]) => (
            <a key={slug} href={`/${params.lang}/tools/${slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300"><span>{icon}</span><span>{label}</span></a>
          ))}
        </div>
        <input ref={fileInput} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.currentTarget.value = ''; if (f) openFile(f) }} />
      </div>

      {/* Save-as dialog — choose the file name before exporting */}
      {saveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSaveDialog(false)}>
          <div className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-gray-800 mb-2">{t('pa_save_title')}</p>
            <div className="flex items-center gap-1">
              <input autoFocus value={saveName} onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && saveName.trim()) download(saveName) }}
                className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
              <span className="text-sm text-gray-400 shrink-0">.pdf</span>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setSaveDialog(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">{t('pa_cancel')}</button>
              <button onClick={() => download(saveName)} disabled={!saveName.trim()} className="px-4 py-1.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50">{t('pa_download')}</button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
