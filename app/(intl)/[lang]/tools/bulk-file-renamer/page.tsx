'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import RenameRulesPanel from '@/components/tools/RenameRulesPanel'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { buildNewName, DEFAULT_RULES, type RenameRules } from '@/lib/batch-image/rename'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('bulk-file-renamer')!
// File defaults differ from the image tool only in the sample prefix.
const FILE_DEFAULTS: RenameRules = { ...DEFAULT_RULES, prefix: 'file_' }
const SAMPLE_NAMES = ['Report문서.PDF', 'Q3 data.xlsx', 'archive backup.zip']
const fmtBytes = (b: number) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(2) + ' MB')
const extOf = (name: string) => { const d = name.lastIndexOf('.'); return d > 0 ? name.slice(d + 1).toLowerCase() : '' }

function dedupe(name: string, used: Set<string>): string {
  if (!used.has(name)) { used.add(name); return name }
  const d = name.lastIndexOf('.'); const base = d > 0 ? name.slice(0, d) : name; const ext = d > 0 ? name.slice(d) : ''
  let i = 1; let c = `${base} (${i})${ext}`
  while (used.has(c)) { i++; c = `${base} (${i})${ext}` }
  used.add(c); return c
}

export default function BulkFileRenamerPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [r, setR] = useState<RenameRules>(FILE_DEFAULTS)
  const up = useCallback((patch: Partial<RenameRules>) => setR((prev) => ({ ...prev, ...patch })), [])
  const [files, setFiles] = useState<File[]>([])
  const [skipExts, setSkipExts] = useState<Set<string>>(() => new Set()) // extensions to leave unrenamed
  const [busy, setBusy] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const LIMIT = 12

  function add(list: FileList | File[] | null) {
    if (!list || !list.length) return
    const arr = Array.from(list) // snapshot now — a FileList empties once the event ends / input is reset
    setFiles((prev) => [...prev, ...arr])
  }
  function removeAt(i: number) { setFiles((f) => f.filter((_, k) => k !== i)) }
  function clearAll() { setFiles([]); setSkipExts(new Set()) }

  // Accept files dropped ANYWHERE on the page.
  useEffect(() => {
    const over = (e: DragEvent) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault() }
    const drop = (e: DragEvent) => { const fs = e.dataTransfer?.files; if (fs && fs.length) { e.preventDefault(); add(fs) } }
    window.addEventListener('dragover', over); window.addEventListener('drop', drop)
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop) }
  }, [])

  const exts = Array.from(new Set(files.map((f) => extOf(f.name) || '—')))
  const willRename = (name: string) => !skipExts.has(extOf(name) || '—')
  function toggleExt(e: string) { setSkipExts((s) => { const n = new Set(s); n.has(e) ? n.delete(e) : n.add(e); return n }) }

  // New name per file: rename rules apply only to non-skipped extensions; the rest keep their name.
  function newNames(): string[] {
    let ri = 0
    return files.map((f) => (willRename(f.name) ? buildNewName(f.name, ri++, r) : f.name))
  }

  async function download() {
    if (!files.length) return
    setBusy(true); trackToolUsed('bulk-file-renamer')
    try {
      const { zip } = await import('fflate')
      const names = newNames(); const used = new Set<string>()
      const entries: Record<string, Uint8Array> = {}
      for (let i = 0; i < files.length; i++) entries[dedupe(names[i], used)] = new Uint8Array(await files[i].arrayBuffer())
      const data: Uint8Array = await new Promise((res, rej) => zip(entries, { level: 0 }, (err, d) => (err ? rej(err) : res(d))))
      const url = URL.createObjectURL(new Blob([data as BlobPart], { type: 'application/zip' }))
      const a = document.createElement('a'); a.href = url; a.download = 'renamed.zip'; a.click()
      URL.revokeObjectURL(url); trackToolDownload('bulk-file-renamer', 'zip')
    } finally { setBusy(false) }
  }

  const names = newNames()
  const shown = showAll ? files : files.slice(0, LIMIT)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* The tool name + tags come from ToolLayout's own header (no duplicate <h1> here). */}
        {/* Rename rules (shared with batch-image-rename) */}
        <RenameRulesPanel rules={r} onChange={up} sampleNames={SAMPLE_NAMES} />

        {/* Drop zone */}
        <div onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = '' }} />
          <p className="text-4xl mb-2">📁</p>
          <p className="text-sm font-medium text-gray-600">{t('bfr_drop')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('bfr_drop_sub')}</p>
        </div>

        <p className="text-xs text-center text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg py-1.5">🔒 {t('bfr_privacy')}</p>

        {files.length > 0 && (
          <>
            {/* Extension filter — only when types are mixed */}
            {exts.length > 1 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">{t('bfr_ext_filter')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {exts.map((e) => (
                    <button key={e} onClick={() => toggleExt(e)}
                      className={'px-2.5 py-1 rounded-lg text-xs font-medium border ' + (skipExts.has(e) ? 'border-gray-200 text-gray-300 line-through' : 'border-brand-300 bg-brand-50 text-brand-700')}>
                      .{e === '—' ? '∅' : e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{t('bfr_files_n', { n: files.length })}</p>
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-lg px-2 py-1 transition-colors"><ToolIcon name="trash" className="w-3.5 h-3.5" />{t('ui_clear')}</button>
            </div>

            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {shown.map((f, i) => {
                const renamed = willRename(f.name)
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-gray-400 text-xs">{f.name}</p>
                      <p className={'truncate font-mono ' + (renamed ? 'text-gray-800' : 'text-gray-400')}>{renamed ? '↳ ' : ''}{names[i]}{!renamed && <span className="ml-1 text-[10px] text-gray-300">({t('bfr_kept')})</span>}</p>
                    </div>
                    <span className="text-gray-400 text-xs shrink-0">{fmtBytes(f.size)}</span>
                    <button onClick={() => removeAt(i)} aria-label={t('ui_clear')} className="text-gray-300 hover:text-red-500 shrink-0">✕</button>
                  </div>
                )
              })}
            </div>
            {files.length > LIMIT && (
              <button onClick={() => setShowAll((v) => !v)} className="w-full text-center text-xs text-brand-600 hover:underline py-0.5">
                {showAll ? t('uz_less') : t('uz_more', { n: files.length - LIMIT })}
              </button>
            )}

            <button onClick={download} disabled={busy}
              className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {busy ? t('bfr_zipping') : t('bfr_cta', { n: files.length })}
            </button>
          </>
        )}

        {/* zip-rename notice — at the bottom */}
        <p className="text-sm rounded-xl bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5">ℹ️ {t('bfr_zip_note')}</p>
      </div>
    </ToolLayout>
  )
}
