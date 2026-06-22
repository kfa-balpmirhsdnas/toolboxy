'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('number-base-converter')!

type BaseKey = 'bin' | 'oct' | 'dec' | 'hex'
const BASES: { key: BaseKey; label: string; base: number; prefix: string }[] = [
  { key: 'bin', label: 'Binary (Base 2)', base: 2, prefix: '0b' },
  { key: 'oct', label: 'Octal (Base 8)', base: 8, prefix: '0o' },
  { key: 'dec', label: 'Decimal (Base 10)', base: 10, prefix: '' },
  { key: 'hex', label: 'Hexadecimal (Base 16)', base: 16, prefix: '0x' },
]

function convertFromDec(n: bigint): Record<BaseKey, string> {
  return {
    bin: n < 0n ? '-' + (-n).toString(2) : n.toString(2),
    oct: n < 0n ? '-' + (-n).toString(8) : n.toString(8),
    dec: n.toString(10),
    hex: n < 0n ? '-' + (-n).toString(16).toUpperCase() : n.toString(16).toUpperCase(),
  }
}

export default function NumberBaseConverterPage({ params }: { params: { lang: string } }) {
  const [fromBase, setFromBase] = useState<BaseKey>('dec')
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Record<BaseKey, string> | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const tracked = useRef(false)

  function convert(val: string, base: BaseKey) {
    if (!val.trim()) { setResults(null); setError(''); return }
    if (!tracked.current) { trackToolUsed('number-base-converter'); tracked.current = true }
    try {
      const b = BASES.find(x => x.key === base)!.base
      const cleaned = val.trim().replace(/^0[xXbBoO]/, '')
      const n = BigInt(parseInt(cleaned, b))
      setResults(convertFromDec(n))
      setError('')
    } catch {
      setError('Invalid number for base ' + BASES.find(x => x.key === base)!.base)
      setResults(null)
    }
  }

  function handleInput(v: string) {
    setInput(v)
    convert(v, fromBase)
  }

  function handleBaseChange(b: BaseKey) {
    setFromBase(b)
    setInput('')
    setResults(null)
    setError('')
  }

  async function copy(val: string, key: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('number-base-converter')
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const validChars: Record<BaseKey, string> = {
    bin: '0-1',
    oct: '0-7',
    dec: '0-9, -',
    hex: '0-9, A-F',
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Input Base</label>
          <div className="flex flex-wrap gap-2">
            {BASES.map(({ key, label }) => (
              <button key={key} onClick={() => handleBaseChange(key)}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (fromBase===key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter {BASES.find(b => b.key===fromBase)!.label} number
            <span className="ml-2 text-xs text-gray-400 font-normal">({validChars[fromBase]})</span>
          </label>
          <input
            value={input}
            onChange={e => handleInput(e.target.value)}
            placeholder={fromBase === 'hex' ? 'e.g. FF or 0xFF' : fromBase === 'bin' ? 'e.g. 1010' : fromBase === 'oct' ? 'e.g. 17' : 'e.g. 255'}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        {results && (
          <div className="space-y-2">
            {BASES.map(({ key, label, prefix }) => (
              <div key={key} className={'p-3 rounded-xl border ' + (key===fromBase ? 'bg-brand-50 border-brand-200' : 'bg-gray-50 border-gray-200')}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-gray-500">{label}</span>
                  <button onClick={() => copy(results[key], key)} className="text-xs text-brand-600 hover:underline">
                    {copied===key ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm font-mono font-semibold text-gray-800 break-all">
                  <span className="text-gray-400">{prefix}</span>{results[key]}
                </p>
              </div>
            ))}
          </div>
        )}
        {/* Quick reference */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Quick Reference</p>
          <div className="overflow-x-auto">
            <table className="text-xs font-mono">
              <thead><tr className="text-gray-400">
                <th className="pr-4">Dec</th><th className="pr-4">Bin</th><th className="pr-4">Oct</th><th>Hex</th>
              </tr></thead>
              <tbody>
                {[0,1,2,4,8,10,15,16,32,64,128,255].map(n => (
                  <tr key={n} className="text-gray-600">
                    <td className="pr-4">{n}</td>
                    <td className="pr-4">{n.toString(2)}</td>
                    <td className="pr-4">{n.toString(8)}</td>
                    <td>{n.toString(16).toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
