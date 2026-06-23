'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('scientific-calculator')!
export default function ScientificCalculatorPage() {
  const [expr,setExpr]=useState('')
  const [result,setResult]=useState('')
  const [history,setHistory]=useState([])
  const [deg,setDeg]=useState(true)
  const toRad=v=>deg?v*Math.PI/180:v
  const calc=()=>{
    try{
      let e=expr
      e=e.replace(/sin\(/g,'_s(').replace(/cos\(/g,'_c(').replace(/tan\(/g,'_t(')
      e=e.replace(/sqrt\(/g,'Math.sqrt(').replace(/log\(/g,'Math.log10(').replace(/ln\(/g,'Math.log(').replace(/abs\(/g,'Math.abs(')
      e=e.replace(/π/g,'Math.PI').replace(/\bpi\b/gi,'Math.PI').replace(/\be\b/g,'Math.E')
      e=e.replace(/\^/g,'**')
      const fn=new Function('_s','_c','_t','Math','return ('+e+')')
      const r=fn(v=>Math.sin(toRad(v)),v=>Math.cos(toRad(v)),v=>Math.tan(toRad(v)),Math)
      const rs=typeof r==='number'?parseFloat(r.toFixed(10)).toString():'Error'
      setResult(rs);setHistory(h=>[expr+' = '+rs,...h.slice(0,9)])
    }catch{setResult('Error')}
  }
  const ap=v=>setExpr(e=>e+v)
  const rows=[['sin(','cos(','tan(','π'],['7','8','9','/'],[' 4','5','6','*'],['1','2','3','-'],['0','.','**','+'],[' sqrt(','log(','ln(','('],[')','^','C','⌫']]
  return (<ToolLayout tool={tool}><div className="max-w-sm mx-auto px-4"><div className="bg-gray-900 rounded-xl p-4 space-y-3"><div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Scientific Calculator</span><button onClick={()=>setDeg(d=>!d)} className="text-sm bg-gray-700 text-white px-3 py-1 rounded">{deg?'DEG':'RAD'}</button></div><input value={expr} onChange={e=>setExpr(e.target.value)} onKeyDown={e=>e.key==='Enter'&&calc()} className="w-full bg-gray-800 text-white text-right text-lg p-3 rounded-lg font-mono border border-gray-700 focus:outline-none" placeholder="Enter expression..."/><div className="bg-gray-800 text-green-400 text-right text-2xl p-3 rounded-lg font-mono min-h-14 flex items-center justify-end">{result||'0'}</div><div className="grid grid-cols-4 gap-2">{rows.flat().map((b,i)=>{const bt=b.trim();return(<button key={i} onClick={bt==='C'?()=>{setExpr('');setResult('')}:bt==='⌫'?()=>setExpr(e=>e.slice(0,-1)):()=>ap(bt)} className={'p-3 rounded-lg text-sm font-semibold '+(bt==='C'?'bg-red-600 text-white hover:bg-red-700':'bg-gray-700 text-white hover:bg-gray-600')}>{bt}</button>)})}<button onClick={calc} className="col-span-4 p-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">=</button></div></div>{history.length>0&&(<div className="mt-4 space-y-1"><p className="text-xs font-semibold text-gray-500">History</p>{history.map((h,i)=><p key={i} className="text-sm font-mono text-gray-600">{h}</p>)}</div>)}</div></ToolLayout>)
}