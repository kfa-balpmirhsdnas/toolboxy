'use client'
import {useState,useRef} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='image-color-picker')
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const [picked,setPicked]=useState<string[]>([])
  const [hover,setHover]=useState('')
  const [imgLoaded,setImgLoaded]=useState(false)

  function loadImage(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0]
    if(!file) return
    const canvas=canvasRef.current!
    const ctx=canvas.getContext('2d')!
    const img=new Image()
    img.onload=()=>{
      canvas.width=img.width
      canvas.height=img.height
      ctx.drawImage(img,0,0)
      setImgLoaded(true)
    }
    img.src=URL.createObjectURL(file)
  }

  function pick(e:React.MouseEvent<HTMLCanvasElement>){
    const canvas=canvasRef.current!
    const rect=canvas.getBoundingClientRect()
    const x=Math.floor((e.clientX-rect.left)*(canvas.width/rect.width))
    const y=Math.floor((e.clientY-rect.top)*(canvas.height/rect.height))
    const [r,g,b]=canvasRef.current!.getContext('2d')!.getImageData(x,y,1,1).data
    const hex='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')
    setPicked(prev=>[hex,...prev.slice(0,9)])
  }

  function onMove(e:React.MouseEvent<HTMLCanvasElement>){
    const canvas=canvasRef.current!
    const rect=canvas.getBoundingClientRect()
    const x=Math.floor((e.clientX-rect.left)*(canvas.width/rect.width))
    const y=Math.floor((e.clientY-rect.top)*(canvas.height/rect.height))
    const [r,g,b]=canvas.getContext('2d')!.getImageData(x,y,1,1).data
    setHover('#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''))
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <input type="file" accept="image/*" onChange={loadImage} className="block"/>
        {hover&&<div className="flex items-center gap-2 text-sm">
          <div style={{background:hover}} className="w-6 h-6 rounded border"/>
          <span className="font-mono">{hover.toUpperCase()}</span>
        </div>}
        <canvas ref={canvasRef}
          className="max-w-full border rounded cursor-crosshair"
          style={{display:imgLoaded?'block':'none',maxHeight:'400px'}}
          onClick={pick} onMouseMove={onMove}/>
        {!imgLoaded&&<p className="text-gray-400 text-sm">{t('icp_upload')}</p>}
        {picked.length>0&&(
          <div>
            <p className="text-sm font-medium mb-2">{t('icp_picked')} ({picked.length})</p>
            <div className="flex flex-wrap gap-2">
              {picked.map((c,i)=>(
                <button key={i} onClick={()=>navigator.clipboard.writeText(c)}
                  className="flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-50 text-xs">
                  <span style={{background:c}} className="w-4 h-4 rounded"/>
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
