'use client'
import { useState, useRef, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('image-resizer')!
export default function ImageResizerPage() {
  const [src,setSrc]=useState<string|null>(null)
  const [origW,setOrigW]=useState(0)
  const [origH,setOrigH]=useState(0)
  const [w,setW]=useState(0)
  const [h,setH]=useState(0)
  const [lock,setLock]=useState(true)
  const [quality,setQuality]=useState(0.9)
  const [format,setFormat]=useState('image/jpeg')
  const [resized,setResized]=useState<string|null>(null)
  const [resizedSize,setResizedSize]=useState(0)
  const fileRef=useRef<HTMLInputElement>(null)
  const loadImg=(file:File)=>{
    if(!file.type.startsWith('image/'))return
    const url=URL.createObjectURL(file)
    const img=new Image()
    img.onload=()=>{setOrigW(img.width);setOrigH(img.height);setW(img.width);setH(img.height);setSrc(url);setResized(null)}
    img.src=url
  }
  const onDrop=useCallback((e:React.DragEvent)=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)loadImg(f)},[])
  const setWidth=(nw:number)=>{setW(nw);if(lock&&origW>0)setH(Math.round(nw*origH/origW))}
  const setHeight=(nh:number)=>{setH(nh);if(lock&&origH>0)setW(Math.round(nh*origW/origH))}
  const resize=()=>{
    if(!src)return
    const img=new Image();img.src=src
    img.onload=()=>{
      const c=document.createElement('canvas')
      c.width=w;c.height=h
      const ctx=c.getContext('2d')!
      ctx.drawImage(img,0,0,w,h)
      const dataUrl=c.toDataURL(format,quality)
      setResized(dataUrl)
      const base64=dataUrl.split(',')[1]
      setResizedSize(Math.round(base64.length*0.75/1024))
    }
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className={'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer '+(src?'border-gray-200':'border-blue-300 hover:border-blue-400')}
          onDrop={onDrop} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files&&loadImg(e.target.files[0])}/>
          {src?(
            <div className="flex items-center gap-4">
              <img src={src} className="max-h-28 rounded-lg object-contain" alt="source"/>
              <div className="text-left text-sm text-gray-600">
                <p className="font-semibold">{origW} x {origH}px</p>
                <p className="text-xs text-gray-400">Click to change</p>
              </div>
            </div>
          ):(
            <div><p className="text-3xl mb-2">🖼️</p><p className="text-gray-600 font-medium">Drop image or click</p></div>
          )}
        </div>
        {src&&(
          <>
            <div className="flex gap-3 items-end">
              <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                <input type="number" value={w} onChange={e=>setWidth(Number(e.target.value))} min="1" className="w-full rounded border border-gray-300 px-3 py-2.5 text-lg font-mono text-center"/></div>
              <button onClick={()=>setLock(l=>!l)} className={'px-3 py-2.5 rounded border text-sm transition '+(lock?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-600 hover:bg-gray-50')}>{lock?'Lock':'Free'}</button>
              <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                <input type="number" value={h} onChange={e=>setHeight(Number(e.target.value))} min="1" className="w-full rounded border border-gray-300 px-3 py-2.5 text-lg font-mono text-center"/></div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Format</label>
                <select value={format} onChange={e=>setFormat(e.target.value)} className="w-full rounded border border-gray-300 px-2 py-2 text-sm">
                  <option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>
              {format!=='image/png'&&<div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Quality: {Math.round(quality*100)}%</label>
                <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="w-full mt-2"/></div>}
              <div className="flex gap-1.5 flex-wrap self-end pb-0.5">
                {[['25%',0.25],['50%',0.5],['75%',0.75],['100%',1]].map(([l,s])=>(
                  <button key={l} onClick={()=>{setW(Math.round(origW*Number(s)));setH(Math.round(origH*Number(s)))}}
                    className="px-2 py-1.5 rounded border border-gray-200 text-xs hover:bg-gray-50">{l}</button>
                ))}
              </div>
            </div>
            <button onClick={resize} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Resize Image</button>
            {resized&&(
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Result: <span className="font-semibold">{w}x{h}px</span> — ~{resizedSize}KB</p>
                  <a href={resized} download={'resized.'+format.split('/')[1]} className="text-sm text-blue-600 hover:underline">Download</a>
                </div>
                <img src={resized} className="max-w-full rounded-xl border border-gray-200" alt="resized"/>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}