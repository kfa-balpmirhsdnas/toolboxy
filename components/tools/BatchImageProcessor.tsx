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

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

/** Result a tool's processFn must return for each file (or null to skip it). */
export interface BatchResult {
  blob: Blob
  /** Output filename including extension, e.g. "photo.webp". */
  filename: string
}

/** The only thing each batch tool differs by. Return null to skip a file gracefully. */
export type ProcessFn = (file: File, index: number) => Promise<BatchResult | null>

interface InputItem {
  id: string
  file: File
  url: string // object URL for the thumbnail
}

interface OutItem {
  id: string
  name: string
  blob: Blob
  url: string
  inSize: number
  outSize: number
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
  /** Optional override for the process button label (else "Process N images"). */
  ctaLabel?: string
}

let _seq = 0
const uid = () => `${Date.now()}-${_seq++}`

const fmtBytes = (b: number) =>
  b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`

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

export default function BatchImageProcessor({ slug, processFn, zipBaseName = 'images', accept = 'image/*', ctaLabel }: Props) {
  const t = useTranslations('toolui')
  const [items, setItems] = useState<InputItem[]>([])
  const [results, setResults] = useState<OutItem[]>([])
  const [skipped, setSkipped] = useState<SkipItem[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [dragging, setDragging] = useState(false)
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
          out.push({ id: uid(), name, blob: r.blob, url: URL.createObjectURL(r.blob), inSize: file.size, outSize: r.blob.size })
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
    if (out.length) trackToolUsed(slug)
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

  return (
    <div className="space-y-4">
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

      {/* Privacy badge */}
      <p className="text-xs text-center text-green-700 bg-green-50 border border-green-100 rounded-lg py-1.5">
        🔒 {t('bip_privacy')}
      </p>

      {/* Input list */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{t('bip_files_n', { n: items.length })}</p>
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              {t('ui_clear')}
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {items.map((it) => (
              <div key={it.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={it.file.name} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeItem(it.id) }}
                  aria-label={t('bip_remove')}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/55 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <span className="absolute bottom-0 inset-x-0 px-1 py-0.5 bg-black/45 text-white text-[10px] truncate">
                  {it.file.name}
                </span>
              </div>
            ))}
          </div>

          {/* Process button + progress */}
          {status === 'processing' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                {t('bip_processing', { c: progress.current, t: progress.total })}
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full">
                <div className="h-1.5 bg-brand-500 rounded-full transition-all"
                  style={{ width: progress.total ? `${(progress.current / progress.total) * 100}%` : '0%' }} />
              </div>
            </div>
          ) : (
            <button onClick={run}
              className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors">
              {ctaLabel || t('bip_process', { n: items.length })}
            </button>
          )}
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
              <span className="ml-2 font-normal text-gray-400">{fmtBytes(totalIn)} → {fmtBytes(totalOut)}</span>
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
                  <p className="text-xs text-gray-400">{fmtBytes(r.inSize)} → {fmtBytes(r.outSize)}</p>
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
