'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const [dir,setDir]=useState('row')
  const [wrap,setWrap]=useState('nowrap')
  const [jc,setJc]=useState('flex-start')
  const [ai,setAi]=useState('stretch')
  const [gap,setGap]=useState(8)
  const [items,setItems]=useState(4)
  const css='.container {\n  display: flex;\n  flex-direction: '+dir+';\n  flex-wrap: '+wrap+';\n  justify-content: '+jc+';\n  align-items: '+ai+';\n  gap: '+gap+'px;\n}'
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard?.writeText(css);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const tool=TOOLS.find(t=>t.slug==='css-flexbox-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[['Direction',dir,setDir,['row','row-reverse','column','column-reverse']],
            ['Wrap',wrap,setWrap,['nowrap','wrap','wrap-reverse']],
            ['Justify Content',jc,setJc,['flex-start','center','flex-end','space-between','space-around','space-evenly']],
            ['Align Items',ai,setAi,['flex-start','center','flex-end','stretch','baseline']],
          ].map(([lbl,val,set,opts])=>(
            <label key={lbl} className="flex flex-col gap-1 text-xs text-gray-600">{lbl}
              <select value={val} onChange={e=>set(e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm">
                {opts.map(o=><option key={o}>{o}</option>)}
              </select></label>
          ))}
          <label className="flex flex-col gap-1 text-xs text-gray-600">Gap
            <input type="number" min={0} max={48} value={gap} onChange={e=>setGap(+e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm"/></label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">Items
            <input type="number" min={1} max={12} value={items} onChange={e=>setItems(+e.target.value)} className="rounded border border-gray-300 px-2 py-1.5 text-sm"/></label>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[140px]">
          <div style={{display:'flex',flexDirection:dir,flexWrap:wrap,justifyContent:jc,alignItems:ai,gap:gap+'px',minHeight:100}}>
            {Array.from({length:items},(_,i)=><div key={i} style={{background:'#3b82f6',color:'white',borderRadius:6,padding:'8px 12px',fontSize:12,fontWeight:600}}>{i+1}</div>)}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <textarea value={css} readOnly rows={7} className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/>
          <button onClick={copy} className="shrink-0 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
        </div>
      </div>
    </ToolLayout>
  )
}