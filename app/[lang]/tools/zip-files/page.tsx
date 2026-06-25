'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('zip-files')!
const fmt = (b: number) => (b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(2) + ' MB')

export default function ZipFilesPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [files, setFiles] = useState<File[]>([])
  const [out, setOut] = useState<{ url: string; size: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function add(list: FileList | null) { if (!list) return; setFiles((f) => [...f, ...Array.from(list)]); setOut(null) }
  function removeAt(i: number) { setFiles((f) => f.filter((_, k) => k !== i)); setOut(null) }

  async function make() {
    if (!files.length) return
    setBusy(true); setOut(null); trackToolUsed('zip-files')
    try {
      const { zipSync } = await import('fflate')
      const data: Record<string, Uint8Array> = {}
      for (const f of files) {
        let name = f.name, i = 1
        while (name in data) { const d = f.name.lastIndexOf('.'); name = d > 0 ? `${f.name.slice(0, d)} (${i})${f.name.slice(d)}` : `${f.name} (${i})`; i++ }
        data[name] = new Uint8Array(await f.arrayBuffer())
      }
      const zipped = zipSync(data, { level: 6 })
      const blob = new Blob([zipped], { type: 'application/zip' })
      setOut({ url: URL.createObjectURL(blob), size: blob.size })
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }
  function download() { if (!out) return; const a = document.createElement('a'); a.href = out.url; a.download = 'archive.zip'; a.click(); trackToolDownload('zip-files', 'zip') }

  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('zf_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('zf_subtitle')}</p>
        </div>

        <div onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = '' }} />
          <p className="text-4xl mb-2">🗂️</p><p className="text-sm font-medium text-gray-600">{t('zf_drop')}</p>
        </div>

        {files.length > 0 && (
          <>
            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 max-h-60 overflow-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 text-sm">
                  <span className="flex-1 truncate text-gray-700">{f.name}</span>
                  <span className="text-gray-400 shrink-0">{fmt(f.size)}</span>
                  <button onClick={() => removeAt(i)} className="text-gray-300 hover:text-rose-500 shrink-0">✕</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">{t('zf_files', { n: files.length })} · {fmt(totalSize)}</p>
            <div className="flex gap-2">
              <button onClick={make} disabled={busy} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">{busy ? t('zf_making') : t('zf_make')}</button>
              <button onClick={() => { setFiles([]); setOut(null) }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">{t('zf_clear')}</button>
            </div>
          </>
        )}

        {out && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">archive.zip · {fmt(out.size)}</span>
            <button onClick={download} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">⬇ {t('zf_download')}</button>
          </div>
        )}
        <p className="text-xs text-gray-400">{t('zf_note')}</p>
      </div>
    </ToolLayout>
  )
}
