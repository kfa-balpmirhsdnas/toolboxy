'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('number-to-words')!

const ONES = ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']

function threeDigits(n: number): string {
  if (n === 0) return ''
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n/10)] + (n%10 ? '-'+ONES[n%10] : '')
  return ONES[Math.floor(n/100)] + ' hundred' + (n%100 ? ' '+threeDigits(n%100) : '')
}

function toWords(num: number): string {
  if (num === 0) return 'zero'
  const neg = num < 0
  let n = Math.abs(Math.floor(num))
  const parts: string[] = []
  const groups = [['',''],['thousand',''],['million',''],['billion',''],['trillion','']]
  let i = 0
  while (n > 0 && i < groups.length) {
    const rem = n % 1000
    if (rem !== 0) parts.unshift(threeDigits(rem) + (groups[i][0] ? ' '+groups[i][0] : ''))
    n = Math.floor(n/1000)
    i++
  }
  return (neg ? 'negative ' : '') + parts.join(', ')
}

export default function NumberToWordsPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('1234567')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('number-to-words'); tracked.current = true } }

  const n = parseFloat(input.replace(/,/g,''))
  const isValid = !isNaN(n) && isFinite(n)
  
  const intPart = isValid ? Math.floor(Math.abs(n)) : 0
  const decStr = isValid && input.includes('.') ? input.split('.')[1] : ''
  const decWords = decStr ? decStr.split('').map(d=>ONES[parseInt(d)]||'zero').join(' ') : ''
  
  const words = isValid ? toWords(n) + (decWords ? ' point ' + decWords : '') : ''
  const ordinal = isValid && Number.isInteger(n) && n >= 0 ? (() => {
    const w = toWords(Math.abs(n))
    return w.replace(/one$/, 'first').replace(/two$/, 'second').replace(/three$/, 'third').replace(/(w+)$/, (m) => {
      if (['first','second','third'].includes(m)) return m
      if (m.endsWith('t')) return m+'h'
      if (m.endsWith('e')) return m.slice(0,-1)+'th'
      return m+'th'
    })
  })() : ''

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('number-to-words')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Number</label>
          <input value={input} onChange={e=>{setInput(e.target.value);track()}} placeholder="e.g. 1234567"
            className={'w-full px-4 py-3 border rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 ' + (!isValid&&input?'border-red-300':'border-gray-200')} />
        </div>
        {isValid && words ? (
          <div className="space-y-3">
            {[
              { label:'Cardinal', val: words.charAt(0).toUpperCase()+words.slice(1) },
              ...(ordinal ? [{ label:'Ordinal', val: ordinal.charAt(0).toUpperCase()+ordinal.slice(1) }] : []),
            ].map(row=>(
              <div key={row.label} onClick={()=>copy(row.val, row.label)}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{row.label}</p>
                    <p className="text-sm font-medium text-gray-800">{row.val}</p>
                  </div>
                  <span className="text-xs text-brand-400 shrink-0">{copied===row.label?'\u2713 Copied':'Click to copy'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : input && !isValid ? (
          <p className="text-sm text-red-500">Please enter a valid number.</p>
        ) : null}
      </div>
    </ToolLayout>
  )
}
