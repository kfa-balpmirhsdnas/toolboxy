'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('text-to-handwriting')!
const FONTS=['Caveat','Satisfy','Dancing Script','Pacifico','Patrick Hand']
export default function TextToHandwritingPage() {
  const [text,setText]=useState('Hello! This is handwriting.')
  const [font,setFont]=useState('Caveat')
  const [size,setSize]=useState(36)
  const [color,setColor]=useState('#1a1a2e')
  const [bg,setBg]=useState('#fffef0')
  const [lineH,setLineH]=useState(1.6)
  const [slant,setSlant]=useState(0)
  const [ruled,setRuled]=useState(true)
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const [copied,setCopied]=useState(false)
  useEffect(()=>{
    const link=document.createElement('link')
    link.rel='stylesheet'
    link.href='https://fonts.googleapis.com/css2?family=Caveat&family=Satisfy&family=Dancing+Script&family=Pacifico&family=Patrick+Hand&display=swap'
    document.head.appendChild(link)
  },[])
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return
    const ctx=c.getContext('2d')!
    const W=600,lh=size*lineH
    const lines=text.split('
')
    const H=Math.max(200,lines.length*lh+size*1.5)
    c.width=W;c.height=H
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
    if(ruled){
      ctx.strokeStyle=color==='#1a1a2e'?'#e8e4d4':'#cccccc';ctx.lineWidth=0.5
      for(let y=lh+size*0.5;y<H;y+=lh){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(W-20,y);ctx.stroke()}
    }
    ctx.font=size+'px '+font+', cursive'
    ctx.fillStyle=color
    ctx.textBaseline='bottom'
    ctx.save()
    ctx.transform(1,Math.tan(slant*Math.PI/180),0,1,0,0)
    lines.forEach((line,i)=>{ctx.fillText(line,30,(i+1)*lh+size*0.3)})
    ctx.restore()
  },[text,font,size,color,bg,lineH,slant,ruled])
  const download=()=>{const c=canvasRef.current;if(!c)return;const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='handwriting.png';a.click()}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 resize-none"/></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-600 mb-1">Font</label>
            <select value={font} onChange={e=>setFont(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm">
              {FONTS.map(f=><option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}</select></div>
          <div><label className="block text-xs text-gray-600 mb-1">Size: {size}px</label>
            <input type="range" min="16" max="72" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full mt-1"/></div>
          <div className="flex gap-2 items-center">
            <div><label className="block text-xs text-gray-600 mb-1">Ink color</label>
              <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-12 h-9 rounded border border-gray-300 cursor-pointer p-0.5"/></div>
            <div><label className="block text-xs text-gray-600 mb-1">Paper</label>
              <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-12 h-9 rounded border border-gray-300 cursor-pointer p-0.5"/></div>
          </div>
          <div><label className="block text-xs text-gray-600 mb-1">Slant: {slant}°</label>
            <input type="range" min="-15" max="15" value={slant} onChange={e=>setSlant(Number(e.target.value))} className="w-full mt-1"/></div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={ruled} onChange={e=>setRuled(e.target.checked)} className="rounded"/>Ruled lines
        </label>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <canvas ref={canvasRef} className="w-full"/>
        </div>
        <button onClick={download} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Download PNG</button>
      </div>
    </ToolLayout>
  )
}