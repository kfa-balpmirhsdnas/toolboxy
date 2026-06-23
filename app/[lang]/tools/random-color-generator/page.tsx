'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
function hex(r,g,b){return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}
function hsl(r,g,b){
  const r1=r/255,g1=g/255,b1=b/255,mx=Math.max(r1,g1,b1),mn=Math.min(r1,g1,b1)
  let h=0,s=0;const l=(mx+mn)/2
  if(mx!==mn){const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r1?(g1-b1)/d+(g1<b1?6:0):mx===g1?(b1-r1)/d+2:(r1-g1)/d+4;h=Math.round(h*60)}
  return 'hsl('+h+', '+Math.round(s*100)+'%, '+Math.round(l*100)+'%)'
}
function gen(){const r=Math.floor(Math.random()*256),g=Math.floor(Math.random()*256),b=Math.floor(Math.random()*256);return{hex:hex(r,g,b),rgb:'rgb('+r+', '+g+', '+b+')',hsl:hsl(r,g,b)}}
export default function Page(){
  const [n,setN]=useState(5)
  const [colors,setColors]=useState(()=>Array.from({length:5},gen))
  const generate=()=>setColors(Array.from({length:n},gen))
  const tool=TOOLS.find(t=>t.slug==='random-color-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-700">Count</label>
          <input type="number" min={1} max={20} value={n} onChange={e=>setN(+e.target.value)} className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"/>
          <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Generate</button>
        </div>
        <div className="space-y-3">
          {colors.map((c,i)=>(
            <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-200 p-3">
              <div className="w-14 h-14 rounded-lg border border-gray-100" style={{backgroundColor:c.hex}}/>
              <div className="flex-1 space-y-0.5">
                <div className="font-mono text-sm font-bold">{c.hex.toUpperCase()}</div>
                <div className="font-mono text-xs text-gray-500">{c.rgb}</div>
                <div className="font-mono text-xs text-gray-500">{c.hsl}</div>
              </div>
              <button onClick={()=>navigator.clipboard?.writeText(c.hex)} className="text-xs text-blue-600 hover:underline">Copy</button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}