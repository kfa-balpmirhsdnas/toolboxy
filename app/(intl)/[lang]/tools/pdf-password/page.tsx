'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('pdf-password')!

export default function PdfPasswordPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [mode, setMode] = useState<'lock' | 'unlock'>('lock')
  const [file, setFile] = useState<File | null>(null)
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) {
    if (!/pdf$/i.test(f.name) && f.type !== 'application/pdf') return
    setFile(f); setOut(null); setError(''); setPw(''); trackToolUsed('pdf-password')
  }
  function reset() { setFile(null); setOut(null); setError(''); setPw('') }

  async function run() {
    if (!file || !pw) return
    setBusy(true); setOut(null); setError('')
    try {
      const { PDFDocument } = await import('@cantoo/pdf-lib')
      const bytes = new Uint8Array(await file.arrayBuffer())
      let result: Uint8Array
      if (mode === 'lock') {
        let doc
        try { doc = await PDFDocument.load(bytes) } catch { setError(t('pp_err_encrypted')); setBusy(false); return }
        doc.encrypt({ userPassword: pw, ownerPassword: pw })
        result = await doc.save()
      } else {
        let src
        try { src = await PDFDocument.load(bytes, { password: pw }) } catch { setError(t('pp_err_wrongpw')); setBusy(false); return }
        const fresh = await PDFDocument.create() // copy pages into a clean doc → drops encryption
        const pages = await fresh.copyPages(src, src.getPageIndices())
        pages.forEach((p) => fresh.addPage(p))
        result = await fresh.save()
      }
      const blob = new Blob([result as unknown as BlobPart], { type: 'application/pdf' })
      const base = file.name.replace(/\.pdf$/i, '')
      setOut({ url: URL.createObjectURL(blob), name: `${base}-${mode === 'lock' ? 'protected' : 'unlocked'}.pdf` })
      trackToolDownload('pdf-password', mode)
    } catch (e) {
      console.error(e); setError(t('md_error'))
    } finally {
      setBusy(false)
    }
  }

  function download() { if (!out) return; const a = document.createElement('a'); a.href = out.url; a.download = out.name; a.click() }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-300">
          {(['lock', 'unlock'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setOut(null); setError(''); setPw('') }}
              className={'flex-1 py-2.5 text-sm font-semibold transition ' + (mode === m ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}>
              {m === 'lock' ? '🔒 ' + t('pp_lock') : '🔓 ' + t('pp_unlock')}
            </button>
          ))}
        </div>

        {!file ? (
          <div onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">📄</p>
            <p className="text-sm font-medium text-gray-600">{t('pp_drop')}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm">
              <span className="text-xl">📄</span>
              <span className="flex-1 truncate text-gray-700">{file.name}</span>
              <button onClick={reset} className="text-gray-400 hover:text-rose-500 shrink-0">✕</button>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{mode === 'lock' ? t('pp_pw_set') : t('pp_pw_enter')}</label>
              <div className="flex items-center gap-1">
                <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => { setPw(e.target.value); setOut(null); setError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') run() }} autoComplete="off"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-400" />
                <button onClick={() => setShow((s) => !s)} className="px-3 py-2 text-gray-400 hover:text-gray-600" aria-label="show/hide">{show ? '🙈' : '👁'}</button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            <div className="flex gap-2">
              {!out ? (
                <button onClick={run} disabled={busy || !pw}
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40">
                  {busy ? t('md_processing') : mode === 'lock' ? t('pp_lock_btn') : t('pp_unlock_btn')}
                </button>
              ) : (
                <button onClick={download} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">{t('md_download')}</button>
              )}
            </div>
          </>
        )}
        <p className="text-xs text-gray-400 text-center">{t('md_note_local')}</p>
      </div>
    </ToolLayout>
  )
}
