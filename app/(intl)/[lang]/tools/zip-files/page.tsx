'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('zip-files')!
const fmt = (b: number) => (b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(2) + ' MB')
const relPath = (f: File) => (f as File & { __path?: string; webkitRelativePath?: string }).__path || (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
const baseName = (s: string) => s.replace(/\.[^./\\]+$/, '')
const LIMIT = 10

export default function ZipFilesPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [files, setFiles] = useState<File[]>([])
  const [zipName, setZipName] = useState('')
  const [level, setLevel] = useState(6) // fflate deflate level: 6 normal, 9 max, 0 store-only
  const [out, setOut] = useState<{ url: string; size: number; n: number; name: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dirRef = useRef<HTMLInputElement>(null)

  function defaultName(arr: File[]): string {
    const rel = relPath(arr[0])
    return rel.includes('/') ? rel.split('/')[0] : baseName(arr[0].name) // folder name, else first file
  }
  function add(list: FileList | File[] | null) {
    if (!list || !list.length) return
    const arr = Array.from(list)
    setFiles((f) => [...f, ...arr])
    setZipName((z) => z || defaultName(arr))
    setOut(null)
  }
  function removeAt(i: number) { setFiles((f) => f.filter((_, k) => k !== i)); setOut(null) }

  // Drag & drop of folders: walk the dropped FileSystemEntry tree, tagging each file
  // with its relative path so nested structure is preserved in the zip.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async function addEntries(entries: any[]) {
    const collected: File[] = []
    const walk = async (entry: any, prefix: string) => {
      if (entry.isFile) {
        const file: File = await new Promise((res, rej) => entry.file(res, rej))
        try { (file as any).__path = prefix + entry.name } catch { /* read-only on some engines */ }
        collected.push(file)
      } else if (entry.isDirectory) {
        const reader = entry.createReader()
        const readAll = () => new Promise<any[]>((res) => reader.readEntries((r: any[]) => res(r), () => res([])))
        let batch = await readAll()
        while (batch.length) { for (const c of batch) await walk(c, prefix + entry.name + '/'); batch = await readAll() }
      }
    }
    for (const e of entries) await walk(e, '')
    if (collected.length) add(collected)
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const items = e.dataTransfer.items
    if (items && items.length && (items[0] as any).webkitGetAsEntry) {
      const entries: any[] = []
      for (let i = 0; i < items.length; i++) { const en = (items[i] as any).webkitGetAsEntry?.(); if (en) entries.push(en) } // must read synchronously
      if (entries.length) { addEntries(entries); return }
    }
    add(e.dataTransfer.files)
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  function clearAll() { setFiles([]); setZipName(''); setOut(null); setShowAll(false) }

  // Windows "Open with → ToolBoxy Zip" (installed PWA + Chromium only): the OS hands
  // us the chosen files via the File Handling API — drop them straight into the list.
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const lq = (window as any).launchQueue
    if (!lq?.setConsumer) return
    lq.setConsumer(async (p: any) => {
      if (!p?.files?.length) return
      const got: File[] = []
      for (const h of p.files) { try { got.push(await h.getFile()) } catch { /* skip unreadable */ } }
      if (got.length) add(got)
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Accept files dropped ANYWHERE on the page (a drop outside the box otherwise let the
  // browser open the file). preventDefault on dragover stops that navigation.
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() }
    const drop = (e: DragEvent) => { const fs = e.dataTransfer?.files; if (fs && fs.length) { e.preventDefault(); add(fs) } }
    window.addEventListener('dragover', over); window.addEventListener('drop', drop)
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fileName = () => `${(zipName || 'archive').replace(/[\\/:*?"<>|]+/g, '').trim() || 'archive'}.zip`
  function downloadUrl(url: string, name: string) { const a = document.createElement('a'); a.href = url; a.download = name; a.click(); trackToolDownload('zip-files', 'zip') }

  async function make() {
    if (!files.length) return
    setBusy(true); setOut(null); trackToolUsed('zip-files')
    try {
      const { zipSync } = await import('fflate')
      const data: Record<string, Uint8Array> = {}
      for (const f of files) {
        const orig = relPath(f); let key = orig, i = 1
        while (key in data) { const d = orig.lastIndexOf('.'); key = d > 0 ? `${orig.slice(0, d)} (${i})${orig.slice(d)}` : `${orig} (${i})`; i++ }
        data[key] = new Uint8Array(await f.arrayBuffer())
      }
      const blob = new Blob([zipSync(data, { level: level as 0 | 6 | 9 })], { type: 'application/zip' })
      const url = URL.createObjectURL(blob), name = fileName()
      setOut({ url, size: blob.size, n: files.length, name })
      downloadUrl(url, name) // auto-download once it's ready
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }

  const totalSize = files.reduce((s, f) => s + f.size, 0)
  const shown = showAll ? files : files.slice(0, LIMIT)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div onClick={() => inputRef.current?.click()} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
          <input ref={inputRef} type="file" multiple className="hidden" onClick={(e) => e.stopPropagation()} onChange={(e) => { add(e.target.files); e.target.value = '' }} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <input ref={dirRef} type="file" className="hidden" {...({ webkitdirectory: '', directory: '' } as any)} onClick={(e) => e.stopPropagation()} onChange={(e) => { add(e.target.files); e.target.value = '' }} />
          <p className="text-4xl mb-2">🗂️</p><p className="text-sm font-medium text-gray-600">{t('zf_drop')}</p>
          <div className="flex justify-center gap-2 mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); dirRef.current?.click() }} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">{t('ui_pick_folder')}</button>
          </div>
        </div>

        {files.length > 0 && (
          <>
            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 max-h-72 overflow-auto">
              {shown.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 text-sm">
                  <span className="flex-1 truncate text-gray-700">{relPath(f)}</span>
                  <span className="text-gray-400 shrink-0">{fmt(f.size)}</span>
                  <button onClick={() => removeAt(i)} className="text-gray-300 hover:text-rose-500 shrink-0 inline-flex items-center justify-center" aria-label="remove"><ToolIcon name="x" className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            {files.length > LIMIT && (
              <button onClick={() => setShowAll((v) => !v)} className="w-full text-center text-xs text-brand-600 hover:underline py-0.5">
                {showAll ? t('uz_less') : t('uz_more', { n: files.length - LIMIT })}
              </button>
            )}
            <p className="text-xs text-gray-400">{!showAll && files.length > LIMIT ? t('uz_entries_some', { shown: LIMIT, total: files.length }) : t('zf_files', { n: files.length })} · {fmt(totalSize)}</p>

            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('zf_name')}</label>
              <div className="flex items-center gap-1">
                <input value={zipName} onChange={(e) => setZipName(e.target.value)} placeholder="archive" type="text"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <span className="text-sm text-gray-400">.zip</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('zf_method')}</label>
              <select value={level} onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                <option value={6}>{t('zf_method_normal')}</option>
                <option value={9}>{t('zf_method_max')}</option>
                <option value={0}>{t('zf_method_min')}</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={make} disabled={busy} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">{busy ? t('zf_making') : t('zf_make')}</button>
              <button onClick={clearAll} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{t('zf_clear')}</button>
            </div>
          </>
        )}

        {out && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-green-700">{t('zf_done', { n: out.n, name: out.name })}</span>
            <button onClick={() => downloadUrl(out.url, out.name)} className="shrink-0 self-start sm:self-auto px-4 py-1.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 inline-flex items-center justify-center gap-1.5"><ToolIcon name="download" className="w-4 h-4" />{t('zf_download')}</button>
          </div>
        )}
        {/* Privacy banner — unified with the other file tools */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span>{t('bfr_privacy')}</span>
        </div>
      </div>
    </ToolLayout>
  )
}
