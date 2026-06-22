'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('tip-calculator')!

const TIP_PRESETS = [10,15,18,20,25]

export default function TipCalculatorPage({ params }: { params: { lang: string } }) {
  const [bill, setBill] = useState('50')
  const [tipPct, setTipPct] = useState(18)
  const [people, setPeople] = useState(2)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('tip-calculator'); tracked.current = true } }

  const billNum = parseFloat(bill)||0
  const tip = billNum * tipPct/100
  const total = billNum + tip
  const perPerson = people>0 ? total/people : total
  const tipPerPerson = people>0 ? tip/people : tip

  async function copy() {
    const text = `Bill: $${billNum.toFixed(2)}\nTip (${tipPct}%): $${tip.toFixed(2)}\nTotal: $${total.toFixed(2)}\nPer person: $${perPerson.toFixed(2)}`
    await navigator.clipboard.writeText(text)
    trackToolCopy('tip-calculator')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4 max-w-sm mx-auto">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bill Amount ($)</label>
          <input type="number" value={bill} onChange={e=>{setBill(e.target.value);track()}} placeholder="0.00" step="0.01" min="0"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Tip: {tipPct}%</label>
          <div className="flex gap-1 flex-wrap">
            {TIP_PRESETS.map(t=>(
              <button key={t} onClick={()=>{setTipPct(t);track()}}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (tipPct===t?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {t}%
              </button>
            ))}
            <input type="number" min={0} max={100} value={tipPct} onChange={e=>{setTipPct(parseInt(e.target.value)||0);track()}}
              className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <input type="range" min={0} max={50} value={tipPct} onChange={e=>{setTipPct(parseInt(e.target.value));track()}} className="w-full mt-2 accent-brand-600" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Split between: {people} people</label>
          <input type="range" min={1} max={20} value={people} onChange={e=>{setPeople(parseInt(e.target.value));track()}} className="w-full accent-brand-600" />
          <div className="flex justify-between text-xs text-gray-400"><span>1</span><span>20</span></div>
        </div>
        <div className="space-y-2">
          {[
            { label:'Tip amount', value:tip, sub:tipPct+'%' },
            { label:'Total bill', value:total, sub:'with tip' },
            { label:'Per person', value:perPerson, sub:people+' people', highlight:true },
            { label:'Tip per person', value:tipPerPerson, sub:'' },
          ].map(row=>(
            <div key={row.label} className={'flex items-center justify-between p-3 rounded-xl border ' + (row.highlight?'bg-brand-50 border-brand-200':'bg-gray-50 border-gray-200')}>
              <div>
                <p className="text-xs text-gray-500">{row.label}</p>
                {row.sub && <p className="text-xs text-gray-400">{row.sub}</p>}
              </div>
              <p className={'font-bold text-lg font-mono ' + (row.highlight?'text-brand-700':'text-gray-800')}>${row.value.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <button onClick={copy} className="w-full py-2 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
          {copied?'✓ Copied':'Copy Summary'}
        </button>
      </div>
    </ToolLayout>
  )
}
