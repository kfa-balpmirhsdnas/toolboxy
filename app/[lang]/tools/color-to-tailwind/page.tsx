'use client'
import { useState } from 'react'

// Tailwind CSS color palette (selected)
const TW:{name:string,hex:string}[]=[
  {name:'slate-50',hex:'#f8fafc'},{name:'slate-100',hex:'#f1f5f9'},{name:'slate-200',hex:'#e2e8f0'},{name:'slate-300',hex:'#cbd5e1'},{name:'slate-400',hex:'#94a3b8'},{name:'slate-500',hex:'#64748b'},{name:'slate-600',hex:'#475569'},{name:'slate-700',hex:'#334155'},{name:'slate-800',hex:'#1e293b'},{name:'slate-900',hex:'#0f172a'},
  {name:'gray-50',hex:'#f9fafb'},{name:'gray-100',hex:'#f3f4f6'},{name:'gray-200',hex:'#e5e7eb'},{name:'gray-300',hex:'#d1d5db'},{name:'gray-400',hex:'#9ca3af'},{name:'gray-500',hex:'#6b7280'},{name:'gray-600',hex:'#4b5563'},{name:'gray-700',hex:'#374151'},{name:'gray-800',hex:'#1f2937'},{name:'gray-900',hex:'#111827'},
  {name:'red-50',hex:'#fef2f2'},{name:'red-100',hex:'#fee2e2'},{name:'red-200',hex:'#fecaca'},{name:'red-400',hex:'#f87171'},{name:'red-500',hex:'#ef4444'},{name:'red-600',hex:'#dc2626'},{name:'red-700',hex:'#b91c1c'},{name:'red-900',hex:'#7f1d1d'},
  {name:'orange-400',hex:'#fb923c'},{name:'orange-500',hex:'#f97316'},{name:'orange-600',hex:'#ea580c'},{name:'orange-700',hex:'#c2410c'},
  {name:'amber-400',hex:'#fbbf24'},{name:'amber-500',hex:'#f59e0b'},{name:'amber-600',hex:'#d97706'},
  {name:'yellow-300',hex:'#fde047'},{name:'yellow-400',hex:'#facc15'},{name:'yellow-500',hex:'#eab308'},
  {name:'green-50',hex:'#f0fdf4'},{name:'green-100',hex:'#dcfce7'},{name:'green-400',hex:'#4ade80'},{name:'green-500',hex:'#22c55e'},{name:'green-600',hex:'#16a34a'},{name:'green-700',hex:'#15803d'},{name:'green-900',hex:'#14532d'},
  {name:'teal-400',hex:'#2dd4bf'},{name:'teal-500',hex:'#14b8a6'},{name:'teal-600',hex:'#0d9488'},
  {name:'cyan-400',hex:'#22d3ee'},{name:'cyan-500',hex:'#06b6d4'},{name:'cyan-600',hex:'#0891b2'},
  {name:'blue-50',hex:'#eff6ff'},{name:'blue-100',hex:'#dbeafe'},{name:'blue-400',hex:'#60a5fa'},{name:'blue-500',hex:'#3b82f6'},{name:'blue-600',hex:'#2563eb'},{name:'blue-700',hex:'#1d4ed8'},{name:'blue-900',hex:'#1e3a8a'},
  {name:'indigo-400',hex:'#818cf8'},{name:'indigo-500',hex:'#6366f1'},{name:'indigo-600',hex:'#4f46e5'},{name:'indigo-700',hex:'#4338ca'},
  {name:'violet-500',hex:'#8b5cf6'},{name:'violet-600',hex:'#7c3aed'},{name:'violet-700',hex:'#6d28d9'},
  {name:'purple-400',hex:'#c084fc'},{name:'purple-500',hex:'#a855f7'},{name:'purple-600',hex:'#9333ea'},
  {name:'pink-400',hex:'#f472b6'},{name:'pink-500',hex:'#ec4899'},{name:'pink-600',hex:'#db2777'},
  {name:'rose-400',hex:'#fb7185'},{name:'rose-500',hex:'#f43f5e'},{name:'rose-600',hex:'#e11d48'},
  {name:'white',hex:'#ffffff'},{name:'black',hex:'#000000'},
]

function hexToRgb(hex:string):{r:number,g:number,b:number}|null{
  const m=hex.replace('#','').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if(!m) return null
  return{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}
}
function colorDist(a:{r:number,g:number,b:number},b:{r:number,g:number,b:number}):number{
  return Math.sqrt((a.r-b.r)**2+(a.g-b.g)**2+(a.b-b.b)**2)
}

export default function ColorToTailwindPage() {
  const [input,setInput]=useState('#3b82f6')
  const [copied,setCopied]=useState('')

  const rgb=hexToRgb(input)
  const matches=rgb?TW.map(c=>({...c,dist:colorDist(rgb,hexToRgb(c.hex)!)})).sort((a,b)=>a.dist-b.dist).slice(0,5):[]
  const best=matches[0]

  function copy(v:string){navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),2000)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Color to Tailwind CSS</h1>
        <p className="text-gray-500 mb-8">Find the closest Tailwind CSS color class for any hex color value</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-3 items-center">
            <input type="color" value={input} onChange={e=>setInput(e.target.value)} className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer" />
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="#3b82f6"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {best&&rgb&&(
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Best match</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-white shadow" style={{background:best.hex}} />
                  <div>
                    <p className="font-mono font-bold text-gray-800">{best.hex}</p>
                    <p className="text-sm text-gray-500">{best.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>copy('bg-'+best.name)} className={'text-xs px-2 py-1 rounded-lg '+(copied==='bg-'+best.name?'bg-brand-500 text-white':'bg-gray-200')}>bg-{best.name}</button>
                  <button onClick={()=>copy('text-'+best.name)} className={'text-xs px-2 py-1 rounded-lg '+(copied==='text-'+best.name?'bg-brand-500 text-white':'bg-gray-200')}>text-{best.name}</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {matches.length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Top 5 Closest Colors</h2>
            <div className="space-y-2">
              {matches.map((c,i)=>(
                <div key={c.name} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <span className="text-xs text-gray-400 w-4">{i+1}</span>
                  <div className="w-8 h-8 rounded-lg border border-gray-200" style={{background:c.hex}} />
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.hex} \u2022 \u0394{Math.round(c.dist)}</p>
                  </div>
                  <button onClick={()=>copy('bg-'+c.name)} className={'text-xs px-2 py-0.5 rounded '+(copied==='bg-'+c.name?'bg-brand-500 text-white':'bg-gray-100')}>Copy</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}