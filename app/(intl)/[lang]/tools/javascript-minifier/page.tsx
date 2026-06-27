'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('javascript-minifier')!
function minifyJs(code:string,opts:{comments:boolean;whitespace:boolean;semicolons:boolean}):string{
  let s=code
  if(opts.comments){
    s=s.replace(/\/\*[\s\S]*?\*\//g,'')
    s=s.replace(/\/\/[^\n]*/g,'')
  }
  if(opts.whitespace){
    s=s.replace(/\n\s*/g,'')
    s=s.replace(/\s{2,}/g,' ')
    s=s.replace(/\s*([{}()=+\-*\/,;:<>!&|])\s*/g,'$1')
    s=s.trim()
  }
  if(opts.semicolons){
    s=s.replace(/;}/g,'}')
  }
  return s
}
const SAMPLE=`// Utility functions
function calculateTotal(items) {
  // Sum all item prices
  return items.reduce(function(total, item) {
    return total + item.price * item.quantity;
  }, 0);
}

/* Format currency with locale */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

const cart = [
  { price: 29.99, quantity: 2 },
  { price: 9.99, quantity: 1 }
];
console.log(formatCurrency(calculateTotal(cart)));`
export default function JavascriptMinifierPage() {
  const t = useTranslations('toolui')
  const [input,setInput]=useState(SAMPLE)
  const [rmComments,setRmComments]=useState(true)
  const [rmWhitespace,setRmWhitespace]=useState(true)
  const [rmSemicolons,setRmSemicolons]=useState(false)
  const [copied,setCopied]=useState(false)
  const minified=minifyJs(input,{comments:rmComments,whitespace:rmWhitespace,semicolons:rmSemicolons})
  const origB=new Blob([input]).size,minB=new Blob([minified]).size
  const savings=origB>0?Math.round((1-minB/origB)*100):0
  const copy=()=>{navigator.clipboard.writeText(minified);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {[['jsm_comments',rmComments,setRmComments],['jsm_whitespace',rmWhitespace,setRmWhitespace],['jsm_semicolons',rmSemicolons,setRmSemicolons]].map(([l,v,s])=>(
            <label key={l as string} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" checked={v as boolean} onChange={e=>(s as Function)(e.target.checked)} className="rounded"/>{t(l as string)}
            </label>
          ))}
        </div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">{t('jsm_code')}</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"/></div>
        <div className="flex gap-3 text-sm text-center">
          {[['cm_original',origB+' B'],['jsm_minified',minB+' B'],['jsm_savings',savings+'%']].map(([l,v])=>(
            <div key={l} className={'flex-1 rounded-xl py-2.5 '+(l==='jsm_savings'?'bg-green-50':'bg-gray-50')}>
              <p className={'font-bold '+(l==='jsm_savings'?'text-green-700':'text-gray-800')}>{v}</p>
              <p className="text-xs text-gray-500">{t(l)}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">{t('jsm_output')}</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?t('ui_copied'):t('ui_copy')}</button>
          </div>
          <pre className="px-4 py-3 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-40">{minified}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}