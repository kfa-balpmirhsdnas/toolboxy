'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('docx-to-odt')!

const WARN_MB = 20 // soft warning only — big docx + the 56MB engine can strain browser memory
const fmtBytes = (b: number) => (b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB')

export default function DocxToOdtPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'' | 'engine' | 'converting'>('')
  const [out, setOut] = useState<{ url: string; size: number; name: string } | null>(null)
  const [error, setError] = useState<{ msg: string; retry: boolean } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) {
    if (!/\.docx$/i.test(f.name)) { setError({ msg: t('dxo_not_docx'), retry: false }); return }
    setFile(f); setError(null)
    setOut((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null })
    trackToolUsed('docx-to-odt')
  }

  async function convert() {
    if (!file || status) return
    setError(null)
    setOut((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null })
    let stage: 'engine' | 'converting' = 'engine' // local mirror — the `status` closure var is stale inside catch
    setStatus('engine')
    try {
      const { convertDoc } = await import('@/lib/tools/pandoc') // engine module + 56MB wasm lazy-load here
      stage = 'converting'
      setStatus('converting')
      // Yield a frame so the "변환 중" label paints before the (synchronous) conversion runs.
      await new Promise((r) => setTimeout(r, 30))
      const blob = await convertDoc(file, 'docx', 'odt')
      const odt = new Blob([blob], { type: 'application/vnd.oasis.opendocument.text' })
      const name = file.name.replace(/\.docx$/i, '') + '.odt'
      const url = URL.createObjectURL(odt)
      setOut({ url, size: odt.size, name })
      // auto-download on success (spec) — the button below re-downloads
      const a = document.createElement('a')
      a.href = url; a.download = name; a.click()
      trackToolDownload('docx-to-odt', 'odt')
    } catch (e) {
      console.error(e)
      const msg = (e as Error)?.message || ''
      // engine fetch/instantiate failures are retryable; pandoc parse errors are not
      const engineFail = /fetch|network|instantiat|memory|abort/i.test(msg) || stage === 'engine'
      if (engineFail) { const { resetPandoc } = await import('@/lib/tools/pandoc'); resetPandoc() }
      setError({ msg: (engineFail ? t('dxo_engine_fail') : t('dxo_convert_fail')) + (msg ? ` (${msg.slice(0, 140)})` : ''), retry: engineFail })
    } finally {
      setStatus('')
    }
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {/* Drop zone */}
        <div onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
          <input ref={inputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; e.currentTarget.value = ''; if (f) load(f) }} onClick={(e) => e.stopPropagation()} />
          <p className="text-4xl mb-2">📄→📝</p>
          <p className="text-sm font-medium text-gray-600">{file ? file.name + ' · ' + fmtBytes(file.size) : t('dxo_drop')}</p>
          {!file && (
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          )}
        </div>

        {file && file.size > WARN_MB * 1048576 && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">{t('dxo_big_warn', { mb: WARN_MB })}</p>
        )}

        {status && (
          <div className="flex items-center gap-2 text-sm text-brand-600 justify-center py-1">
            <span className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            {status === 'engine' ? t('dxo_engine_loading') : t('dxo_converting')}
          </div>
        )}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
            <p className="break-all">{error.msg}</p>
            {error.retry && <button onClick={convert} className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700">{t('dxo_retry')}</button>}
          </div>
        )}
        {out && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
            ✅ {out.name} · {fmtBytes(out.size)} — {t('dxo_done')}
          </div>
        )}

        <div className="flex gap-2">
          {!out ? (
            <button onClick={convert} disabled={!file || !!status}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">{t('dxo_convert')}</button>
          ) : (
            <a href={out.url} download={out.name} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">{t('md_download')} .odt</a>
          )}
          {file && (
            <button onClick={() => { setFile(null); setError(null); setOut((p) => { if (p) URL.revokeObjectURL(p.url); return null }) }} disabled={!!status}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 inline-flex items-center justify-center disabled:opacity-40" aria-label="reset"><ToolIcon name="refresh" className="w-4 h-4" /></button>
          )}
        </div>

        {/* Fidelity note: structure converts well; pixel-perfect layout doesn't (pandoc converts via its AST) */}
        <p className="text-xs text-gray-400">{t('dxo_fidelity')}</p>
        <p className="text-xs text-gray-400">{t('dxo_first_load')}</p>

        {/* Privacy banner */}
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
          <span>{t('md_note_local')}</span>
        </div>

        {/* Related tools */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {([['markdown-to-html', '📝', 'Markdown → HTML'], ['word-counter', '🔢', t('dxo_rel_counter')], ['zip-files', '🗜️', t('dxo_rel_zip')]] as const).map(([slug, icon, label]) => (
            <a key={slug} href={`/${params.lang}/tools/${slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-brand-300"><span>{icon}</span><span>{label}</span></a>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
