'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('ocr')!
const LANGS: [string, string][] = [['kor', '한국어'], ['eng', 'English'], ['jpn', '日本語'], ['kor+eng', '한국어+English']]

export default function OcrPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [src, setSrc] = useState('')
  const [lang, setLang] = useState('kor+eng')
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState(0)
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function load(f: File) { fileRef.current = f; setSrc(URL.createObjectURL(f)); setText(''); trackToolUsed('ocr') }

  async function run() {
    if (!fileRef.current) return
    setBusy(true); setProg(0); setText('')
    try {
      const Tesseract = (await import('tesseract.js')).default
      const { data } = await Tesseract.recognize(fileRef.current, lang, { logger: (m: { status: string; progress: number }) => { if (m.status === 'recognizing text') setProg(Math.round(m.progress * 100)) } })
      setText(data.text.trim() || t('ok_empty'))
    } catch (e) { console.error(e); setText(t('ok_error')) } finally { setBusy(false) }
  }
  function copy() { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ok_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ok_subtitle')}</p>
        </div>

        {!src ? (
          <div onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
            <p className="text-4xl mb-2">🔤</p><p className="text-sm font-medium text-gray-600">{t('ok_drop')}</p>
          </div>
        ) : (
          <>
            <img src={src} alt="" className="w-full rounded-xl border border-gray-200 max-h-60 object-contain bg-gray-50" />
            <div className="flex flex-wrap gap-2 items-center">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button onClick={run} disabled={busy} className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">{busy ? t('ok_running', { n: prog }) : t('ok_run')}</button>
              <button onClick={() => setSrc('')} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">{t('ok_change')}</button>
            </div>
            {text && (
              <div className="space-y-2">
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <button onClick={copy} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{copied ? `✓ ${t('ok_copied')}` : t('ok_copy')}</button>
              </div>
            )}
          </>
        )}
        <p className="text-xs text-gray-400">{t('ok_note')}</p>
      </div>
    </ToolLayout>
  )
}
