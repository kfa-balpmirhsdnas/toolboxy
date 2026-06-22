'use client'
import { useState } from 'react'

const ONES = ['','one','two','three','four','five','six','seven','eight','nine',
  'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
const TENS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']

function toWords(n: number): string {
  if (!Number.isFinite(n)) return 'invalid number'
  if (n === 0) return 'zero'
  if (n < 0) return 'negative ' + toWords(-n)
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n/10)] + (n%10 ? '-' + ONES[n%10] : '')
  if (n < 1000) return ONES[Math.floor(n/100)] + ' hundred' + (n%100 ? ' ' + toWords(n%100) : '')
  if (n < 1000000) return toWords(Math.floor(n/1000)) + ' thousand' + (n%1000 ? ' ' + toWords(n%1000) : '')
  if (n < 1000000000) return toWords(Math.floor(n/1000000)) + ' million' + (n%1000000 ? ' ' + toWords(n%1000000) : '')
  if (n < 1000000000000) return toWords(Math.floor(n/1000000000)) + ' billion' + (n%1000000000 ? ' ' + toWords(n%1000000000) : '')
  return toWords(Math.floor(n/1000000000000)) + ' trillion' + (n%1000000000000 ? ' ' + toWords(n%1000000000000) : '')
}

const EXAMPLES = [0,1,13,42,100,1000,1000000,1000000000]

export default function NumberToWordsPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  function process(val?: string) {
    const raw = val ?? input
    const n = parseFloat(raw)
    if (isNaN(n)) return
    const intPart = Math.floor(Math.abs(n))
    const fracStr = raw.includes('.') ? raw.split('.')[1] : ''
    let words = (n < 0 ? 'negative ' : '') + toWords(intPart)
    if (fracStr) {
      const digits = [...fracStr].map(d => ONES[parseInt(d)] || 'zero').join(' ')
      words += ' point ' + digits
    }
    setResult(words.charAt(0).toUpperCase() + words.slice(1))
  }

  function copy() { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Number to Words</h1>
        <p className="text-gray-500 mb-8">Convert numbers into English words — up to trillions</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Number</label>
            <input type="text" value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&process()}
              placeholder="e.g. 123456789"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button onClick={()=>process()} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg transition-colors">Convert to Words</button>
          {result && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-brand-800 font-medium text-lg leading-relaxed">{result}</p>
                <button onClick={copy} className="shrink-0 text-sm px-3 py-1 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
                  {copied ? '\u2713' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Quick Examples</h2>
          <div className="space-y-1">
            {EXAMPLES.map(n=>(
              <button key={n} onClick={()=>{setInput(String(n));process(String(n))}}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-left">
                <span className="font-mono text-gray-700 text-sm">{n.toLocaleString()}</span>
                <span className="text-gray-500 text-sm italic">{toWords(n)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}