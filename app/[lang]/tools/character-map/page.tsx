'use client'
import { useState } from 'react'

// Unicode block ranges
const BLOCKS=[
  {name:'Basic Latin',start:0x0020,end:0x007E},
  {name:'Latin-1 Supplement',start:0x00A0,end:0x00FF},
  {name:'Latin Extended-A',start:0x0100,end:0x017F},
  {name:'Greek & Coptic',start:0x0370,end:0x03FF},
  {name:'Cyrillic',start:0x0400,end:0x04FF},
  {name:'Hebrew',start:0x05D0,end:0x05EA},
  {name:'Arabic',start:0x0600,end:0x06FF},
  {name:'Math Operators',start:0x2200,end:0x22FF},
  {name:'Arrows',start:0x2190,end:0x21FF},
  {name:'Box Drawing',start:0x2500,end:0x257F},
  {name:'Emojis (Misc)',start:0x1F300,end:0x1F64F},
]

export default function CharMapPage() {
  const [block,setBlock]=useState(BLOCKS[0])
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState<number|null>(null)
  const [output,setOutput]=useState('')
  const [copied,setCopied]=useState(false)

  const chars=[]
  for(let i=block.start;i<=block.end;i++) chars.push(i)

  const sel=selected!==null?{
    cp:selected,
    char:String.fromCodePoint(selected),
    name:'U+'+selected.toString(16).toUpperCase().padStart(4,'0'),
    html:'&#'+selected+';',
    css:'\\'+selected.toString(16).toUpperCase(),
    dec:selected,
    hex:'0x'+selected.toString(16).toUpperCase()
  }:null

  function pick(cp:number){
    setSelected(cp)
    setOutput(o=>o+String.fromCodePoint(cp))
  }

  function copy(){navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Character Map</h1>
        <p className="text-gray-500 mb-6">Browse Unicode characters, copy them, and build strings</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {BLOCKS.map(b=>(
            <button key={b.name} onClick={()=>{setBlock(b);setSelected(null)}}
              className={'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors '+(block.name===b.name?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-700')}>
              {b.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="grid gap-1" style={{gridTemplateColumns:'repeat(auto-fill,minmax(36px,1fr))'}}>
              {chars.map(cp=>(
                <button key={cp} onClick={()=>pick(cp)}
                  title={'U+'+cp.toString(16).toUpperCase().padStart(4,'0')}
                  className={'w-9 h-9 rounded flex items-center justify-center text-lg hover:bg-brand-50 transition-colors '+(selected===cp?'bg-brand-100 ring-2 ring-brand-400':'')}>
                  {String.fromCodePoint(cp)}
                </button>
              ))}
            </div>
          </div>
          <div className="w-56 space-y-3">
            {sel&&(
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="text-5xl text-center mb-3">{sel.char}</div>
                {[['Code Point',sel.name],['HTML',sel.html],['CSS',sel.css],['Decimal',sel.dec],['Hex',sel.hex]].map(([l,v])=>(
                  <div key={l as string} className="text-xs mb-1.5">
                    <span className="text-gray-500">{l}: </span>
                    <span className="font-mono font-medium text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Your string</div>
              <div className="text-lg font-bold text-gray-800 break-all min-h-[40px]">{output||<span className="text-gray-300">Click chars...</span>}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={()=>setOutput(o=>o.slice(0,-1))} className="flex-1 text-xs py-1 bg-gray-100 hover:bg-gray-200 rounded">\u232B</button>
                <button onClick={copy} className="flex-1 text-xs py-1 bg-brand-500 hover:bg-brand-600 text-white rounded">{copied?'\u2713':'Copy'}</button>
                <button onClick={()=>setOutput('')} className="flex-1 text-xs py-1 bg-gray-100 hover:bg-gray-200 rounded">Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}