'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('zip-files')!
const fmt = (b: number) => (b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(2) + ' MB')
const relPath = (f: File) => (f as File & { __path?: string; webkitRelativePath?: string }).__path || (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
const baseName = (s: string) => s.replace(/\.[^./\\]+$/, '')

export default function ZipFilesPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [files, setFiles] = useState<File[]>([])
  const [zipName, setZipName] = useState('')
  const [out, setOut] = useState<{ url: string; size: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
    const out: File[] = []
    const walk = async (entry: any, prefix: string) => {
      if (entry.isFile) {
        const file: File = await new Promise((res, rej) => entry.file(res, rej))
        try { (file as any).__path = prefix + entry.name } catch { /* read-only on some engines */ }
        out.push(file)
      } else if (entry.isDirectory) {
        const reader = entry.createReader()
        const readAll = () => new Promise<any[]>((res) => reader.readEntries((r: any[]) => res(r), () => res([])))
        let batch = await readAll()
        while (batch.length) { for (const c of batch) await walk(c, prefix + entry.name + '/'); batch = await readAll() }
      }
    }
    for (const e of entries) await walk(e, '')
    if (out.length) add(out)
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
  function clearAll() { setFiles([]); setZipName(''); setOut(null) }

  const fileName = () => `${(zipName || 'archive').replace(/[\\/:*?"<>|]+/g, '').trim() || 'archive'}.zip`
  function triggerDownload(url: string) { const a = document.createElement('a'); a.href = url; a.download = fileName(); a.click(); trackToolDownload('zip-files', 'zip') }

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
      const blob = new Blob([zipSync(data, { level: 6 })], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      setOut({ url, size: blob.size })
      triggerDownload(url) // auto-download once it's ready
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }

  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('zf_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('zf_subtitle')}</p>
        </div>

        <div onClick={() => inputRef.current?.click()} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = '' }} />
          <p className="text-4xl mb-2">🗂️</p><p className="text-sm font-medium text-gray-600">{t('zf_drop')}</p>
        </div>

        {files.length > 0 && (
          <>
            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 max-h-60 overflow-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 text-sm">
                  <span className="flex-1 truncate text-gray-700">{relPath(f)}</span>
                  <span className="text-gray-400 shrink-0">{fmt(f.size)}</span>
                  <button onClick={() => removeAt(i)} className="text-gray-300 hover:text-rose-500 shrink-0">✕</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">{t('zf_files', { n: files.length })} · {fmt(totalSize)}</p>

            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('zf_name')}</label>
              <div className="flex items-center gap-1">
                <input value={zipName} onChange={(e) => setZipName(e.target.value)} placeholder="archive" type="text"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <span className="text-sm text-gray-400">.zip</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={make} disabled={busy} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">{busy ? t('zf_making') : t('zf_make')}</button>
              <button onClick={clearAll} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{t('zf_clear')}</button>
            </div>
          </>
        )}

        {out && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 truncate">{fileName()} · {fmt(out.size)}</span>
            <button onClick={() => triggerDownload(out.url)} className="shrink-0 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">⬇ {t('zf_download')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('zf_note')}</p>
      </div>
    </ToolLayout>
  )
}
