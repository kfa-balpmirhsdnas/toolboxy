'use client'
import { useState, useEffect, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('barcode-generator')!
function drawCode128(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,bw:number,bh:number):void{
  const CODE128_B:Record<string,number[]>={' ':[2,1,2,2,2,2],'!':[2,2,2,1,2,2],'"':[2,2,2,2,2,1],'#':[1,2,1,2,2,3],'$':[1,2,1,3,2,2],'%':[1,3,1,2,2,2],'&':[1,2,2,2,1,3],"'":[1,2,2,3,1,2],'(':[1,3,2,2,1,2],')':[1,1,2,2,3,2],'*':[1,2,2,1,3,2],'+':[1,2,2,2,3,1],',':[2,2,1,2,1,3],'-':[2,2,1,3,1,2],'.':[2,3,1,2,1,2],'/':[1,1,2,1,3,3],'0':[1,1,3,1,2,3],'1':[1,3,2,1,1,3],'2':[1,3,2,3,1,1],'3':[2,1,1,3,1,3],'4':[2,3,1,1,1,3],'5':[2,3,1,3,1,1],'6':[1,1,2,3,3,1],'7':[1,3,2,1,3,1],'8':[1,1,3,1,3,2],'9':[1,1,3,3,1,2],'A':[3,2,2,1,1,2],'B':[3,1,2,2,1,2],'C':[3,2,1,2,1,2],'D':[3,1,1,2,2,2],'E':[3,2,1,1,2,2],'F':[3,1,2,1,2,2],'G':[2,2,3,2,1,1],'H':[2,1,3,2,1,2],'I':[2,1,3,1,2,2],'J':[2,2,3,1,2,1],'K':[2,1,2,3,1,2],'L':[2,3,1,2,3,1],'M':[2,1,1,1,3,3],'N':[2,1,3,3,1,1],'O':[2,3,3,1,1,1],'P':[2,1,3,1,3,1],'Q':[3,1,2,1,3,1],'R':[3,1,2,3,1,1],'S':[3,3,2,1,1,1],'T':[3,1,2,1,1,3],'U':[1,2,2,2,4,1],'V':[1,4,2,1,2,1],'W':[2,4,1,2,1,1],'X':[1,2,1,4,2,1],'Y':[1,2,1,2,4,1],'Z':[1,2,1,2,2,4]}
  const START_B=[2,1,1,4,1,2]
  const STOP=[2,3,3,1,1,1,2]
  let bars:number[][]=[]
  bars.push(START_B)
  let checksum=104
  for(let i=0;i<text.length;i++){
    const ch=text[i],code=CODE128_B[ch.toUpperCase()]
    if(code){bars.push(code);checksum+=(i+1)*Object.keys(CODE128_B).indexOf(ch.toUpperCase())}
  }
  const checkVal=checksum%103
  bars.push(Object.values(CODE128_B)[checkVal]||[2,1,2,2,2,2])
  bars.push(STOP)
  let cx=x
  bars.forEach((bar,bi)=>{
    bar.forEach((w,i)=>{
      if(i%2===0){ctx.fillStyle='#000';ctx.fillRect(cx,y,w*bw,bh)}
      cx+=w*bw
    })
  })
}
export default function BarcodeGeneratorPage() {
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const [text,setText]=useState('TOOLBOXY')
  const [scale,setScale]=useState(2)
  const [height,setHeight]=useState(80)
  const [fg,setFg]=useState('#000000')
  const [bg,setBg]=useState('#ffffff')
  const [showText,setShowText]=useState(true)
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return
    const ctx=c.getContext('2d')!
    const W=text.length*14*scale+80,H=height+40
    c.width=W;c.height=H
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
    ctx.fillStyle=fg
    drawCode128(ctx,text,20,10,scale,height)
    if(showText){ctx.font='14px monospace';ctx.fillStyle=fg;ctx.textAlign='center';ctx.fillText(text,W/2,height+30)}
  },[text,scale,height,fg,bg,showText])
  const download=()=>{const c=canvasRef.current;if(!c)return;const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='barcode.png';a.click()}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Text / Number</label>
          <input value={text} onChange={e=>setText(e.target.value.toUpperCase().replace(/[^A-Z0-9 !#$%&'()*+,./:-]/g,''))} className="w-full rounded border border-gray-300 px-3 py-2.5 font-mono text-lg" maxLength={30}/></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Scale: {scale}x</label>
            <input type="range" min="1" max="4" value={scale} onChange={e=>setScale(Number(e.target.value))} className="w-full"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Height: {height}px</label>
            <input type="range" min="40" max="160" value={height} onChange={e=>setHeight(Number(e.target.value))} className="w-full"/></div>
          <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
            <input type="checkbox" checked={showText} onChange={e=>setShowText(e.target.checked)} className="rounded"/>Show text
          </label>
        </div>
        <div className="flex justify-center bg-gray-50 rounded-xl p-4 border border-gray-200 overflow-x-auto">
          <canvas ref={canvasRef} className="max-w-full"/>
        </div>
        <button onClick={download} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Download PNG</button>
        <p className="text-xs text-gray-400 text-center">Code 128B — supports A-Z, 0-9, and common symbols</p>
      </div>
    </ToolLayout>
  )
}