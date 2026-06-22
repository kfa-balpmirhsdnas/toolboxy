'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('temperature-converter')!

type Unit = 'C'|'F'|'K'|'R'

function toC(v: number, from: Unit): number {
  if (from === 'C') return v
  if (from === 'F') return (v - 32) * 5 / 9
  if (from === 'K') return v - 273.15
  return (v - 491.67) * 5 / 9
}
function fromC(c: number, to: Unit): number {
  if (to === 'C') return c
  if (to === 'F') return c * 9 / 5 + 32
  if (to === 'K') return c + 273.15
  return (c + 273.15) * 9 / 5
}

const UNITS: { key: Unit; label: string; sym: string }[] = [
  { key: 'C', label: 'Celsius', sym: '\u00B0C' },
  { key: 'F', label: 'Fahrenheit', sym: '\u00B0F' },
  { key: 'K', label: 'Kelvin', sym: 'K' },
  { key: 'R', label: 'Rankine', sym: '\u00B0R' },
]

const fmt = (n: number) => Number.isNaN(n) ? '—' : n.toFixed(4).replace(/\.?0+$/, '')

export default function TemperatureConverterPage({ params }: { params: { lang: string } }) {
  const [from, setFrom] = useState<Unit>('C')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('temperature-converter'); tracked.current = true }
  }

  const val = parseFloat(input)
  const cVal = toC(val, from)

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    trackToolCopy('temperature-converter')
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="flex gap-2 flex-wrap">
          {UNITS.map(u => (
            <button key={u.key} onClick={() => setFrom(u.key)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (from===u.key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {u.sym} {u.label}
            </button>
          ))}
        </div>
        <input type="number" value={input} onChange={e => { setInput(e.target.value); track() }}
          placeholder={'Enter temperature in ' + UNITS.find(u=>u.key===from)?.label}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        {input && !isNaN(val) && (
          <div className="grid grid-cols-2 gap-3">
            {UNITS.map(u => {
              const result = fmt(fromC(cVal, u.key))
              return (
                <div key={u.key} onClick={() => copy(result, u.key)}
                  className={'p-4 border rounded-xl cursor-pointer hover:border-brand-300 transition-colors ' + (u.key===from ? 'bg-brand-50 border-brand-200' : 'bg-gray-50 border-gray-200')}>
                  <p className="text-xs text-gray-500 mb-1">{u.sym} {u.label}</p>
                  <p className={'text-xl font-bold ' + (u.key===from ? 'text-brand-700' : 'text-gray-800')}>{result}</p>
                  <p className="text-xs text-brand-400 mt-1">{copied===u.key ? '\u2713 Copied' : 'Click to copy'}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
