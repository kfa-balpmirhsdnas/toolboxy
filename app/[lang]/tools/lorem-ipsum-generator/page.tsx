'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('lorem-ipsum-generator')!
const W='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur'.split(' ')
function rw(){return W[Math.floor(Math.random()*W.length)]}
function sent(){const l=Math.floor(Math.random()*8)+5;const ws=Array.from({length:l},rw);ws[0]=ws[0][0].toUpperCase()+ws[0].slice(1);return ws.join(' ')+'.'}
function para(){return Array.from({length:Math.floor(Math.random()*3)+3},sent).join(' ')}
export default function LoremIpsumGeneratorPage() {
  const [mode,setMode]=useState<'words'|'sentences'|'paragraphs'>('paragraphs')
  const [count,setCount]=useState(3)
  const [copied,setCopied]=useState(false)
  const [output,setOutput]=useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.')
  const generate=()=>{
    const n=Math.min(count,100)
    let res=''
    if(mode==='words')res=Array.from({length:n},rw).join(' ')
    else if(mode==='sentences')res=Array.from({length:n},sent).join(' ')
    else res=Array.from({length:n},para).join('\n\n')
    setOutput(res)
  }
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Type</p>
            <div className="flex rounded overflow-hidden border border-gray-300">
              {(['words','sentences','paragraphs'] as const).map(m=>(
                <button key={m} onClick={()=>setMode(m)}
                  className={'px-3 py-1.5 text-sm font-medium transition '+(mode===m?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
            <input type="number" min="1" max="100" value={count} onChange={e=>setCount(Math.max(1,Math.min(100,Number(e.target.value))))} className="w-20 rounded border border-gray-300 px-2 py-1.5 text-center"/></div>
          <button onClick={generate} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Generate</button>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">{output.split(' ').length} words</span>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
          <textarea readOnly value={output} rows={12} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none"/>
        </div>
      </div>
    </ToolLayout>
  )
}