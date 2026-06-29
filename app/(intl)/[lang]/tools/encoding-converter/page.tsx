'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import ToolIcon from '@/components/tools/ToolIcon'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolDownload } from '@/lib/gtag'

const tool = getToolBySlug('encoding-converter')!
const SOURCES: [string, string][] = [['auto', 'Auto-detect'], ['utf-8', 'UTF-8'], ['euc-kr', 'EUC-KR / CP949'], ['shift_jis', 'Shift_JIS'], ['gbk', 'GBK'], ['utf-16le', 'UTF-16'], ['iso-8859-1', 'ISO-8859-1 (Latin-1)']]
const TARGETS: [string, string][] = [['utf-8', 'UTF-8'], ['utf-8-bom', 'UTF-8 + BOM (Excel)'], ['euc-kr', 'EUC-KR / CP949'], ['shift_jis', 'Shift_JIS'], ['gbk', 'GBK'], ['utf-16le', 'UTF-16'], ['iso-8859-1', 'ISO-8859-1 (Latin-1)']]
const CP: Record<string, number> = { 'euc-kr': 949, shift_jis: 932, gbk: 936, 'utf-16le': 1200, 'iso-8859-1': 28591 }

function detect(b: Uint8Array): string {
  if (b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) return 'utf-8'
  try { new TextDecoder('utf-8', { fatal: true }).decode(b); return 'utf-8' } catch { return 'euc-kr' }
}
function decode(enc: string, bytes: Uint8Array): string {
  let b = bytes
  if (enc === 'utf-8' && b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) b = b.subarray(3)
  return new TextDecoder(enc).decode(b)
}
async function encode(enc: string, str: string): Promise<Uint8Array> {
  if (enc === 'utf-8') return new TextEncoder().encode(str)
  if (enc === 'utf-8-bom') { const u = new TextEncoder().encode(str); const o = new Uint8Array(u.length + 3); o.set([0xEF, 0xBB, 0xBF]); o.set(u, 3); return o }
  const mod = await import('codepage') as unknown as { default?: { utils: { encode: (cp: number, s: string) => number[] } }; utils?: { encode: (cp: number, s: string) => number[] } }
  const cptable = (mod.default ?? mod) as { utils: { encode: (cp: number, s: string) => number[] } }
  return Uint8Array.from(cptable.utils.encode(CP[enc], str))
}

export default function EncodingConverterPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null)
  const [src, setSrc] = useState('auto')
  const [tgt, setTgt] = useState('utf-8-bom')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  function preview(bytes: Uint8Array, s: string) { try { setText(decode(s === 'auto' ? detect(bytes) : s, bytes)) } catch { setText('') } }
  async function load(f: File | undefined | null) {
    if (!f) return
    const bytes = new Uint8Array(await f.arrayBuffer())
    setFile({ name: f.name, bytes }); preview(bytes, src); trackToolUsed('encoding-converter')
  }
  function changeSrc(s: string) { setSrc(s); if (file) preview(file.bytes, s) }

  async function download() {
    if (!file) return
    setBusy(true)
    try {
      const out = await encode(tgt, text)
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([out as BlobPart])); a.download = file.name; a.click()
      trackToolDownload('encoding-converter', 'file')
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }

  const detected = file ? (src === 'auto' ? detect(file.bytes) : src) : null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ec_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('ec_subtitle')}</p>
        </div>

        <div onClick={() => document.getElementById('ec-file')?.click()} onDrop={(e) => { e.preventDefault(); load(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-7 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
          <input id="ec-file" type="file" accept=".txt,.csv,.srt,.json,.xml,.html,.md,text/*" className="hidden" onChange={(e) => { load(e.target.files?.[0]); e.target.value = '' }} />
          <p className="text-3xl mb-1">📄</p><p className="text-sm font-medium text-gray-600">{file ? file.name : t('ec_drop')}</p>
        </div>

        {file && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('ec_source')}</label>
                <select value={src} onChange={(e) => changeSrc(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  {SOURCES.map(([v, l]) => <option key={v} value={v}>{v === 'auto' ? `${l}${detected ? ` → ${detected.toUpperCase()}` : ''}` : l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('ec_target')}</label>
                <select value={tgt} onChange={(e) => setTgt(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                  {TARGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('ec_preview')}</label>
              <textarea value={text} readOnly rows={6} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono bg-gray-50" />
            </div>

            <button onClick={download} disabled={busy} className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"><ToolIcon name="download" className="w-4 h-4" />{t('ec_download')}</button>
          </>
        )}
        <p className="text-xs text-gray-400">{t('ec_note')}</p>
      </div>
    </ToolLayout>
  )
}
