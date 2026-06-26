'use client'
import {useState,useRef,useEffect} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const t = useTranslations('toolui')
  const [text,setText]=useState('Hello, World!\nThis is handwriting.')
  const [size,setSize]=useState(32)
  const [ink,setInk]=useState('#1a1a2e')
  const [paper,setPaper]=useState('#fef9e7')
  const ref=useRef(null)
  useEffect(()=>{
    const c=ref.current;if(!c)return
    const ctx=c.getContext('2d');if(!ctx)return
    c.width=700;c.height=400
    ctx.fillStyle=paper;ctx.fillRect(0,0,700,400)
    const lh=size*1.8
    ctx.strokeStyle='rgba(180,180,220,0.4)';ctx.lineWidth=1
    for(let y=lh;y<400;y+=lh){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(680,y);ctx.stroke()}
    ctx.fillStyle=ink;ctx.textBaseline='alphabetic'
    ctx.font=size+"px 'Segoe Script','Comic Sans MS',cursive"
    text.split('\n').forEach((line,i)=>ctx.fillText(line,30,lh*(i+0.75),640))
  },[text,size,ink,paper])
  const dl=()=>{const c=ref.current;if(!c)return;const a=document.createElement('a');a.href=c.toDataURL();a.download='handwriting.png';a.click()}
  const tool=TOOLS.find(x=>x.slug==='text-to-handwriting')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 text-sm resize-none"/>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-700">{t('ui_size')}
            <input type="range" min={16} max={64} value={size} onChange={e=>setSize(+e.target.value)} className="w-24"/>
            <span>{size}px</span></label>
          <label className="flex items-center gap-2 text-sm text-gray-700">{t('tth_ink')}<input type="color" value={ink} onChange={e=>setInk(e.target.value)} className="w-8 h-8 rounded cursor-pointer"/></label>
          <label className="flex items-center gap-2 text-sm text-gray-700">{t('tth_paper')}<input type="color" value={paper} onChange={e=>setPaper(e.target.value)} className="w-8 h-8 rounded cursor-pointer"/></label>
        </div>
        <canvas ref={ref} className="w-full rounded-xl border border-gray-200"/>
        <button onClick={dl} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">{t('ati_downloadpng')}</button>
      </div>
    </ToolLayout>
  )
}