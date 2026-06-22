'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('number-converter')!

type Base = 2|8|10|16

const BASES: { base: Base; label: string; prefix: string; chars: string }[] = [
  { base:2,  label:'Binary',      prefix:'0b', chars:'01' },
  { base:8,  label:'Octal',       prefix:'0o', chars:'0-7' },
  { base:10, label:'Decimal',     prefix:'',   chars:'0-9' },
  { base:16, label:'Hexadecimal', prefix:'0x', chars:'0-9A-F' },
]

export default function NumberConverterPage({ params }: { params: { lang: string } }) {
  const [inputBase, setInputBase] = useState<Base>(10)
  const [value, setValue] = useState('255')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('number-converter'); tracked.current = true } }

  let n: number | null = null
  let error = ''
  try {
    const parsed = parseInt(value.replace(/^0[bBxXoO]/,''), inputBase)
    if (!isNaN(parsed) && value.trim() !== '') n = parsed
    else if (value.trim()) error = 'Invalid input for base '+inputBase
  } catch { error = 'Invalid' }

  const results = BASES.map(b => ({
    ...b,
    output: n !== null ? n.toString(b.base).toUpperCase() : ''
  }))

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('number-converter')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  const bits = n !== null && n > 0 ? Math.floor(Math.log2(n))+1 : n === 0 ? 1 : 0
  const bytes = Math.ceil(bits/8)

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {BASES.map(b=>(
            <button key={b.base} onClick={()=>{setInputBase(b.base);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (inputBase===b.base?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {b.label} (base {b.base})
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Input ({BASES.find(b=>b.base===inputBase)?.label})
          </label>
          <input value={value} onChange={e=>{setValue(e.target.value.toUpperCase());track()}}
            className={'w-full px-4 py-3 border rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 ' + (error?'border-red-300':'border-gray-200')}
            placeholder={BASES.find(b=>b.base===inputBase)?.chars} />
          {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
        </div>
        {n !== null && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {results.map(r=>(
                <div key={r.base} onClick={()=>copy(r.output,String(r.base))}
                  className={'p-3 rounded-xl border cursor-pointer hover:border-brand-300 transition-colors ' + (inputBase===r.base?'bg-brand-50 border-brand-200':'bg-gray-50 border-gray-200')}>
                  <p className="text-xs text-gray-500 mb-1">{r.label} (base {r.base})</p>
                  <p className="text-base font-mono font-semibold text-gray-800 break-all">{r.prefix}{r.output}</p>
                  {copied===String(r.base) && <p className="text-xs text-brand-400 mt-0.5">\u2713 Copied</p>}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
              <div className="p-2 bg-gray-50 rounded-lg text-center"><span className="font-mono font-semibold text-gray-700">{bits}</span> bits</div>
              <div className="p-2 bg-gray-50 rounded-lg text-center"><span className="font-mono font-semibold text-gray-700">{bytes}</span> bytes</div>
              <div className="p-2 bg-gray-50 rounded-lg text-center"><span className="font-mono font-semibold text-gray-700">{n.toLocaleString()}</span> dec</div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
