'use client'
import {useState,useEffect,useRef} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'
export default function Page(){
  const t = useTranslations('toolui')
  const [text,setText]=useState('https://toolboxy.net')
  const [size,setSize]=useState(2)
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const el=ref.current;if(!el||!text)return
    const w=text.length*size*11+20,h=80+size*10
    const svg=['<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">']
    svg.push('<rect width="'+w+'" height="'+h+'" fill="white"/>')
    let x=10
    for(let i=0;i<text.length;i++){
      const code=text.charCodeAt(i)
      for(let b=7;b>=0;b--){
        if((code>>b)&1){svg.push('<rect x="'+x+'" y="10" width="'+size+'" height="'+(h-30)+'" fill="black"/>')}
        x+=size+1
      }
      x+=2
    }
    svg.push('<text x="'+w/2+'" y="'+(h-5)+'" font-family="monospace" font-size="12" text-anchor="middle" fill="black">'+text.slice(0,30)+'</text>')
    svg.push('</svg>')
    el.innerHTML=svg.join('')
  },[text,size])
  const dl=()=>{const el=ref.current;if(!el)return;const a=document.createElement('a');a.href='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(el.innerHTML);a.download='barcode.svg';a.click()}
  const tool=TOOLS.find(x=>x.slug==='barcode-generator')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('bc_texturl')}</label>
          <input value={text} onChange={e=>setText(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm"/></div>
        <label className="flex items-center gap-2 text-sm text-gray-700">{t('bc_scale')}
          <input type="range" min={1} max={4} value={size} onChange={e=>setSize(+e.target.value)} className="w-24"/>
          <span>{size}x</span></label>
        <div ref={ref} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-center overflow-x-auto min-h-20"/>
        <button onClick={dl} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">{t('sv_download')}</button>
      </div>
    </ToolLayout>
  )
}