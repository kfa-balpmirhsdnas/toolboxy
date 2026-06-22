'use client'
import { useState, useRef, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('image-resizer')!
export default function ImageResizerPage({ params }: { params: { lang: string } }) {
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState<string|null>(null)
  const [origSize, setOrigSize] = useState<{w:number;h:number}|null>(null)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [keepRatio, setKeepRatio] = useState(true)
  const [quality, setQuality] = useState(90)
  const [format, setFormat] = useState<'image/jpeg'|'image/png'|'image/webp'>('image/jpeg')
  const [output, setOutput] = useState<string|null>(null)
  const [outputSize, setOutputSize] = useState<{w:number;h:number}|null>(null)
  const [outputBytes, setOutputBytes] = useState(0)
  const [loading, setLoading] = useState(false)
  const handleFile=useCallback((f: File)=>{
    setFile(f);setOutput(null)
    const url=URL.createObjectURL(f);setPreview(url)
    const img=new Image();img.onload=()=>{setOrigSize({w:img.naturalWidth,h:img.naturalHeight});setWidth(String(img.naturalWidth));setHeight(String(img.naturalHeight))};img.src=url
  },[])
  const onDrop=useCallback((e: React.DragEvent)=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type.startsWith('image/'))handleFile(f)},[handleFile])
  function handleW(v: string){setWidth(v);if(keepRatio&&origSize&&v)setHeight(String(Math.round(Number(v)*origSize.h/origSize.w)))}
  function handleH(v: string){setHeight(v);if(keepRatio&&origSize&&v)setWidth(String(Math.round(Number(v)*origSize.w/origSize.h)))}
  async function resize(){
    if(!file||!origSize)return;setLoading(true)
    const w=Math.max(1,parseInt(width)||origSize.w),h=Math.max(1,parseInt(height)||origSize.h)
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h
    const ctx=canvas.getContext('2d')!;const im=new Image();im.src=preview!
    await new Promise(r=>{im.onload=r});ctx.drawImage(im,0,0,w,h)
    const url=canvas.toDataURL(format,quality/100);setOutput(url);setOutputSize({w,h})
    setOutputBytes(Math.round((url.length-url.indexOf(',')-1)*0.75));setLoading(false)
  }
  function download(){if(!output)return;const a=document.createElement('a');a.href=output;a.download=`resized-${Date.now()}.${format.split('/')[1]}`;a.click()}
  const fmt=(b: number)=>b<1024?`${b} B`:b<1048576?`${(b/1024).toFixed(1)} KB`:`${(b/1048576).toFixed(1)} MB`
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {!file?(<div onDrop={onDrop} onDragOver={e=>e.preventDefault()} onClick={()=>document.getElementById('img-input')?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"><p className="text-4xl mb-3">🖼</p><p className="text-sm font-medium text-gray-600">Drop an image here or click to browse</p><p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP, GIF</p><input id="img-input" type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}} /></div>):(
        <>
          <div className="flex gap-4 items-start flex-wrap">
            <div className="shrink-0"><img src={preview!} alt="Preview" className="max-w-[200px] max-h-[150px] rounded-xl border border-gray-200 object-contain" />{origSize&&<p className="text-xs text-gray-400 mt-1 text-center">{origSize.w}×{origSize.h} · {fmt(file.size)}</p>}</div>
            <div className="flex-1 space-y-4 min-w-[240px]">
              <div><div className="flex items-center gap-2 mb-2"><p className="text-sm font-medium text-gray-700">Dimensions</p><label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500 ml-auto"><input type="checkbox" checked={keepRatio} onChange={e=>setKeepRatio(e.target.checked)} className="accent-brand-600" />Lock ratio</label></div>
              <div className="flex items-center gap-2"><input type="number" value={width} onChange={e=>handleW(e.target.value)} min={1} placeholder="Width" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 text-center" /><span className="text-gray-400 text-sm">×</span><input type="number" value={height} onChange={e=>handleH(e.target.value)} min={1} placeholder="Height" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 text-center" /><span className="text-xs text-gray-400">px</span></div></div>
              <div className="flex flex-wrap gap-3"><div><label className="text-xs text-gray-500 block mb-1">Format</label><select value={format} onChange={e=>setFormat(e.target.value as typeof format)} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400"><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>{format!=='image/png'&&(<div><label className="text-xs text-gray-500 block mb-1">Quality: {quality}%</label><input type="range" min={10} max={100} value={quality} onChange={e=>setQuality(Number(e.target.value))} className="w-32 accent-brand-600" /></div>)}</div>
              <div className="flex gap-2 flex-wrap"><button onClick={resize} disabled={loading} className="bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors">{loading?'Resizing…':'Resize Image'}</button><button onClick={()=>{setFile(null);setPreview(null);setOutput(null)}} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors">New image</button></div>
            </div>
          </div>
          {output&&(<div className="border-t border-gray-100 pt-5"><div className="flex gap-4 items-start flex-wrap"><div><img src={output} alt="Resized" className="max-w-[200px] max-h-[150px] rounded-xl border border-gray-200 object-contain" />{outputSize&&<p className="text-xs text-gray-400 mt-1 text-center">{outputSize.w}×{outputSize.h} · {fmt(outputBytes)}</p>}</div><button onClick={download} className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors mt-2">↓ Download</button></div></div>)}
        </>)}
        <p className="text-xs text-gray-400">Processing is done locally. Your images are never uploaded.</p>
      </div>
    </ToolLayout>
  )
}