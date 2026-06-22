'use client'
import { useState } from 'react'

const VALS:[number,string][]=[
  [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
  [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']
]

function toRoman(n:number):string{
  if(n<1||n>3999) return 'Out of range (1-3999)'
  let r=''
  for(const [v,s] of VALS){while(n>=v){r+=s;n-=v}}
  return r
}

function fromRoman(s:string):number|null{
  const map:Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000}
  const u=s.toUpperCase().trim()
  if(!/^[IVXLCDM]+$/.test(u)) return null
  let result=0
  for(let i=0;i<u.length;i++){
    const cur=map[u[i]],next=map[u[i+1]]
    if(next&&cur<next){result+=next-cur;i++}else result+=cur
  }
  return result
}

export default function RomanNumeralConverterPage() {
  const [mode,setMode]=useState<'to'|'from'>('to')
  const [num,setNum]=useState('2024')
  const [rom,setRom]=useState('MMXXIV')
  const [copied,setCopied]=useState(false)

  const toResult=toRoman(parseInt(num)||0)
  const fromResult=fromRoman(rom)
  const result=mode==='to'?toResult:(fromResult!==null?fromResult.toString():'Invalid Roman numeral')

  function copy(){navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  const examples=[[1,2024,42,1999,3999],[2024,'MMXXIV',42,'XLII',1999,'MCMXCIX']]

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Roman Numeral Converter</h1>
        <p className="text-gray-500 mb-8">Convert between Arabic numbers and Roman numerals (1\u20133999)</p>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode('to')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='to'?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>
            Number \u2192 Roman
          </button>
          <button onClick={()=>setMode('from')} className={'flex-1 py-2 rounded-lg font-medium transition-colors '+(mode==='from'?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>
            Roman \u2192 Number
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          {mode==='to'?(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arabic Number (1\u20133999)</label>
              <input type="number" min={1} max={3999} value={num} onChange={e=>setNum(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          ):(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roman Numeral</label>
              <input type="text" value={rom} onChange={e=>setRom(e.target.value)} placeholder="e.g. MMXXIV"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          )}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-3xl font-bold text-brand-700 font-mono">{result}</span>
            <button onClick={copy} className="text-sm px-3 py-1.5 bg-white border border-brand-200 rounded-lg">{copied?'\u2713':'Copy'}</button>
          </div>
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Quick Reference</h2>
          <div className="grid grid-cols-2 gap-2">
            {VALS.map(([v,s])=>(
              <div key={s} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg">
                <span className="font-mono text-brand-600 font-semibold">{s}</span>
                <span className="text-gray-600">{v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}