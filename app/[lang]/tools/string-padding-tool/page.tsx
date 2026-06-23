'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='string-padding-tool')
  const [input,setInput]=useState('Hello')
  const [width,setWidth]=useState('10')
  const [padChar,setPadChar]=useState(' ')
  const [align,setAlign]=useState<'left'|'right'|'center'>('right')

  function pad(s:string,w:number,ch:string,a:string){
    if(s.length>=w) return s
    const total=w-s.length
    if(a==='right') return s.padEnd(w,ch)
    if(a==='left') return s.padStart(w,ch)
    const half=Math.floor(total/2)
    return ch.repeat(half)+s+ch.repeat(total-half)
  }

  const lines=input.split('\n')
  const w=parseInt(width)||0
  const ch=padChar||' '
  const result=lines.map(l=>pad(l,w,ch,align)).join('\n')

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Total Width</label>
            <input type="number" value={width} onChange={e=>setWidth(e.target.value)}
              min="1" max="200" className="border rounded px-3 py-2 w-24"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pad Character</label>
            <input value={padChar} onChange={e=>setPadChar(e.target.value.slice(0,1)||' ')}
              maxLength={1} className="border rounded px-3 py-2 w-16 text-center font-mono"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alignment</label>
            <div className="flex gap-1">
              {(['left','right','center'] as const).map(a=>(
                <button key={a} onClick={()=>setAlign(a)}
                  className={"px-3 py-2 rounded text-sm border "+(align===a?'bg-blue-600 text-white':'bg-white hover:bg-gray-50')}>
                  {a.charAt(0).toUpperCase()+a.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Input</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            className="w-full h-28 p-3 border rounded font-mono text-sm resize-y"
            placeholder="Text to pad..."/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Result</label>
          <pre className="w-full p-3 border rounded font-mono text-sm bg-gray-50 whitespace-pre overflow-auto min-h-16">{result}</pre>
          <button onClick={()=>navigator.clipboard.writeText(result)}
            className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">Copy</button>
        </div>
      </div>
    </ToolLayout>
  )
}
