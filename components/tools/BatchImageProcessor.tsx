'use client'

/**
 * BatchImageProcessor — shared engine for the batch image tools
 * (resize / convert / compress / watermark / rename).
 *
 * Each tool supplies a single `processFn(file, index) => { blob, filename }`.
 * This component owns everything else: multi-file input (drag-drop + picker),
 * thumbnail preview with per-file removal, sequential processing with a live
 * progress counter, graceful skipping of unsupported/failed files, per-file
 * download, and a "download all" zip (via fflate). Nothing is uploaded — all
 * processing happens in the browser.
 *
 * Usage from a tool page:
 *   const processFn = useCallback<ProcessFn>(
 *     (file) => resize(file, { width, keepRatio }), [width, keepRatio])
 *   <BatchImageProcessor slug="batch-image-resizer" processFn={processFn} zipBaseName="resized" />
 */

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'
import ToolIcon from '@/components/tools/ToolIcon'

/** Result a tool's processFn must return for each file (or null to skip it). */
export interface BatchResult {
  blob: Blob
  /** Output filename including extension, e.g. "photo.webp". */
  filename: string
}

/** The only thing each batch tool differs by. Return null to skip a file gracefully. */
export type ProcessFn = (file: File, index: number) => Promise<BatchResult | null>

interface Dims { w: number; h: number }

interface InputItem {
  id: string
  file: File
  url: string // object URL for the thumbnail
  dims?: Dims // pixel size, decoded lazily when sizeUnit === 'pixels'
}

interface OutItem {
  id: string
  srcId: string // id of the input item this result came from (for the list view)
  name: string
  blob: Blob
  url: string
  inSize: number
  outSize: number
  dims?: Dims // output pixel size, decoded when sizeUnit === 'pixels'
}

interface SkipItem {
  name: string
  reason: string
}

interface Props {
  /** Tool slug, used for analytics (trackToolUsed / trackToolDownload). */
  slug: string
  /** Per-tool processing function. */
  processFn: ProcessFn
  /** Base name for the downloaded zip (e.g. "resized" → resized.zip). */
  zipBaseName?: string
  /** Accept attribute / drop filter. Defaults to "image/*". */
  accept?: string
  /**
   * Optional override for the process button label (else "Process N images").
   * A function receives the current file count for count-aware labels.
   */
  ctaLabel?: string | ((n: number) => string)
  /**
   * Optional live name preview. When provided, each input thumbnail's caption
   * shows the computed output name (updating as the function identity changes),
   * with the original name in the tooltip. Used by the rename tool.
   */
  previewName?: (file: File, index: number) => string
  /** Optional files to seed the queue with on mount (used for tool-to-tool handoff). */
  initialFiles?: File[] | null
  /** Called with the produced files when a run finishes (used for handoff). */
  onComplete?: (files: File[]) => void
  /** Called whenever the input queue changes (add/remove/seed). */
  onFilesChange?: (files: File[]) => void
  /** List-view size columns: 'bytes' (file size, default) or 'pixels' (W×H). */
  sizeUnit?: 'bytes' | 'pixels'
  /**
   * Optional per-file annotation rendered under the filename in the input list
   * (e.g. EXIF tags for remove-exif). Default undefined → nothing extra is shown,
   * so other tools are unaffected.
   */
  rowExtra?: (file: File) => ReactNode
  /**
   * Optional content rendered between the input list and the process button (only
   * once files are queued) — e.g. remove-exif's "what to strip" selector. Default
   * undefined → nothing, so other tools are unaffected.
   */
  aboveCta?: ReactNode
  /**
   * Optional replacement for the list's "new size" column (header + per-file cell),
   * e.g. remove-exif shows the shot date there instead. Default undefined keeps the
   * normal output-size column.
   */
  newColumn?: { header: ReactNode; cell: (file: File) => ReactNode }
  /** Hide the "original size" column on mobile (shown again at sm+) — for tools where
   *  size isn't the focus and the row is cramped. Default false. */
  hideOrigColMobile?: boolean
  /** Hide the built-in "files never leave your device" badge — for tools that show their
   *  own privacy notice elsewhere. Default false. */
  hidePrivacyBadge?: boolean
  /** Show the file list ABOVE the drop zone, and keep it visible (as a placeholder) even
   *  before any file is loaded. Default false (list below, shown only when files exist). */
  listFirst?: boolean
}

