'use client'
import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('character-map')!
const BLOCKS=[
  {label:'Basic Latin',start:0x0020,end:0x007F},
  {label:'Latin Extended',start:0x00A0,end:0x00FF},
  {label:'Greek',start:0x0370,end:0x03FF},
  {label:'Arrows',start:0x2190,end:0x21FF},
  {label:'Math Operators',start:0x2200,end:0x22FF},
  {label:'Box Drawing',start:0x2500,end:0x257F},
  {label:'Emoji (misc)',start:0x2600,end:0x26FF},
  {label:'Dingbats',start:0x2700,end:0x27BF},
  {label:'Currency',start:0x20A0,end:0x20CF},
  {label:'Superscripts',start:0x2070,end:0x209F},
]
export default function CharacterMapPage() {
  const [blockIdx,setBlockIdx]=useState(0)
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState<number|null>(null)
  const [copied,setCopied]=useState('')
  const [output,setOutput]=useState('')
  const block=BLOCKS[blockIdx]
  const chars=useMemo(()=>Array.from({length:block.end-block.start+1},(_,i)=>block.start+i).filter(cp=>{try{const c=String.fromCodePoint(cp);return c.trim()||cp===0x0020}catch{return false}}),[block])
  const filtered=search?chars.filter(cp=>{try{return String.fromCodePoint(cp).toLowerCase().includes(search.toLowerCase())||cp.toString(16).padStart(4,'0').includes(search.toLowerCase())}catch{return false}}):chars
  const sel=selected!==null?{cp:selected,char:String.fromCodePoint(selected),hex:'U+'+selected.toString(16).toUpperCase().padStart(4,'0'),dec:selected,name:'Code point '+selected}:null
  const copy=(v:string)=>{navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),1000)}
  const addToOutput=(cp:number)=>{try{setOutput(o=>o+String.fromCodePoint(cp))}catch{}}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div className="flex gap-2"><select value={blockIdx} onChange={e=>setBlockIdx(Number(e.target.value))} className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
          {BLOCKS.map((b,i)=><option key={i} value={i}>{b.label} (U+{b.start.toString(16).toUpperCase().padStart(4,'0')}–U+{b.end.toString(16).toUpperCase().padStart(4,'0')})</option>)}
        </select>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search hex/char..." className="w-32 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"/></div>
        <div className="grid grid-cols-12 gap-0.5 max-h-48 overflow-y-auto bg-gray-50 rounded-xl p-2 border border-gray-200">
          {filtered.map(cp=>{
            const char=String.fromCodePoint(cp)
            return(<button key={cp} onClick={()=>setSelected(cp)} onDoubleClick={()=>addToOutput(cp)} title={'U+'+cp.toString(16).toUpperCase().padStart(4,'0')}
              className={'w-8 h-8 text-sm flex items-center justify-center rounded hover:bg-blue-100 transition '+(selected===cp?'bg-blue-600 text-white':'text-gray-800')}>{char}</button>)
          })}
        </div>
        {sel&&(
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <span className="text-4xl">{sel.char}</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{sel.char}</p>
              <p className="text-xs font-mono text-gray-500">{sel.hex} · Dec: {sel.dec}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={()=>copy(sel.char)} className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">{copied===sel.char?'✓':'Copy'}</button>
              <button onClick={()=>addToOutput(sel.cp)} className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Add</button>
            </div>
          </div>
        )}
        <div><div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">Output (double-click or Add)</label>
          <div className="flex gap-1.5">
            <button onClick={()=>copy(output)} className="text-xs text-blue-500 hover:text-blue-700">{copied===output&&output?'✓ Copied':'Copy'}</button>
            <button onClick={()=>setOutput('')} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
          </div>
        </div>
          <div className="min-h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-lg tracking-wider">{output||<span className="text-gray-300 text-sm">Click characters above</span>}</div>
        </div>
      </div>
    </ToolLayout>
  )
}