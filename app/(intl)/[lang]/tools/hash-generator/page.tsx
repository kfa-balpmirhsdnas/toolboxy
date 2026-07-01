'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import SparkMD5 from 'spark-md5'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('hash-generator')!
const SHA = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']
const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')

export default function HashGeneratorPage() {
  const t = useTranslations('toolui')
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)

  async function hashBuffer(data: ArrayBuffer) {
    const results: Record<string, string> = { MD5: SparkMD5.ArrayBuffer.hash(data) }
    for (const algo of SHA) results[algo] = hex(await crypto.subtle.digest(algo, data))
    return results
  }

  async function fromText(text: string) {
    setSource(''); setInput(text)
    if (!text) { setHashes({}); return }
    setLoading(true)
    setHashes(await hashBuffer(new TextEncoder().encode(text).buffer))
    setLoading(false); trackToolUsed('hash-generator')
  }

  async function fromFile(f: File | undefined | null) {
    if (!f) return
    setLoading(true); setInput(''); setSource(`${f.name} (${(f.size / 1024).toFixed(0)} KB)`)
    setHashes(await hashBuffer(await f.arrayBuffer()))
    setLoading(false); trackToolUsed('hash-generator')
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('btc_text')}</label>
          <textarea value={input} onChange={(e) => fromText(e.target.value)} placeholder={t('hg_ph')} rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-400 focus:border-transparent font-mono text-sm" />
        </div>

        <div onDrop={(e) => { e.preventDefault(); fromFile(e.dataTransfer.files[0]) }} onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50"
          onClick={() => document.getElementById('hash-file')?.click()}>
          <input id="hash-file" type="file" className="hidden" onChange={(e) => fromFile(e.target.files?.[0])} />
          <p className="text-2xl mb-1">🔑</p>
          <p className="text-sm text-gray-600">{source || t('hg_drop')}</p>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); document.getElementById('hash-file')?.click() }} className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700">{t('ui_pick_files')}</button>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-500">{t('hg_computing')}</p>}
        {Object.entries(hashes).map(([algo, hash]) => (
          <div key={algo} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">{algo}</span>
              <button onClick={() => navigator.clipboard?.writeText(hash)} className="text-xs text-brand-600 hover:text-brand-800">{t('ui_copy')}</button>
            </div>
            <p className="font-mono text-xs text-gray-600 break-all">{hash}</p>
          </div>
        ))}
      </div>
    </ToolLayout>
  )
}
