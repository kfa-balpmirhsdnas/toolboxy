'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('paint')!

type Tool = 'pen' | 'eraser' | 'line' | 'rect' | 'ellipse' | 'fill' | 'text' | 'picker'
type Bg = 'white' | 'transparent'
type Snap = { blob: Blob; w: number; h: number; bg: Bg }

const PALETTE = ['#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8',
  '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#efe4b0', '#b5e61d']
const PRESETS: [number, number][] = [[800, 600], [1080, 1080], [1920, 1080], [2480, 3508]]
const MAX_STEPS = 20
const MAX_BYTES = 100 * 1024 * 1024 // undo 스택 총량 상한 (Blob 압축 + 이중 상한 — 승인안)
const MAX_SIDE = 4096

const TOOL_ICONS: Record<Tool, string> = {
  pen: 'freehand', eraser: 'eraser', line: 'line', rect: 'rect', ellipse: 'circle',
  fill: 'bucket', text: 'text', picker: 'eyedropper',
}

export default function PaintPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')

  const [toolSel, setToolSel] = useState<Tool>('pen')
  const [width, setWidth] = useState(4)
  const [color, setColor] = useState('#000000')
  const [recent, setRecent] = useState<string[]>([])
  const [shapeFill, setShapeFill] = useState(false)
  const [size, setSize] = useState({ w: 800, h: 600 })
  const [bg, setBg] = useState<Bg>('white')
  const [customW, setCustomW] = useState('800')
  const [customH, setCustomH] = useState('600')
  const [fitCanvas, setFitCanvas] = useState(true)
  const [textBox, setTextBox] = useState<{ dx: number; dy: number; cx: number; cy: number; v: string } | null>(null)
  const [stacks, setStacks] = useState({ undo: 0, redo: 0 }) // 버튼 상태용 카운터

  const mainRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const undoRef = useRef<Snap[]>([])
  const redoRef = useRef<Snap[]>([])
  const dirtyRef = useRef(false)
  const bgRef = useRef<Bg>('white')
  const drawRef = useRef({ active: false, lastX: 0, lastY: 0, startX: 0, startY: 0 })
  const stateRef = useRef({ tool: 'pen' as Tool, width: 4, color: '#000000', shapeFill: false })
  const tracked = useRef(false)
  stateRef.current = { tool: toolSel, width, color, shapeFill }
  bgRef.current = bg

  const ctx = () => mainRef.current!.getContext('2d', { willReadFrequently: true })!
  const octx = () => overlayRef.current!.getContext('2d')!

  function track() { if (!tracked.current) { trackToolUsed('paint'); tracked.current = true } }

  // ----- canvas lifecycle -----
  function initCanvas(w: number, h: number, bgMode: Bg) {
    const m = mainRef.current!, o = overlayRef.current!
    m.width = w; m.height = h; o.width = w; o.height = h
    if (bgMode === 'white') { const c = ctx(); c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h) }
    setSize({ w, h }); setBg(bgMode); bgRef.current = bgMode
    setCustomW(String(w)); setCustomH(String(h))
  }
  useEffect(() => { initCanvas(800, 600, 'white') }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function newCanvas(w: number, h: number, bgMode: Bg) {
    if (dirtyRef.current && !window.confirm(t('pnt_new_confirm'))) return
    initCanvas(Math.min(MAX_SIDE, Math.max(1, w)), Math.min(MAX_SIDE, Math.max(1, h)), bgMode)
    undoRef.current = []; redoRef.current = []; dirtyRef.current = false
    setStacks({ undo: 0, redo: 0 })
  }

  // ----- undo/redo: Blob 압축 스냅샷 + 단계·총량 이중 상한 -----
  const blobOf = (c: HTMLCanvasElement) => new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'))
  function pushSnapshot() {
    const m = mainRef.current!
    const meta = { w: m.width, h: m.height, bg: bgRef.current }
    m.toBlob((blob) => {
      if (!blob) return
      undoRef.current.push({ blob, ...meta })
      let total = undoRef.current.reduce((s, x) => s + x.blob.size, 0)
      while (undoRef.current.length > MAX_STEPS || (total > MAX_BYTES && undoRef.current.length > 1)) {
        total -= undoRef.current.shift()!.blob.size
      }
      redoRef.current = []
      setStacks({ undo: undoRef.current.length, redo: 0 })
    }, 'image/png')
  }
  async function restore(s: Snap) {
    const bmp = await createImageBitmap(s.blob)
    const m = mainRef.current!, o = overlayRef.current!
    m.width = s.w; m.height = s.h; o.width = s.w; o.height = s.h
    const c = ctx(); c.clearRect(0, 0, s.w, s.h); c.drawImage(bmp, 0, 0)
    bmp.close()
    setSize({ w: s.w, h: s.h }); setBg(s.bg); bgRef.current = s.bg
  }
  async function undo() {
    const s = undoRef.current.pop()
    if (!s) return
    const m = mainRef.current!
    redoRef.current.push({ blob: await blobOf(m), w: m.width, h: m.height, bg: bgRef.current })
    await restore(s)
    setStacks({ undo: undoRef.current.length, redo: redoRef.current.length })
  }
  async function redo() {
    const s = redoRef.current.pop()
    if (!s) return
    const m = mainRef.current!
    undoRef.current.push({ blob: await blobOf(m), w: m.width, h: m.height, bg: bgRef.current })
    await restore(s)
    setStacks({ undo: undoRef.current.length, redo: redoRef.current.length })
  }

  // ----- helpers -----
  function coords(e: { clientX: number; clientY: number }) {
    const r = mainRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - r.left) * (mainRef.current!.width / r.width),
      y: (e.clientY - r.top) * (mainRef.current!.height / r.height),
      dx: e.clientX - r.left, dy: e.clientY - r.top,
    }
  }
  function addRecent(c: string) {
    setRecent((prev) => [c, ...prev.filter((x) => x !== c)].slice(0, 8))
  }
  function markDirty() { dirtyRef.current = true }

  // ----- drawing -----
  function strokeSeg(x0: number, y0: number, x1: number, y1: number) {
    const { tool: tl, width: w, color: col } = stateRef.current
    const c = ctx()
    c.save()
    c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'
    if (tl === 'eraser') {
      if (bgRef.current === 'white') c.strokeStyle = '#ffffff'
      else c.globalCompositeOperation = 'destination-out'
    } else c.strokeStyle = col
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke()
    c.restore()
  }
  function drawShape(target: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
    const { tool: tl, width: w, color: col, shapeFill: sf } = stateRef.current
    target.save()
    target.lineWidth = w; target.strokeStyle = col; target.fillStyle = col; target.lineCap = 'round'
    target.beginPath()
    if (tl === 'line') { target.moveTo(x0, y0); target.lineTo(x1, y1); target.stroke() }
    else if (tl === 'rect') {
      const rx = Math.min(x0, x1), ry = Math.min(y0, y1), rw = Math.abs(x1 - x0), rh = Math.abs(y1 - y0)
      if (sf) target.fillRect(rx, ry, rw, rh); else target.strokeRect(rx, ry, rw, rh)
    } else if (tl === 'ellipse') {
      target.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, 0, 0, Math.PI * 2)
      if (sf) target.fill(); else target.stroke()
    }
    target.restore()
  }

  // scanline flood fill (tolerance 32)
  function floodFill(sx: number, sy: number) {
    const m = mainRef.current!
    const W = m.width, H = m.height
    const x0 = Math.floor(sx), y0 = Math.floor(sy)
    if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return
    const img = ctx().getImageData(0, 0, W, H)
    const d = img.data
    const idx = (y0 * W + x0) * 4
    const tr = d[idx], tg = d[idx + 1], tb = d[idx + 2], ta = d[idx + 3]
    const hex = stateRef.current.color
    const fr = parseInt(hex.slice(1, 3), 16), fg = parseInt(hex.slice(3, 5), 16), fb = parseInt(hex.slice(5, 7), 16)
    if (tr === fr && tg === fg && tb === fb && ta === 255) return
    const TOL = 32
    const match = (i: number) =>
      Math.abs(d[i] - tr) <= TOL && Math.abs(d[i + 1] - tg) <= TOL && Math.abs(d[i + 2] - tb) <= TOL && Math.abs(d[i + 3] - ta) <= TOL
    const set = (i: number) => { d[i] = fr; d[i + 1] = fg; d[i + 2] = fb; d[i + 3] = 255 }
    const stack: number[] = [x0, y0]
    while (stack.length) {
      const y = stack.pop()!, x = stack.pop()!
      let xl = x
      while (xl >= 0 && match((y * W + xl) * 4)) xl--
      xl++
      let spanUp = false, spanDown = false
      let xr = xl
      while (xr < W && match((y * W + xr) * 4)) {
        set((y * W + xr) * 4)
        if (y > 0) {
          const up = match(((y - 1) * W + xr) * 4)
          if (up && !spanUp) { stack.push(xr, y - 1); spanUp = true } else if (!up) spanUp = false
        }
        if (y < H - 1) {
          const dn = match(((y + 1) * W + xr) * 4)
          if (dn && !spanDown) { stack.push(xr, y + 1); spanDown = true } else if (!dn) spanDown = false
        }
        xr++
      }
    }
    ctx().putImageData(img, 0, 0)
  }

  // ----- pointer handlers (Pointer Events 통일 — 스펙 규칙) -----
  function onPointerDown(e: React.PointerEvent) {
    if (textBox) return // 텍스트 입력 중에는 캔버스 조작 잠금
    e.preventDefault()
    track()
    const { x, y, dx, dy } = coords(e)
    const tl = stateRef.current.tool

    if (tl === 'picker') {
      const px = ctx().getImageData(Math.floor(x), Math.floor(y), 1, 1).data
      const hex = '#' + [px[0], px[1], px[2]].map((v) => v.toString(16).padStart(2, '0')).join('')
      setColor(hex); addRecent(hex); setToolSel('pen')
      return
    }
    if (tl === 'text') {
      setTextBox({ dx, dy, cx: x, cy: y, v: '' })
      return
    }
    pushSnapshot()
    if (tl === 'fill') {
      floodFill(x, y); markDirty(); addRecent(stateRef.current.color)
      return
    }
    overlayRef.current!.setPointerCapture(e.pointerId)
    drawRef.current = { active: true, lastX: x, lastY: y, startX: x, startY: y }
    if (tl === 'pen' || tl === 'eraser') strokeSeg(x, y, x, y) // 점 찍기
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drawRef.current.active) return
    e.preventDefault()
    const { x, y } = coords(e)
    const tl = stateRef.current.tool
    if (tl === 'pen' || tl === 'eraser') {
      // 빠른 스트로크 보간 — 이전 점과 직선 연결
      strokeSeg(drawRef.current.lastX, drawRef.current.lastY, x, y)
      drawRef.current.lastX = x; drawRef.current.lastY = y
    } else if (tl === 'line' || tl === 'rect' || tl === 'ellipse') {
      const o = octx()
      o.clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
      drawShape(o, drawRef.current.startX, drawRef.current.startY, x, y)
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!drawRef.current.active) return
    const { x, y } = coords(e)
    const tl = stateRef.current.tool
    drawRef.current.active = false
    if (tl === 'line' || tl === 'rect' || tl === 'ellipse') {
      octx().clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
      drawShape(ctx(), drawRef.current.startX, drawRef.current.startY, x, y)
    }
    markDirty()
    if (tl !== 'eraser') addRecent(stateRef.current.color)
  }

  // ----- text commit -----
  function commitText() {
    if (!textBox) return
    if (textBox.v.trim()) {
      pushSnapshot()
      const c = ctx()
      const fs = Math.max(12, stateRef.current.width * 3)
      c.save(); c.fillStyle = stateRef.current.color; c.font = `${fs}px sans-serif`; c.textBaseline = 'top'
      c.fillText(textBox.v, textBox.cx, textBox.cy)
      c.restore()
      markDirty(); addRecent(stateRef.current.color)
    }
    setTextBox(null)
  }

  // ----- image load (file / dnd / paste) -----
  async function loadImage(blob: Blob) {
    track()
    let bmp: ImageBitmap
    try { bmp = await createImageBitmap(blob) } catch { return }
    pushSnapshot()
    if (fitCanvas) {
      const sc = Math.min(1, MAX_SIDE / bmp.width, MAX_SIDE / bmp.height)
      const w = Math.round(bmp.width * sc), h = Math.round(bmp.height * sc)
      const m = mainRef.current!, o = overlayRef.current!
      m.width = w; m.height = h; o.width = w; o.height = h
      setSize({ w, h }); setCustomW(String(w)); setCustomH(String(h))
      const c = ctx()
      if (bgRef.current === 'white') { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h) }
      c.drawImage(bmp, 0, 0, w, h)
    } else {
      const m = mainRef.current!
      const sc = Math.min(1, m.width / bmp.width, m.height / bmp.height)
      const w = bmp.width * sc, h = bmp.height * sc
      ctx().drawImage(bmp, (m.width - w) / 2, (m.height - h) / 2, w, h)
    }
    bmp.close()
    markDirty()
  }
  async function pasteFromClipboard() {
    try {
      const items = await navigator.clipboard.read()
      for (const it of items) {
        const type = it.types.find((x) => x.startsWith('image/'))
        if (type) { await loadImage(await it.getType(type)); return }
      }
      alert(t('pnt_paste_fail'))
    } catch { alert(t('pnt_paste_fail')) }
  }

  // ----- global listeners: paste / shortcuts / beforeunload -----
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((x) => x.type.startsWith('image/'))
      const f = item?.getAsFile()
      if (f) { e.preventDefault(); loadImage(f) }
    }
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo() }
      else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'b') setToolSel('pen')
      else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'e') setToolSel('eraser')
    }
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('paste', onPaste)
    window.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onLeave)
    return () => {
      window.removeEventListener('paste', onPaste)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onLeave)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitCanvas])

  // ----- save -----
  function download(blob: Blob, ext: string) {
    const d = new Date()
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `paint-${stamp}.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
    trackToolDownload('paint', ext)
  }
  function savePng() { mainRef.current!.toBlob((b) => b && download(b, 'png'), 'image/png') }
  function saveJpg() {
    const m = mainRef.current!
    const tmp = document.createElement('canvas')
    tmp.width = m.width; tmp.height = m.height
    const c = tmp.getContext('2d')!
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, tmp.width, tmp.height) // JPG는 투명 미지원 → 흰 배경 합성
    c.drawImage(m, 0, 0)
    tmp.toBlob((b) => b && download(b, 'jpg'), 'image/jpeg', 0.9)
  }

  function clearCanvas() {
    if (!window.confirm(t('pnt_clear_confirm'))) return
    pushSnapshot()
    const m = mainRef.current!
    const c = ctx(); c.clearRect(0, 0, m.width, m.height)
    if (bgRef.current === 'white') { c.fillStyle = '#ffffff'; c.fillRect(0, 0, m.width, m.height) }
    markDirty()
  }

  // ----- UI -----
  const TOOLS_LIST: Tool[] = ['pen', 'eraser', 'line', 'rect', 'ellipse', 'fill', 'text', 'picker']
  const iconBtn = (on: boolean) =>
    'flex items-center justify-center w-10 h-10 rounded-xl border transition-colors shrink-0 ' +
    (on ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300')
  const actBtn = 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40'

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-5xl mx-auto px-4 pb-20 md:pb-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('pnt_title')}</h1>
        <p className="text-gray-500 mb-5">{t('pnt_subtitle')}</p>

        {/* options bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 mb-3 space-y-2.5">
          {/* row 1: actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={undo} disabled={stacks.undo === 0} className={actBtn} title="Ctrl+Z"><ToolIcon name="undo" className="w-4 h-4" />{t('pnt_undo')}</button>
            <button onClick={redo} disabled={stacks.redo === 0} className={actBtn} title="Ctrl+Y"><ToolIcon name="redo" className="w-4 h-4" />{t('pnt_redo')}</button>
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <button onClick={() => fileRef.current?.click()} className={actBtn}><ToolIcon name="folder" className="w-4 h-4" />{t('pnt_load')}</button>
            <button onClick={pasteFromClipboard} className={actBtn} title="Ctrl+V"><ToolIcon name="copy" className="w-4 h-4" />{t('pnt_paste')}</button>
            <label className="inline-flex items-center gap-1 text-xs text-gray-500 ml-1">
              <input type="checkbox" checked={fitCanvas} onChange={(e) => setFitCanvas(e.target.checked)} className="accent-brand-600" />
              {t('pnt_fit_canvas')}
            </label>
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <button onClick={savePng} className={actBtn + ' !text-brand-700 !border-brand-200'}><ToolIcon name="download" className="w-4 h-4" />PNG</button>
            <button onClick={saveJpg} className={actBtn + ' !text-brand-700 !border-brand-200'}><ToolIcon name="download" className="w-4 h-4" />JPG</button>
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <button onClick={clearCanvas} className={actBtn + ' !text-red-500 !border-red-200'}><ToolIcon name="trash" className="w-4 h-4" />{t('pnt_clear')}</button>
          </div>
          {/* row 2: width + colors */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              {t('pnt_width')}
              <input type="range" min={1} max={50} value={width} onChange={(e) => setWidth(+e.target.value)} className="w-28 accent-brand-600" />
              <span className="w-7 tabular-nums font-bold">{width}</span>
            </label>
            {(toolSel === 'rect' || toolSel === 'ellipse') && (
              <button onClick={() => setShapeFill((v) => !v)} className={actBtn}>
                {shapeFill ? '■ ' + t('pnt_fill_shape') : '□ ' + t('pnt_stroke_shape')}
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-lg border-2 border-gray-300 shrink-0" style={{ background: color }} title={color} />
              <input type="color" value={color} onChange={(e) => { setColor(e.target.value) }} className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5 bg-white" />
              <div className="grid grid-cols-8 gap-1">
                {PALETTE.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={'w-5 h-5 rounded border ' + (color === c ? 'ring-2 ring-brand-500 border-white' : 'border-gray-200')} style={{ background: c }} aria-label={c} />
                ))}
              </div>
              {recent.length > 0 && (
                <div className="flex gap-1 ml-1 pl-2 border-l border-gray-200">
                  {recent.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className="w-5 h-5 rounded-full border border-gray-200" style={{ background: c }} aria-label={c} />
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* row 3: canvas size + bg */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="font-medium">{t('pnt_size')}</span>
            {PRESETS.map(([w, h]) => (
              <button key={w + 'x' + h} onClick={() => { setCustomW(String(w)); setCustomH(String(h)); newCanvas(w, h, bg) }}
                className={actBtn + (size.w === w && size.h === h ? ' !border-brand-400 !text-brand-700' : '')}>
                {w === 2480 ? 'A4' : `${w}×${h}`}
              </button>
            ))}
            <span className="inline-flex items-center gap-1">
              <input value={customW} onChange={(e) => setCustomW(e.target.value)} inputMode="numeric" className="w-14 border border-gray-200 rounded px-1.5 py-1 text-center" />
              ×
              <input value={customH} onChange={(e) => setCustomH(e.target.value)} inputMode="numeric" className="w-14 border border-gray-200 rounded px-1.5 py-1 text-center" />
              <button onClick={() => newCanvas(parseInt(customW) || 800, parseInt(customH) || 600, bg)} className={actBtn}>{t('pnt_apply')}</button>
            </span>
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <span className="font-medium">{t('pnt_bg')}</span>
            <button onClick={() => newCanvas(size.w, size.h, 'white')} className={actBtn + (bg === 'white' ? ' !border-brand-400 !text-brand-700' : '')}>{t('pnt_bg_white')}</button>
            <button onClick={() => newCanvas(size.w, size.h, 'transparent')} className={actBtn + (bg === 'transparent' ? ' !border-brand-400 !text-brand-700' : '')}>{t('pnt_bg_transparent')}</button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* toolbar — desktop: left column / mobile: fixed bottom bar (엄지 도달 범위) */}
          <div className="fixed bottom-0 inset-x-0 z-30 flex flex-row justify-center gap-1.5 bg-white/95 backdrop-blur border-t border-gray-200 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:static md:flex-col md:justify-start md:bg-transparent md:border-0 md:p-0 md:w-auto">
            {TOOLS_LIST.map((tl) => (
              <button key={tl} onClick={() => setToolSel(tl)} className={iconBtn(toolSel === tl)} title={t('pnt_' + tl)} aria-label={t('pnt_' + tl)}>
                <ToolIcon name={TOOL_ICONS[tl]} className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* canvas */}
          <div className="flex-1 min-w-0">
            <div
              ref={wrapRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) loadImage(f) }}
              className="relative inline-block max-w-full rounded-lg border border-gray-300 shadow-sm overflow-hidden align-top"
              style={bg === 'transparent' ? {
                backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)',
                backgroundSize: '16px 16px',
              } : { background: '#ffffff' }}
            >
              <canvas ref={mainRef} className="block max-w-full max-h-[70vh] w-auto h-auto" />
              <canvas
                ref={overlayRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                style={{ touchAction: 'none' }}
              />
              {textBox && (
                <input
                  autoFocus
                  value={textBox.v}
                  onChange={(e) => setTextBox({ ...textBox, v: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setTextBox(null) }}
                  onBlur={commitText}
                  placeholder={t('pnt_text_ph')}
                  className="absolute z-10 border-2 border-dashed border-brand-400 bg-white/90 px-1 text-sm focus:outline-none"
                  style={{ left: textBox.dx, top: textBox.dy, color }}
                />
              )}
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              {size.w}×{size.h} · {t('pnt_shortcut_hint')}
            </p>
            <p className="text-[11px] text-gray-400">{t('pnt_save_note')}</p>
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImage(f); e.target.value = '' }} />
      </div>
    </ToolLayout>
  )
}
