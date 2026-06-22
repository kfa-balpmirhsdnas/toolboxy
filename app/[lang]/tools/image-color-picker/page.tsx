'use client'
import { useState, useRef, useCallback } from 'react'

function rgbToHex(r:number,g:number,b:number){return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase()}
function rgbToHsl(r:number,g:number,b:number){
  const rs=r/255,gs=g/255,bs=b/255
  const max=Math.max(rs,gs,bs),min=Math.min(rs,gs,bs)
  let h=0,s=0;const l=(max+min)/2
  if(max!==min){
    const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min)
    if(max===rs)h=((gs-bs)/d+(gs<bs?6:0))/6
    else if(max===gs)h=((bs-rs)/d+2)/6
    else h=((rs-gs)/d+4)/6
  }
  return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)}
}

export default function ImageColorPicker() {
  const [colors,setColors]=useState<Array<{hex:string,r:number,g:number,b:number,x:number,y:number}>>([])
  const [hovering,setHovering]=useState<{hex:string,x:number,y:number}|null>(null)
  const [imgSrc,setImgSrc]=useState('')
  const [copied,setCopied]=useState('')
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const imgRef=useRef<HTMLImageElement>(null)

  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return
    const url=URL.createObjectURL(f);setImgSrc(url);setColors([])
  }

  const drawImage=(src:string)=>{
    const canvas=canvasRef.current;const img=imgRef.current;if(!canvas||!img)return
    canvas.width=img.naturalWidth;canvas.height=img.naturalHeight
    const ctx=canvas.getContext('2d');if(!ctx)return
    ctx.drawImage(img,0,0)
  }

  const getPixel=(e:React.MouseEvent<HTMLCanvasElement>)=>{
    const canvas=canvasRef.current;if(!canvas)return
    const rect=canvas.getBoundingClientRect()
    const scaleX=canvas.width/rect.width,scaleY=canvas.height/rect.height
    const x=Math.floor((e.clientX-rect.left)*scaleX),y=Math.floor((e.clientY-rect.top)*scaleY)
    const ctx=canvas.getContext('2d');if(!ctx)return
    const [r,g,b]=ctx.getImageData(x,y,1,1).data
    return{hex:rgbToHex(r,g,b),r,g,b,x,y}
  }

  const handleMove=(e:React.MouseEvent<HTMLCanvasElement>)=>{
    const px=getPixel(e);if(px){setHovering({hex:px.hex,x:e.clientX,y:e.clientY})}
  }

  const handleClick=(e:React.MouseEvent<HTMLCanvasElement>)=>{
    const px=getPixel(e);if(px&&colors.length<20)setColors(c=>[...c,px])
  }

  const copy=async(text:string)=>{await navigator.clipboard.writeText(text);setCopied(text);setTimeout(()=>setCopied(''),2000)}

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Color Picker</h1>
        <p className="text-gray-500 mb-8">Upload an image and click anywhere to extract colors. Get HEX, RGB, and HSL values instantly.</p>
        {!imgSrc?(
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-white">
            <span className="text-4xl mb-3">🖼</span>
            <span className="text-base font-medium text-gray-600">Click or drag to upload image</span>
            <span className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP, GIF supported</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden"/>
          </label>
        ):(
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 relative overflow-hidden">
                <canvas ref={canvasRef} onMouseMove={handleMove} onMouseLeave={()=>setHovering(null)} onClick={handleClick}
                  className="w-full rounded-xl cursor-crosshair"/>
                <img ref={imgRef} src={imgSrc} onLoad={()=>drawImage(imgSrc)} className="hidden" alt="source"/>
                {hovering && (
                  <div className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full -mt-2" style={{left:hovering.x,top:hovering.y}}>
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 flex items-center gap-2 shadow-xl">
                      <div className="w-4 h-4 rounded-full border border-white/30" style={{backgroundColor:hovering.hex}}/>
                      {hovering.hex}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">
                  📂 Change Image <input type="file" accept="image/*" onChange={handleFile} className="hidden"/>
                </label>
                <button onClick={()=>setColors([])} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Clear picks</button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Picked Colors ({colors.length}/20)</h3>
              {!colors.length&&<p className="text-sm text-gray-400 text-center py-8">Click the image to pick colors</p>}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {colors.map((c,i)=>{
                  const hsl=rgbToHsl(c.r,c.g,c.b)
                  return(
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg shrink-0 border border-gray-200" style={{backgroundColor:c.hex}}/>
                      <div className="flex-1 min-w-0">
                        {[['HEX',c.hex],['RGB',`rgb(${c.r},${c.g},${c.b})`],['HSL',`hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`]].map(([label,val])=>(
                          <div key={label} className="flex items-center justify-between gap-1">
                            <span className="text-xs text-gray-400 w-8">{label}</span>
                            <button onClick={()=>copy(val as string)} className={`text-xs font-mono text-gray-700 hover:text-blue-600 truncate ${copied===val?'text-green-600':''}`}>{copied===val?'✓':val}</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>setColors(cols=>cols.filter((_,j)=>j!==i))} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                    </div>
                  )
                })}
              </div>
              {colors.length>0&&(
                <button onClick={()=>copy(colors.map(c=>c.hex).join(', '))} className="mt-3 w-full py-2 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition-colors">
                  Copy all HEX colors
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}