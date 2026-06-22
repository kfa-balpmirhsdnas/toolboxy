'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('roman-numeral-converter')!
const MAP:[number,string][]=[
  [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
  [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']
]
function toRoman(n:number):string{
  if(n<1||n>3999)return 'Out of range (1-3999)'
  let result=''
  for(const [val,sym] of MAP){while(n>=val){result+=sym;n-=val}}
  return result
}
function fromRoman(s:string):number{
  const vals:Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000}
  const u=s.toUpperCase()
  let result=0
  for(let i=0;i<u.length;i++){
    const cur=vals[u[i]]
    const nxt=vals[u[i+1]]
    if(!cur)return -1
    if(nxt&&cur<nxt){result-=cur}else{result+=cur}
  }
  return result
}
export default function RomanNumeralConverterPage() {
  const [mode,setMode]=useState<'to'|'from'>('to')
  const [numVal,setNumVal]=useState('2024')
  const [romVal,setRomVal]=useState('MMXXIV')
  const numResult=mode==='to'?toRoman(parseInt(numVal)||0):''
  const romResult=mode==='from'?fromRoman(romVal):-1
  const EXAMPLES=[1,4,9,14,40,90,399,400,1000,1999,2024,3999]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('to')} className={`flex-1 py-2 text-sm font-medium transition ${mode==='to'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Number → Roman</button>
          <button onClick={()=>setMode('from')} className={`flex-1 py-2 text-sm font-medium transition ${mode==='from'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>Roman → Number</button>
        </div>
        {mode==='to'?(
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arabic Number (1–3999)</label>
            <input type="number" min="1" max="3999" value={numVal} onChange={e=>setNumVal(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-2xl text-center font-mono"/>
            {numResult&&<div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
              <p className="text-4xl font-bold text-amber-800 tracking-widest">{numResult}</p>
              <p className="text-xs text-amber-500 mt-2">Roman Numeral</p>
            </div>}
          </div>
        ):(
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Roman Numeral</label>
            <input value={romVal} onChange={e=>setRomVal(e.target.value.toUpperCase())} placeholder="e.g. MMXXIV"
              className="w-full rounded border border-gray-300 px-3 py-2 text-2xl text-center font-mono tracking-widest uppercase"/>
            {romResult>0&&<div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-6 text-center">
              <p className="text-5xl font-bold text-blue-800">{romResult}</p>
              <p className="text-xs text-blue-500 mt-2">Arabic Number</p>
            </div>}
            {romResult===-1&&romVal&&<p className="text-red-500 text-sm mt-2">Invalid Roman numeral</p>}
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500 mb-2">Quick examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(n=>(
              <button key={n} onClick={()=>{if(mode==='to')setNumVal(String(n));else setRomVal(toRoman(n))}}
                className="px-2 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50 font-mono">{n} = {toRoman(n)}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}