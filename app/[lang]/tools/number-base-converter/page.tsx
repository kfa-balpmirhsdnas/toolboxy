'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const BASES = [
  { label: 'Binary', base: 2, prefix: '0b' },
  { label: 'Octal', base: 8, prefix: '0o' },
  { label: 'Decimal', base: 10, prefix: '' },
  { label: 'Hexadecimal', base: 16, prefix: '0x' },
]


const tool = getToolBySlug('number-base-converter')!

export default function NumberBaseConverterPage() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState(10)

  let decimal: number | null = null
  let error = ''
  try {
    if (input.trim()) {
      decimal = parseInt(input.trim().replace(/^0[bBoOxX]/, ''), fromBase)
      if (isNaN(decimal)) error = 'Invalid number for selected base'
    }
  } catch { error = 'Invalid input' }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Number Base Converter</h1>
        <p className="text-gray-500 mb-8">Convert numbers between binary, octal, decimal, and hexadecimal.</p>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Base</label>
            <div className="flex gap-2 flex-wrap">
              {BASES.map(b => (
                <button key={b.base} onClick={() => setFromBase(b.base)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${fromBase===b.base ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input ({BASES.find(b => b.base === fromBase)?.label})
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={fromBase === 2 ? '1010' : fromBase === 8 ? '17' : fromBase === 16 ? 'FF' : '42'}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          {decimal !== null && !error && (
            <div className="space-y-2">
              {BASES.filter(b => b.base !== fromBase).map(b => (
                <div key={b.base} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-sm text-gray-500 w-28">{b.label}</span>
                  <span className="font-mono text-sm text-gray-900 flex-1">{b.prefix}{decimal!.toString(b.base).toUpperCase()}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(decimal!.toString(b.base).toUpperCase())}
                    className="text-xs text-blue-600 hover:text-blue-800">Copy</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
