'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-specificity-calculator')!
function calcSpec(sel:string):[number,number,number]{
  let s=sel.trim()
  s=s.replace(/:not([^)]*)/g,m=>m)
  const inlineStyle=0
  let ids=(s.match(/#[a-zA-Z_-][a-zA-Z0-9_-]*/g)||[]).length
  s=s.replace(/#[a-zA-Z_-][a-zA-Z0-9_-]*/g,'')
  let classes=(s.match(/.[a-zA-Z_-][a-zA-Z0-9_-]*/g)||[]).length
  classes+=(s.match(/[[^]]+]/g)||[]).length
  const PSEUDO_CLASS=['hover','focus','active','visited','first-child','last-child','nth-child','not','checked','disabled','enabled','required','optional','valid','invalid','placeholder-shown']
  PSEUDO_CLASS.forEach(p=>{const m=s.match(new RegExp(':'+p+'(\\([^)]*\\))?','g'));if(m)classes+=m.length})
  s=s.replace(/:[a-zA-Z-]+(([^)]*))?/g,'')
  s=s.replace(/[[^]]+]/g,'')
  s=s.replace(/.[a-zA-Z_-][a-zA-Z0-9_-]*/g,'')
  let elements=(s.match(/[a-zA-Z][a-zA-Z0-9]*/g)||[]).filter(e=>!['and','or','not','where','has','is'].includes(e)).length
  return [ids,classes,elements]
}
const EXAMPLES=['div','#main','.class','div p','#nav .item','h1 + p','a:hover','input[type="text"]','#id .class tag','*','::before']
export default function CssSpecificityCalculatorPage() {
  const [selectors,setSelectors]=useState('#header .nav-item:hover')
  const [history,setHistory]=useState<{sel:string;spec:[number,number,number]}[]>([])
  const lines=selectors.split('\n').filter(s=>s.trim())\n  const results=lines.map(s=>({sel:s.trim(),spec:calcSpec(s.trim())}))\n  const add=()=>{results.forEach(r=>{if(!history.find(h=>h.sel===r.sel))setHistory(h=>[...h,r].slice(-10))})}\n  const specStr=(s:[number,number,number])=>s.join(',')\n  const specVal=(s:[number,number,number])=>s[0]*100+s[1]*10+s[2]\n  return (\n    <ToolLayout tool={tool}>\n      <div className="max-w-lg mx-auto px-4 space-y-4">\n        <div><label className="block text-sm font-medium text-gray-700 mb-1">CSS Selector(s) — one per line</label>\n          <textarea value={selectors} onChange={e=>setSelectors(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/></div>\n        <div className="space-y-2">\n          {results.map(r=>(\n            <div key={r.sel} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">\n              <code className="flex-1 text-sm font-mono text-gray-700 truncate">{r.sel}</code>\n              <div className="flex gap-1.5 items-center">\n                {(['IDs','Classes','Elements'] as const).map((lbl,i)=>(\n                  <div key={lbl} className="text-center">\n                    <div className={'w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold '+(i===0?'bg-blue-100 text-blue-700':i===1?'bg-green-100 text-green-700':'bg-gray-200 text-gray-700')}>{r.spec[i]}</div>\n                    <p className="text-xs text-gray-400 mt-0.5">{lbl}</p>\n                  </div>\n                ))}\n                <div className="text-center ml-2">\n                  <div className="w-14 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">{specStr(r.spec)}</div>\n                  <p className="text-xs text-gray-400 mt-0.5">Score</p>\n                </div>\n              </div>\n            </div>\n          ))}\n        </div>\n        <div>\n          <p className="text-xs font-medium text-gray-600 mb-2">Examples</p>\n          <div className="flex flex-wrap gap-2">\n            {EXAMPLES.map(e=>(\n              <button key={e} onClick={()=>setSelectors(s=>s?s+'
'+e:e)} className="px-2.5 py-1 rounded border border-gray-200 text-xs font-mono hover:bg-gray-50">{e}</button>\n            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}