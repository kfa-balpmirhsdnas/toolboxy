'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('css-grid-generator')!
export default function CssGridGeneratorPage() {
  const [cols,setCols]=useState(3)
  const [rows,setRows]=useState(3)
  const [colGap,setColGap]=useState(16)
  const [rowGap,setRowGap]=useState(16)
  const [colTpl,setColTpl]=useState('1fr 1fr 1fr')
  const [rowTpl,setRowTpl]=useState('auto auto auto')
  const [autoMode,setAutoMode]=useState(true)
  const [copied,setCopied]=useState(false)
  const [selected,setSelected]=useState<number[]>([])
  const effectiveCols=autoMode?'repeat('+cols+', 1fr)':colTpl
  const effectiveRows=autoMode?'repeat('+rows+', auto)':rowTpl
  const css='.container {
  display: grid;
  grid-template-columns: '+effectiveCols+';
  grid-template-rows: '+effectiveRows+';
  column-gap: '+colGap+'px;
  row-gap: '+rowGap+'px;
}'
  const copy=()=>{navigator.clipboard.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const totalCells=cols*rows
  const toggleCell=(i:number)=>setSelected(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])
  const COLORS=['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6','#f97316']
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={autoMode} onChange={e=>setAutoMode(e.target.checked)} className="rounded"/>
            <span className="text-sm text-gray-600">Simple mode</span>
          </label>
        </div>
        {autoMode?(
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">Columns: {cols}</label>
              <input type="range" min="1" max="12" value={cols} onChange={e=>setCols(Number(e.target.value))} className="w-full"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Rows: {rows}</label>
              <input type="range" min="1" max="12" value={rows} onChange={e=>setRows(Number(e.target.value))} className="w-full"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Column gap: {colGap}px</label>
              <input type="range" min="0" max="64" value={colGap} onChange={e=>setColGap(Number(e.target.value))} className="w-full"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Row gap: {rowGap}px</label>
              <input type="range" min="0" max="64" value={rowGap} onChange={e=>setRowGap(Number(e.target.value))} className="w-full"/></div>
          </div>
        ):(
          <div className="space-y-2">
            <div><label className="block text-xs text-gray-500 mb-1">grid-template-columns</label>
              <input value={colTpl} onChange={e=>setColTpl(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">grid-template-rows</label>
              <input value={rowTpl} onChange={e=>setRowTpl(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-500 mb-1">column-gap: {colGap}px</label>
                <input type="range" min="0" max="64" value={colGap} onChange={e=>setColGap(Number(e.target.value))} className="w-full"/></div>
              <div><label className="block text-xs text-gray-500 mb-1">row-gap: {rowGap}px</label>
                <input type="range" min="0" max="64" value={rowGap} onChange={e=>setRowGap(Number(e.target.value))} className="w-full"/></div>
            </div>
          </div>
        )}
        <div className="bg-blue-50 rounded-xl p-3 border-2 border-blue-200 min-h-32"
          style={{display:'grid',gridTemplateColumns:effectiveCols,gridTemplateRows:effectiveRows,columnGap:colGap+'px',rowGap:rowGap+'px'}}>
          {Array.from({length:autoMode?totalCells:9},(_,i)=>(
            <div key={i} onClick={()=>toggleCell(i)}
              className="rounded-lg flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:opacity-90 transition min-h-10"
              style={{background:COLORS[i%COLORS.length],opacity:selected.includes(i)?1:0.6}}>
              {i+1}
            </div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex justify-between gap-3">
          <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">{css}</pre>
          <button onClick={copy} className="flex-shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded text-xs h-fit hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}