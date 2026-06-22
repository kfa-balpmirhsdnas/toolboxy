'use client'
import { useState } from 'react'

const ROMAN_MAP: Array<[number, string]> = [
  [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
  [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']
]

function toRoman(n: number): string {
  if(n<=0||n>3999) return 'Out of range (1–3999)'
  let result=''
  for(const [val,sym] of ROMAN_MAP) {
    while(n>=val) { result+=sym; n-=val }
  }
  return result
}

function fromRoman(s: string): number|null {
  const str=s.toUpperCase().trim()
  if(!str) return null
  const map: Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000}
  let total=0
  for(let i=0;i<str.length;i++) {
    const cur=map[str[i]]
    const next=map[str[i+1]]
    if(cur===undefined) return null
    if(next&&cur<next) total-=cur
    else total+=cur
  }
  return total>0&&total<=3999?total:null
}

export default function RomanNumeralConverter() {
  const [mode,setMode]=useState<'toRoman'|'fromRoman'>('toRoman')
  const [input,setInput]=useState('2024')
  const [copied,setCopied]=useState(false)

  const num=parseInt(input)
  const outputRoman=!isNaN(num)?toRoman(num):''
  const outputArabic=fromRoman(input)

  const output=mode==='toRoman'?outputRoman:(outputArabic!==null?String(outputArabic):'Invalid Roman numeral')
  const copy=async()=>{await navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  // Year range for fun facts
  const currentYear=2024
  const romanYear=toRoman(currentYear)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Roman Numeral Converter</h1>
        <p className="text-gray-500 mb-8">Convert between Arabic numbers and Roman numerals instantly.</p>
        <div className="flex gap-2 mb-6">
          <button onClick={()=>{setMode('toRoman');setInput('2024')}} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode==='toRoman'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Arabic → Roman
          </button>
          <button onClick={()=>{setMode('fromRoman');setInput('MMXXIV')}} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode==='fromRoman'?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Roman → Arabic
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {mode==='toRoman'?'Enter number (1–3999)':'Enter Roman numeral'}
          </label>
          <input type="text" value={input} onChange={e=>setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 text-center tracking-widest"
            placeholder={mode==='toRoman'?'e.g. 42':'e.g. XLII'}/>
          {input && (
            <div className="text-center">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-4">
                <p className="text-sm text-blue-500 mb-1">{mode==='toRoman'?'Roman numeral':'Arabic number'}</p>
                <p className="text-4xl font-black text-blue-700 tracking-widest">{output}</p>
              </div>
              <button onClick={copy} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium">{copied?'✓ Copied!':'Copy'}</button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Reference</h3>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {ROMAN_MAP.map(([val,sym])=>(
              <button key={sym} onClick={()=>{setMode('toRoman');setInput(String(val))}} className="bg-gray-50 hover:bg-blue-50 rounded-lg p-2 text-center transition-colors">
                <div className="text-xs font-bold text-blue-600">{sym}</div>
                <div className="text-xs text-gray-500">{val}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}