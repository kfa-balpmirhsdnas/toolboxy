'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function hexToRgb(hex:string){
  const r=parseInt(hex.slice(1,3),16)
  const g=parseInt(hex.slice(3,5),16)
  const b=parseInt(hex.slice(5,7),16)
  return {r,g,b}
}
function rgbToHsl(r:number,g:number,b:number){
  r/=255;g/=255;b/=255
  const max=Math.max(r,g,b),min=Math.min(r,g,b)
  let h=0,s=0,l=(max+min)/2
  if(max!==min){
    const d=max-min
    s=l>0.5?d/(2-max-min):d/(max+min)
    switch(max){
      case r:h=((g-b)/d+(g<b?6:0))/6;break
      case g:h=((b-r)/d+2)/6;break
      case b:h=((r-g)/d+4)/6;break
    }
  }
  return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)}
}

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='color-converter')
  const [hex,setHex]=useState('#3b82f6')
  const [error,setError]=useState('')

  function handleHex(v:string){
    setHex(v)
    setError('')
    if(!/^#[0-9a-fA-F]{6}$/.test(v)){setError('Enter a valid hex color e.g. #3b82f6')}
  }

  const valid=/^#[0-9a-fA-F]{6}$/.test(hex)
  const rgb=valid?hexToRgb(hex):null
  const hsl=rgb?rgbToHsl(rgb.r,rgb.g,rgb.b):null

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex gap-3 items-start flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">HEX Color</label>
            <input
              type="text"
              value={hex}
              onChange={e=>handleHex(e.target.value)}
              placeholder="#3b82f6"
              className="border rounded px-3 py-2 font-mono w-36"
            />
            {error&&<p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <input type="color" value={valid?hex:'#000000'} onChange={e=>handleHex(e.target.value)}
            className="w-10 h-10 mt-6 rounded cursor-pointer border"/>
        </div>
        {valid&&rgb&&hsl&&(
          <div className="space-y-2">
            <div style={{background:hex}} className="w-full h-16 rounded border"/>
            {[
              {label:'HEX',val:hex.toUpperCase()},
              {label:'RGB',val:`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`},
              {label:'HSL',val:`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`},
              {label:'RGB Values',val:`R: ${rgb.r}  G: ${rgb.g}  B: ${rgb.b}`},
            ].map(({label,val})=>(
              <div key={label} className="flex justify-between items-center bg-gray-50 border rounded px-3 py-2">
                <span className="font-medium text-sm w-24">{label}</span>
                <span className="font-mono text-sm flex-1">{val}</span>
                <button onClick={()=>navigator.clipboard.writeText(val)}
                  className="text-xs text-blue-500 hover:underline ml-2">Copy</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
