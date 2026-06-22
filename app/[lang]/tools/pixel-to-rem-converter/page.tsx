'use client'
import { useState } from 'react'

export default function PixelToRemConverterPage() {
  const [base, setBase] = useState(16)
  const [pxVal, setPxVal] = useState('')
  const [remVal, setRemVal] = useState('')
  const [emVal, setEmVal] = useState('')
  const [copiedField, setCopiedField] = useState('')

  function fromPx(v:string){
    setPxVal(v)
    const n=parseFloat(v)
    if(!isNaN(n)&&base>0){setRemVal((n/base).toFixed(4));setEmVal((n/base).toFixed(4))}else{setRemVal('');setEmVal('')}
  }
  function fromRem(v:string){
    setRemVal(v)
    const n=parseFloat(v)
    if(!isNaN(n)&&base>0){setPxVal((n*base).toFixed(2));setEmVal(v)}else{setPxVal('');setEmVal('')}
  }

  function copy(val:string,field:string){navigator.clipboard.writeText(val);setCopiedField(field);setTimeout(()=>setCopiedField(''),2000)}

  const commonPx=[8,12,14,16,18,20,24,32,48,64]

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pixel to REM Converter</h1>
        <p className="text-gray-500 mb-8">Convert between px, rem, and em CSS units with a configurable base font size</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Font Size (px)</label>
            <div className="flex items-center gap-3">
              <input type="range" min={8} max={24} value={base} onChange={e=>{setBase(parseInt(e.target.value));fromPx(pxVal)}} className="flex-1" />
              <span className="text-brand-600 font-bold w-8">{base}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[['px','px',pxVal,fromPx],['rem','rem',remVal,fromRem],['em','em',emVal,(v:string)=>fromRem(v)]] as [string,string,string,(v:string)=>void][]).map(([id,unit,val,handler])=>(
              <div key={id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{unit}</label>
                <div className="flex">
                  <input type="number" value={val} onChange={e=>handler(e.target.value)} placeholder="0"
                    className="flex-1 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <button onClick={()=>copy(val,id)} className={'px-2 border border-gray-300 rounded-r-lg text-xs '+(copiedField===id?'bg-brand-500 text-white':'bg-gray-50 text-gray-500')}>
                    {copiedField===id?'\u2713':unit}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Common Values (base: {base}px)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">{['px','rem','em'].map(h=><th key={h} className="py-2 pr-4 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {commonPx.map(p=>(
                  <tr key={p} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={()=>fromPx(String(p))}>
                    <td className="py-2 pr-4 font-mono text-gray-700">{p}px</td>
                    <td className="py-2 pr-4 font-mono text-brand-600">{(p/base).toFixed(4)}rem</td>
                    <td className="py-2 pr-4 font-mono text-purple-600">{(p/base).toFixed(4)}em</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}