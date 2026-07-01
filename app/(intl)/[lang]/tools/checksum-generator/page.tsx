'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('checksum-generator')!

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
const ALGOS: Algo[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

function fmtBytes(b: number) {
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(2) + ' MB'
}

async function hashBuffer(buf: ArrayBuffer, algo: Algo): Promise<string> {
  const digest = await crypto.subtle.digest(algo, buf)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
}

export default function ChecksumGeneratorPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [file, setFile] = useState<File|null>(null)
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'file'|'text'>('file')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [verify, setVerify] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function compute() {
    if (!tracked.current) { trackToolUsed('checksum-generator'); tracked.current = true }
    setLoading(true)
    setHashes({})
    try {
      let buf: ArrayBuffer
      if (mode === 'file' && file) {
        buf = await file.arrayBuffer()
      } else {
        buf = new TextEncoder().encode(text).buffer
      }
      const results: Record<string, string> = {}
      for (const algo of ALGOS) {
        results[algo] = await hashBuffer(buf, algo)
      }
      setHashes(results)
    } catch (e: unknown) {
      console.error(e)
    }
    setLoading(false)
  }

  async function copy(val: string, key: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('checksum-generator')
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const verifyLower = verify.trim().toLowerCase()
  const verifyMatch = verifyLower ? Object.values(hashes).some(h => h === verifyLower) : null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          {(['file','text'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setHashes({}) }}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (mode===m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {m === 'file' ? t('cks_file') : t('btc_text')}
            </button>
          ))}
        </div>
        {mode === 'file' ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
          >
            <input ref={inputRef} type="file" className="hidden" onChange={e => { setFile(e.target.files?.[0] || null); setHashes({}) }} />
            {file ? (
              <p className="text-sm font-medium text-gray-700">{file.name} <span className="text-gray-400">({fmtBytes(file.size)})</span></p>
            ) : (
              <>
                <p className="text-3xl mb-2">&#x1F4C4;</p>
                <p className="text-sm font-medium text-gray-600">{t('cks_select')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('cks_private')}</p>
              </>
            )}
            <div className="flex justify-center mt-4">
              <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
            </div>
          </div>
        ) : (
          <textarea value={text} onChange={e => { setText(e.target.value); setHashes({}) }}
            rows={4} placeholder={t('hg_ph')}
            className="w-full p-4 border border-gray-200 rounded-xl resize-none text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
        )}
        <button
          onClick={compute}
          disabled={(mode==='file' ? !file : !text.trim()) || loading}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          {loading ? t('hg_computing') : t('cks_generate')}
        </button>
        {Object.keys(hashes).length > 0 && (
          <div className="space-y-2">
            {ALGOS.map(algo => (
              <div key={algo} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase">{algo}</span>
                  <button onClick={() => copy(hashes[algo], algo)}
                    className="text-xs text-brand-600 hover:underline">
                    {copied===algo ? t('ui_copied') : t('ui_copy')}
                  </button>
                </div>
                <p className="text-xs font-mono text-gray-700 break-all">{hashes[algo]}</p>
              </div>
            ))}
          </div>
        )}
        {/* Verify */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('cks_verify')}</label>
          <input value={verify} onChange={e => setVerify(e.target.value)}
            placeholder={t('cks_verify_ph')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          {verifyMatch !== null && Object.keys(hashes).length > 0 && (
            <p className={'mt-2 text-sm font-semibold ' + (verifyMatch ? 'text-green-600' : 'text-red-600')}>
              {verifyMatch ? t('cks_match') : t('cks_nomatch')}
            </p>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
