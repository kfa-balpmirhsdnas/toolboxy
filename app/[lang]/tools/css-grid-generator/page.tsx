'use client'
import { useState } from 'react'

const COLORS=['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316','#06B6D4']

export default function CssGridGeneratorPage() {
  const [cols,setCols]=useState(3)
  const [rows,setRows]=useState(3)
  const [colGap,setColGap]=useState(12)
  const [rowGap,setRowGap]=useState(12)
  const [colTemplate,setColTemplate]=useState('repeat(3, 1fr)')
  const [rowTemplate,setRowTemplate]=useState('auto')
  const [autoMode,setAutoMode]=useState(true)
  const [copied,setCopied]=useState(false)

  const gridCols=autoMode?`repeat(${cols}, 1fr)`:colTemplate
  const css=`.container {\n  display: grid;\n  grid-template-columns: ${gridCols};\n  grid-template-rows: ${autoMode?`repeat(${rows}, auto)`:rowTemplate};\n  column-gap: ${colGap}px;\n  row-gap: ${rowGap}px;\n}`

  function copy(){navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSS Grid Generator</h1>
        <p className="text-gray-500 mb-6">Build CSS grid layouts visually with live preview</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={autoMode} onChange={e=>setAutoMode(e.target.checked)} className="rounded" />
              Simple mode (equal columns)
            </label>
            {autoMode?(
              <div className="grid grid-cols-2 gap-3">
                {[['Columns',cols,1,12,setCols],['Rows',rows,1,8,setRows]].map(([l,v,min,max,fn])=>(
                  <div key={l as string}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{l as string}</span><span>{v as number}</span></div>
                    <input type="range" min={min as number} max={max as number} value={v as number} onChange={e=>(fn as (n:number)=>void)(parseInt(e.target.value))} className="w-full accent-brand-500" />
                  </div>
                ))}
              </div>
            ):(
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">grid-template-columns</label>
                  <input value={colTemplate} onChange={e=>setColTemplate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 font-mono text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">grid-template-rows</label>
                  <input value={rowTemplate} onChange={e=>setRowTemplate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 font-mono text-sm focus:outline-none" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[['Column gap',colGap,0,40,setColGap],['Row gap',rowGap,0,40,setRowGap]].map(([l,v,min,max,fn])=>(
                <div key={l as string}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{l as string}</span><span>{v as number}px</span></div>
                  <input type="range" min={min as number} max={max as number} value={v as number} onChange={e=>(fn as (n:number)=>void)(parseInt(e.target.value))} className="w-full accent-brand-500" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div style={{display:'grid',gridTemplateColumns:gridCols,gridTemplateRows:autoMode?`repeat(${rows}, auto)`:rowTemplate,columnGap:colGap,rowGap,minHeight:160,background:'#F3F4F6',borderRadius:12,padding:12}}>
                {Array.from({length:cols*rows},(_,i)=>(
                  <div key={i} style={{background:COLORS[i%COLORS.length],borderRadius:6,height:44,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:'bold'}}>{i+1}</div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">CSS</span>
                <button onClick={copy} className="text-xs px-2 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">{copied?'\u2713':'Copy'}</button>
              </div>
              <pre className="font-mono text-xs text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{css}</pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}