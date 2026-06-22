'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('percentage-calculator')!
function fmt(n:number):string{return isFinite(n)?parseFloat(n.toFixed(6)).toString():'N/A'}
export default function PercentageCalculatorPage() {
  const [a1,setA1]=useState('25')
  const [b1,setB1]=useState('200')
  const [a2,setA2]=useState('50')
  const [b2,setB2]=useState('200')
  const [a3,setA3]=useState('50')
  const [b3,setB3]=useState('25')
  const [a4,setA4]=useState('100')
  const [b4,setB4]=useState('120')
  const r1=fmt(parseFloat(a1)/parseFloat(b1)*100)
  const r2=fmt(parseFloat(a2)/100*parseFloat(b2))
  const r3=fmt((parseFloat(a3)-parseFloat(b3))/parseFloat(b3)*100)
  const r4=fmt(parseFloat(a4)*(1+parseFloat(b4)/100))
  const Input=({val,set,w}:{val:string;set:(v:string)=>void;w?:string})=>(
    <input value={val} onChange={e=>set(e.target.value)} type="number" className={'rounded border border-gray-300 px-2 py-1.5 text-center font-mono text-sm w-'+(w||'20')}/>
  )
  const Card=({title,children,result,unit}:{title:string;children:React.ReactNode;result:string;unit?:string})=>(
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
      <div className="flex items-center gap-2 flex-wrap text-sm text-gray-700 mb-3">{children}</div>
      <div className="bg-blue-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
        <span className="text-xs text-blue-500">Result:</span>
        <span className="text-xl font-bold text-blue-700 font-mono">{result}{unit||''}</span>
      </div>
    </div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-3">
        <Card title="X% of Y" result={r2} unit="">
          <Input val={a2} set={setA2}/> <span>% of</span> <Input val={b2} set={setB2}/>
        </Card>
        <Card title="X is what % of Y?" result={r1} unit="%">
          <Input val={a1} set={setA1}/> <span>is what % of</span> <Input val={b1} set={setB1}/>
        </Card>
        <Card title="% change from X to Y" result={r3} unit="%">
          <span>From</span> <Input val={b3} set={setB3}/> <span>to</span> <Input val={a3} set={setA3}/>
        </Card>
        <Card title="Increase by %" result={r4}>
          <Input val={a4} set={setA4}/> <span>increased by</span> <Input val={b4} set={setB4}/> <span>%</span>
        </Card>
      </div>
    </ToolLayout>
  )
}