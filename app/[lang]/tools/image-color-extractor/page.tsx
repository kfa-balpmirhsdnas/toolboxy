'use client'
import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('image-color-extractor')!
function rgbToHex(r:number,g:number,b:number):string{return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}
function getTopColors(data:Uint8ClampedArray,k:number):string[]{
  const freq:Record<string,number>={}
  for(let i=0;i<data.length;i+=16){
    const r=Math.round(data[i]/16)*16,g=Math.round(data[i+1]/16)*16,b=Math.round(data[i+2]/16)*16
    if(data[i+3]<128)continue
    const hex=rgbToHex(r,g,b)
    freq[hex]=(freq[hex]||0)+1
  }
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,k).map(([h])=>h)
}
function isLight(hex:string):boolean{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return(0.299*r+0.587*g+0.114*b)>128}
export default function ImageColorExtractorPage() {
  const t = useTranslations('toolui')
  const [colors,setColors]=useState<string[]>([])
  const [preview,setPreview]=useState<string|null>(null)
  const [loading,setLoading]=useState(false)
  const [copied,setCopied]=useState('')
  const fileRef=useRef<HTMLInputElement>(null)
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const extract=(file:File)=>{
    if(!file.type.startsWith('image/'))return
    setLoading(true)
    const reader=new FileReader()
    reader.onload=e=>{
      const src=e.target?.result as string
      setPreview(src)
      const img=new Image()
      img.onload=()=>{
        const c=canvasRef.current!
        const W=Math.min(img.width,200),H=Math.round(img.height*W/img.width)
        c.width=W;c.height=H
        const ctx=c.getContext('2d')!
        ctx.drawImage(img,0,0,W,H)
        const d=ctx.getImageData(0,0,W,H).data
        setColors(getTopColors(d,20))
        setLoading(false)
      }
      img.src=src
    }
    reader.readAsDataURL(file)
  }
  const onDrop=useCallback((e:React.DragEvent)=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)extract(f)},[])
  const copy=(h:string)=>{navigator.clipboard.writeText(h);setCopied(h);setTimeout(()=>setCopied(''),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <canvas ref={canvasRef} className="hidden"/>
        <div className={'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition '+(preview?'border-gray-200':'border-blue-300 hover:border-blue-400')}
          onDrop={onDrop} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files&&extract(e.target.files[0])}/>
          {preview?(
            <img src={preview} className="max-h-48 mx-auto rounded-xl object-contain" alt="uploaded"/>
          ):(
            <div className="space-y-2">
              <p className="text-3xl">🖼️</p>
              <p className="text-gray-600 font-medium">{t('ati_drop')}</p>
              <p className="text-xs text-gray-400">{t('ice_formats')}</p>
            </div>
          )}
        </div>
        {loading&&<p className="text-center text-gray-500 animate-pulse">{t('ice_extracting')}</p>}
        {colors.length>0&&(
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">{t('ice_top',{n:colors.length})}</p>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c,i)=>(
                <div key={i} className="rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition" onClick={()=>copy(c)}>
                  <div className="h-14" style={{background:c}}/>
                  <div className="px-1.5 py-1.5 text-center">
                    <p className="text-xs font-mono font-bold text-gray-700">{c.toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{copied===c?t('ui_copied'):t('ui_copy')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}