let _seq = 0
const uid = () => `${Date.now()}-${_seq++}`

const fmtBytes = (b: number) =>
  b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`

const fmtPx = (d?: { w: number; h: number }) => (d ? `${d.w}×${d.h}` : '…')

/** Size delta as a percent badge: green "−NN%" when smaller, gray "+NN%" when larger. */
function SavingsBadge({ inB, outB }: { inB: number; outB: number }) {
  if (inB <= 0) return null
  const pct = Math.round((1 - outB / inB) * 100)
  if (pct === 0) return null
  return pct > 0
    ? <span className="text-green-600 font-medium"> (−{pct}%)</span>
    : <span className="text-gray-400"> (+{Math.abs(pct)}%)</span>
}

/** Ensure unique names inside the zip (foo.png, foo (1).png, …). */
function dedupeName(name: string, used: Set<string>): string {
  if (!used.has(name)) { used.add(name); return name }
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  let i = 1
  let candidate = `${base} (${i})${ext}`
  while (used.has(candidate)) { i++; candidate = `${base} (${i})${ext}` }
  used.add(candidate)
  return candidate
}

export default function BatchImageProcessor({ slug, processFn, zipBaseName = 'images', accept = 'image/*', ctaLabel, previewName, initialFiles, onComplete, onFilesChange, sizeUnit = 'bytes', rowExtra, aboveCta, newColumn, hideOrigColMobile, hidePrivacyBadge, listFirst }: Props) {
  const t = useTranslations('toolui')
  const [items, setItems] = useState<InputItem[]>([])
  const [results, setResults] = useState<OutItem[]>([])
  const [skipped, setSkipped] = useState<SkipItem[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [dragging, setDragging] = useState(false)
  // Ids of thumbnails the browser couldn't render (e.g. HEIC) — shown as a fallback.
  const [thumbFailed, setThumbFailed] = useState<Set<string>>(() => new Set())
  const [view, setView] = useState<'list' | 'thumbnails'>('list')
  const [zipping, setZipping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Always call the latest processFn even if a run started before options changed.
  const processRef = useRef(processFn)
  useEffect(() => { processRef.current = processFn }, [processFn])

  // Revoke every object URL we created when unmounting.
  const itemsRef = useRef<InputItem[]>([])
  const resultsRef = useRef<OutItem[]>([])
  useEffect(() => { itemsRef.current = items }, [items])
  useEffect(() => { resultsRef.current = results }, [results])
  useEffect(() => () => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.url))
    resultsRef.current.forEach((r) => URL.revokeObjectURL(r.url))
  }, [])

  // Seed the queue once from handed-off files (e.g. "continue in another tool").
  const seeded = useRef(false)
  useEffect(() => {
    if (seeded.current || !initialFiles?.length) return
    seeded.current = true
    setItems(initialFiles.map((file) => ({ id: uid(), file, url: URL.createObjectURL(file) })))
  }, [initialFiles])

  // Notify the parent whenever the input queue changes (for e.g. auto-fill).
  const filesChangeRef = useRef(onFilesChange)
  useEffect(() => { filesChangeRef.current = onFilesChange }, [onFilesChange])
  useEffect(() => { filesChangeRef.current?.(items.map((it) => it.file)) }, [items])

  // Lazily decode pixel sizes for the list view when sizeUnit === 'pixels'.
  useEffect(() => {
    if (sizeUnit !== 'pixels') return
    let cancelled = false
    ;(async () => {
      for (const it of items) {
        if (it.dims) continue
        try {
          const b = await createImageBitmap(it.file)
          const d = { w: b.width, h: b.height }; b.close?.()
          if (cancelled) return
          setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, dims: d } : x)))
        } catch { /* undecodable — leave blank */ }
      }
    })()
    return () => { cancelled = true }
  }, [items, sizeUnit])

  useEffect(() => {
    if (sizeUnit !== 'pixels') return
    let cancelled = false
    ;(async () => {
      for (const r of results) {
        if (r.dims) continue
        try {
          const b = await createImageBitmap(r.blob)
          const d = { w: b.width, h: b.height }; b.close?.()
          if (cancelled) return
          setResults((prev) => prev.map((x) => (x.id === r.id ? { ...x, dims: d } : x)))
        } catch { /* ignore */ }
      }
    })()
    return () => { cancelled = true }
  }, [results, sizeUnit])

  const acceptsFile = useCallback((f: File) => f.type.startsWith('image/') || f.type === '', [])

  const addFiles = useCallback((list: FileList | File[] | null) => {
    if (!list) return
    const incoming = Array.from(list).filter(acceptsFile)
    if (!incoming.length) return
    const mapped = incoming.map((file) => ({ id: uid(), file, url: URL.createObjectURL(file) }))
    setItems((prev) => [...prev, ...mapped])
    // New input invalidates previous results.
    setResults((prev) => { prev.forEach((r) => URL.revokeObjectURL(r.url)); return [] })
    setSkipped([])
    setStatus('idle')
  }, [acceptsFile])

  function removeItem(id: string) {
    setItems((prev) => {
      const hit = prev.find((it) => it.id === id)
      if (hit) URL.revokeObjectURL(hit.url)
      return prev.filter((it) => it.id !== id)
    })
    setResults((prev) => { prev.forEach((r) => URL.revokeObjectURL(r.url)); return [] })
    setStatus('idle')
  }

  function clearAll() {
    items.forEach((it) => URL.revokeObjectURL(it.url))
    results.forEach((r) => URL.revokeObjectURL(r.url))
    setItems([])
    setResults([])
    setSkipped([])
    setStatus('idle')
    setProgress({ current: 0, total: 0 })
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  async function run() {
    if (!items.length || status === 'processing') return
    setStatus('processing')
    setSkipped([])
    setResults((prev) => { prev.forEach((r) => URL.revokeObjectURL(r.url)); return [] })
    setProgress({ current: 0, total: items.length })

    const out: OutItem[] = []
    const skip: SkipItem[] = []
    const usedNames = new Set<string>()

    for (let i = 0; i < items.length; i++) {
      const { file } = items[i]
      setProgress({ current: i, total: items.length })
      try {
        const r = await processRef.current(file, i)
        if (!r) {
          skip.push({ name: file.name, reason: t('bip_skip_unsupported') })
        } else {
          const name = dedupeName(r.filename, usedNames)
          out.push({ id: uid(), srcId: items[i].id, name, blob: r.blob, url: URL.createObjectURL(r.blob), inSize: file.size, outSize: r.blob.size })
        }
      } catch {
        skip.push({ name: file.name, reason: t('bip_skip_failed') })
      }
      // Yield so the progress counter paints between files (keeps UI responsive).
      await new Promise((res) => setTimeout(res, 0))
    }

    setProgress({ current: items.length, total: items.length })
    setResults(out)
    setSkipped(skip)
    setStatus('done')
    if (out.length) {
      trackToolUsed(slug)
      onComplete?.(out.map((o) => new File([o.blob], o.name, { type: o.blob.type })))
    }
  }

  function downloadOne(r: OutItem) {
    const a = document.createElement('a')
    a.href = r.url
    a.download = r.name
    a.click()
    trackToolDownload(slug, r.name.split('.').pop() || 'img')
  }

  async function downloadZip() {
    if (!results.length) return
    setZipping(true)
    try {
      const { zip } = await import('fflate')
      const entries: Record<string, Uint8Array> = {}
      const used = new Set<string>()
      for (const r of results) {
        const key = dedupeName(r.name, used)
        entries[key] = new Uint8Array(await r.blob.arrayBuffer())
      }
      // level 0 (store): images are already compressed, so skip deflate for speed.
      const data: Uint8Array = await new Promise((res, rej) =>
        zip(entries, { level: 0 }, (err, d) => (err ? rej(err) : res(d))))
      // Uint8Array is a valid BlobPart at runtime; cast around a TS lib typing regression.
      const blob = new Blob([data as BlobPart], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(zipBaseName || 'images').replace(/[\\/:*?"<>|]+/g, '').trim() || 'images'}.zip`
      a.click()
      URL.revokeObjectURL(url)
      trackToolDownload(slug, 'zip')
    } finally {
      setZipping(false)
    }
  }

  const totalIn = results.reduce((s, r) => s + r.inSize, 0)
  const totalOut = results.reduce((s, r) => s + r.outSize, 0)
  const sizeColW = sizeUnit === 'pixels' ? 'w-[5.5rem]' : 'w-16'
  const newColW = newColumn ? 'w-28' : sizeColW
  const origHide = hideOrigColMobile ? 'hidden sm:block ' : ''

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={accept} multiple className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
        <div className="text-4xl mb-2">🖼️</div>
        <p className="font-semibold text-gray-700">{t('bip_drop')}</p>
        <p className="text-sm text-gray-400 mt-1">{t('bip_supports')}</p>
      </div>

      {/* Privacy badge (tools with their own privacy notice can hide it) */}
      {!hidePrivacyBadge && (
        <p className="text-xs text-center text-green-700 bg-green-50 border border-green-100 rounded-lg py-1.5">
          🔒 {t('bip_privacy')}
        </p>
      )}

      {/* Input list (listFirst → above the drop zone, shown even when empty) */}
      {(items.length > 0 || listFirst) && (
        <div className={'space-y-3' + (listFirst ? ' order-first' : '')}>
          {items.length === 0 ? (
            // Preview of the list chrome (header buttons + column headers) before any file loads.
            <div className="opacity-70 pointer-events-none space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-400"><span className="sm:hidden">{t('bip_files_short', { n: 0 })}</span><span className="hidden sm:inline">{t('bip_files_n', { n: 0 })}</span></p>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
                    {(['list', 'thumbnails'] as const).map((v) => (
                      <span key={v} className={'flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-md font-medium ' + (v === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400')}>
                        <ToolIcon name={v === 'list' ? 'list' : 'grid'} className="w-3.5 h-3.5" />{v === 'list' ? t('bip_view_list') : t('bip_view_thumb')}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1"><ToolIcon name="trash" className="w-3.5 h-3.5" />{t('ui_clear')}</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-400">
                  <span className="flex-1 min-w-0">{t('bip_col_name')}</span>
                  <span className={`${origHide}${sizeColW} ${newColumn ? 'text-left' : 'text-right'} shrink-0`}>{t('bip_col_orig')}</span>
                  <span className={`${newColW} ${newColumn ? 'text-left' : 'text-right'} shrink-0`}>{newColumn ? newColumn.header : t('bip_col_new')}</span>
                  <span className="w-4 shrink-0" />
                </div>
                <div className="p-6 text-center text-gray-300">{t('bip_list_empty')}</div>
              </div>
            </div>
          ) : (<>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-700"><span className="sm:hidden">{t('bip_files_short', { n: items.length })}</span><span className="hidden sm:inline">{t('bip_files_n', { n: items.length })}</span></p>
            <div className="flex items-center gap-2">
              {/* View toggle: list (default) / thumbnails */}
              <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
                {(['list', 'thumbnails'] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)}
                    className={'flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-md font-medium transition-colors ' + (view === v ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                    <ToolIcon name={v === 'list' ? 'list' : 'grid'} className="w-3.5 h-3.5" />
                    {v === 'list' ? t('bip_view_list') : t('bip_view_thumb')}
                  </button>
                ))}
              </div>
              <button onClick={clearAll} className="flex items-center gap-1 whitespace-nowrap shrink-0 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-lg px-2 py-1 transition-colors">
                <ToolIcon name="trash" className="w-3.5 h-3.5" />
                {t('ui_clear')}
              </button>
            </div>
          </div>

          {view === 'thumbnails' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {items.map((it, idx) => (
              <div key={it.id} title={previewName ? `${it.file.name} → ${previewName(it.file, idx)}` : it.file.name}
                className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                {thumbFailed.has(it.id) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <span className="text-2xl">🖼️</span>
                    <span className="text-[9px] font-medium uppercase mt-0.5">{it.file.name.split('.').pop()}</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.url} alt={it.file.name} className="w-full h-full object-cover"
                    onLoad={(e) => { const im = e.currentTarget; setItems((prev) => prev.map((x) => (x.id === it.id && !x.dims ? { ...x, dims: { w: im.naturalWidth, h: im.naturalHeight } } : x))) }}
                    onError={() => setThumbFailed((prev) => new Set(prev).add(it.id))} />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeItem(it.id) }}
                  aria-label={t('bip_remove')}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/55 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <div className="absolute bottom-0 inset-x-0 px-1 py-0.5 bg-black/55 text-white text-[9px] leading-[1.35]">
                  <p className="truncate font-medium">{previewName ? previewName(it.file, idx) : it.file.name}</p>
                  {it.dims && <p className="text-white/75">{it.dims.w}×{it.dims.h}</p>}
                  <p className="text-white/75">{fmtBytes(it.file.size)}</p>
                </div>
              </div>
            ))}
          </div>
          ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500">
              <span className="flex-1 min-w-0">{t('bip_col_name')}</span>
              <span className={`${origHide}${sizeColW} text-right shrink-0`}>{t('bip_col_orig')}</span>
              <span className={`${newColW} ${newColumn ? 'text-left' : 'text-right'} shrink-0`}>{newColumn ? newColumn.header : t('bip_col_new')}</span>
              <span className="w-4 shrink-0" />
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {items.map((it, idx) => {
                const res = results.find((r) => r.srcId === it.id)
                const origCell = sizeUnit === 'pixels' ? fmtPx(it.dims) : fmtBytes(it.file.size)
                const newCell = !res ? '—' : sizeUnit === 'pixels' ? fmtPx(res.dims) : fmtBytes(res.outSize)
                return (
                  <div key={it.id} className="flex items-center gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-gray-800" title={it.file.name}>{previewName ? previewName(it.file, idx) : it.file.name}</p>
                      {rowExtra && <div className="mt-0.5">{rowExtra(it.file)}</div>}
                    </div>
                    <span className={`${origHide}${sizeColW} text-right shrink-0 text-gray-500`}>{origCell}</span>
                    <span className={`${newColW} ${newColumn ? 'text-left' : 'text-right'} shrink-0 text-gray-700 text-xs`}>{newColumn ? newColumn.cell(it.file) : newCell}</span>
                    <button onClick={() => removeItem(it.id)} aria-label={t('bip_remove')} className="w-4 shrink-0 text-gray-300 hover:text-red-500 transition-colors">✕</button>
                  </div>
                )
              })}
            </div>
          </div>
          )}

          {/* Optional pre-action content (e.g. remove-exif's strip-scope selector) */}
          {aboveCta}

          {/* Process button + progress */}
          {status === 'processing' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                {t('bip_processing', { c: progress.current, t: progress.total })}
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full">
                <div className="h-1.5 bg-brand-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: progress.total ? `${(progress.current / progress.total) * 100}%` : '0%' }} />
              </div>
            </div>
          ) : (
            <button onClick={run}
              className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">
              {typeof ctaLabel === 'function' ? ctaLabel(items.length) : (ctaLabel || t('bip_process', { n: items.length }))}
            </button>
          )}
          </>)}
        </div>
      )}

      {/* Skipped notice */}
      {skipped.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <p className="font-medium mb-1">{t('bip_skipped_n', { n: skipped.length })}</p>
          <ul className="list-disc list-inside text-xs space-y-0.5 max-h-32 overflow-y-auto">
            {skipped.map((s, i) => (
              <li key={i}><span className="font-mono">{s.name}</span> — {s.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Results */}
      {status === 'done' && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-semibold text-gray-700">
              {t('bip_done_n', { n: results.length })}
              <span className="ml-2 font-normal text-gray-400">{fmtBytes(totalIn)} → {fmtBytes(totalOut)}<SavingsBadge inB={totalIn} outB={totalOut} /></span>
            </p>
            <button onClick={downloadZip} disabled={zipping}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {zipping ? t('bip_zipping') : '⬇ ' + t('bip_download_all')}
            </button>
          </div>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={r.name} className="w-10 h-10 rounded object-cover border border-gray-200 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{fmtBytes(r.inSize)} → {fmtBytes(r.outSize)}<SavingsBadge inB={r.inSize} outB={r.outSize} /></p>
                </div>
                <button onClick={() => downloadOne(r)}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  {t('ui_download')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
