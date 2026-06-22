'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('number-formatter')!

const LOCALES = [
  { code:'en-US', label:'English (US)', symbol:'$' },
  { code:'en-GB', label:'English (UK)', symbol:'\u00A3' },
  { code:'de-DE', label:'German', symbol:'\u20AC' },
  { code:'ja-JP', label:'Japanese', symbol:'\u00A5' },
  { code:'ko-KR', label:'Korean', symbol:'\u20A9' },
  { code:'fr-FR', label:'French', symbol:'\u20AC' },
  { code:'zh-CN', label:'Chinese', symbol:'\u00A5' },
]

export default function NumberFormatterPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('1234567.89')
  const [locale, setLocale] = useState('en-US')
  const [decimals, setDecimals] = useState(2)
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('number-formatter'); tracked.current = true }
  }

  const raw = parseFloat(input.replace(/[^0-9.-]/g,''))
  const loc = LOCALES.find(l=>l.code===locale)!

  function fmt(opts: Intl.NumberFormatOptions) {
    if (isNaN(raw)) return '—'
    try { return new Intl.NumberFormat(locale, opts).format(raw) } catch { return '—' }
  }

  const results = [
    { label:'Number',        value: fmt({ minimumFractionDigits:decimals, maximumFractionDigits:decimals }), id:'num' },
    { label:'Currency',      value: fmt({ style:'currency', currency:locale==='en-GB'?'GBP':locale==='ja-JP'?'JPY':locale==='ko-KR'?'KRW':locale==='zh-CN'?'CNY':'EUR', maximumFractionDigits:decimals }), id:'cur' },
    { label:'Percent',       value: fmt({ style:'percent', minimumFractionDigits:decimals }), id:'pct' },
    { label:'Scientific',    value: isNaN(raw)?'—':raw.toExponential(decimals), id:'sci' },
    { label:'Compact',       value: fmt({ notation:'compact', maximumFractionDigits:1 }), id:'cmp' },
    { label:'No decimals',   value: fmt({ maximumFractionDigits:0 }), id:'int' },
  ]

  async function copy(val:string,id:string) {
    if (val==='—') return
    await navigator.clipboard.writeText(val)
    trackToolCopy('number-formatter')
    setCopied(id)
    setTimeout(()=>setCopied(null),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-gray-600 mb-1">Number</label>
            <input value={input} onChange={e=>{setInput(e.target.value);track()}}
              placeholder="Enter a number..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Locale</label>
            <select value={locale} onChange={e=>{setLocale(e.target.value);track()}}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              {LOCALES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Decimals</label>
            <input type="number" value={decimals} min={0} max={10} onChange={e=>{setDecimals(parseInt(e.target.value)||0);track()}}
              className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {results.map(r=>(
            <div key={r.id} onClick={()=>copy(r.value,r.id)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors">
              <p className="text-xs text-gray-500 mb-1">{r.label}</p>
              <p className="text-lg font-bold text-brand-700 truncate">{r.value}</p>
              <p className="text-xs text-brand-400 mt-1">{copied===r.id?'\u2713 Copied':'Click to copy'}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
