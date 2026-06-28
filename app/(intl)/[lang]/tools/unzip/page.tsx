'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('unzip')!
const fmt = (b: number) => (b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(2) + ' MB')

type Entry = { name: string; data: Uint8Array; size: number }

export default function UnzipPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [name, setName] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [makeFolder, setMakeFolder] = useState(true)
  const [done, setDone] = useState<{ folder: string; n: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const LIMIT = 10

  async function load(f: File) {
    setName(f.name); setError(''); setEntries([]); setShowAll(false); setDone(null); trackToolUsed('unzip')
    try {
      const { unzipSync } = await import('fflate')
      const buf = new Uint8Array(await f.arrayBuffer())
      const un = unzipSync(buf)
      const list: Entry[] = Object.entries(un)
        .filter(([n, d]) => !n.endsWith('/') && (d as Uint8Array).length >= 0)
        .map(([n, d]) => ({ name: n, data: d as Uint8Array, size: (d as Uint8Array).length }))
        .sort((a, b) => a.name.localeCompare(b.name))
      if (!list.length) setError(t('uz_empty')); else setEntries(list)
    } catch (e) { console.error(e); setError(t('uz_error')) }
  }

  // Windows "Open with → ToolBoxy Unzip" (installed PWA + Chromium only): open the
  // .zip the OS launched us with. All in-browser — nothing is uploaded.
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const lq = (window as any).launchQueue
    if (!lq?.setConsumer) return
    lq.setConsumer(async (p: any) => {
      const h = p?.files?.[0]
      if (!h) return
      try { load(await h.getFile()) } catch { /* skip unreadable */ }
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function download(e: Entry) {
    const blob = new Blob([e.data as unknown as BlobPart])
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = e.name.split('/').pop() || e.name; a.click()
    trackToolDownload('unzip', 'file')
  }

  // Write one entry into a chosen directory, creating sub-folders for nested paths.
  async function writeInto(dir: FileSystemDirectoryHandle, pathStr: string, data: Uint8Array) {
    const parts = pathStr.split('/').filter(Boolean)
    const fname = parts.pop()!
    let d = dir
    for (const p of parts) d = await d.getDirectoryHandle(p, { create: true })
    const fh = await d.getFileHandle(fname, { create: true })
    const w = await fh.createWritable()
    await w.write(data as unknown as BufferSource); await w.close()
  }

  async function extractAll() {
    // Preferred (desktop Chromium): create a folder named after the zip and extract into it.
    const picker = (window as unknown as { showDirectoryPicker?: (o?: object) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker
    if (picker) {
      try {
        const root = await picker({ mode: 'readwrite' })
        let target = root, label = root.name
        if (makeFolder) {
          const folder = (name.replace(/\.zip$/i, '') || 'extracted').replace(/[\\/:*?"<>|]+/g, '_')
          target = await root.getDirectoryHandle(folder, { create: true })
          label = `${root.name}/${folder}`
        }
        for (const e of entries) await writeInto(target, e.name, e.data)
        setDone({ folder: label, n: entries.length }) // include the picked parent so it's easy to locate
        trackToolDownload('unzip', 'folder')
        return
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') return // user cancelled the picker
        console.error(err) // fall through to per-file download
      }
    }
    // Fallback (Firefox/Safari/mobile): download each file individually.
    entries.forEach((e, i) => setTimeout(() => download(e), i * 200))
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('uz_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('uz_subtitle')}</p>
        </div>

        <div onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
          <input ref={inputRef} type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
          <p className="text-4xl mb-2">📦</p><p className="text-sm font-medium text-gray-600">{name || t('uz_drop')}</p>
        </div>

        {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}

        {entries.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{!showAll && entries.length > LIMIT ? t('uz_entries_some', { shown: LIMIT, total: entries.length }) : t('uz_entries', { n: entries.length })}</p>
              <button onClick={extractAll} className="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">📂 {t('uz_downloadall')}</button>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input type="checkbox" checked={makeFolder} onChange={(e) => setMakeFolder(e.target.checked)} className="w-4 h-4 accent-brand-600" />
              {t('uz_makefolder')}
            </label>

            {done && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">{t('uz_extracted', { folder: done.folder, n: done.n })}</p>}
            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 max-h-72 overflow-auto">
              {(showAll ? entries : entries.slice(0, LIMIT)).map((e, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 text-sm">
                  <span className="flex-1 truncate text-gray-700">{makeFolder && <span className="text-gray-400">{(name.replace(/\.zip$/i, '') || 'extracted')}/</span>}{e.name}</span>
                  <span className="text-gray-400 shrink-0">{fmt(e.size)}</span>
                  <button onClick={() => download(e)} className="shrink-0 px-2.5 py-1 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">⬇</button>
                </div>
              ))}
            </div>
            {entries.length > LIMIT && (
              <button onClick={() => setShowAll((v) => !v)} className="w-full text-center text-xs text-brand-600 hover:underline py-1">
                {showAll ? t('uz_less') : t('uz_more', { n: entries.length - LIMIT })}
              </button>
            )}
          </>
        )}
        <p className="text-xs text-gray-400">{t('uz_note')}</p>
      </div>
    </ToolLayout>
  )
}
