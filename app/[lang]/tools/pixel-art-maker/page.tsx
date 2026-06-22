'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('pixel-art-maker')!
const PALETTE=['#000000','#ffffff','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f59e0b','#6b7280','#9ca3af','#d1d5db','transparent']
const SIZE=16
function makeGrid():string[][]{return Array.from({length:SIZE},()=>Array(SIZE).fill('transparent'))}
export default function PixelArtMakerPage() {
  const [grid,setGrid]=useState<string[][]>(makeGrid)
  const [color,setColor]=useState('#000000')
  const [tool2,setTool2]=useState<'draw'|'erase'|'fill'>('draw')
  const painting=useRef(false)
  const paint=(r:number,c:number)=>{
    if(tool2==='fill'){
      const target=grid[r][c]
      if(target===color)return
      const newGrid=grid.map(row=>[...row])
      const stack=[[r,c]]
      while(stack.length){const[cr,cc]=stack.pop()!;if(cr<0||cr>=SIZE||cc<0||cc>=SIZE||newGrid[cr][cc]!==target)continue;newGrid[cr][cc]=color;stack.push([cr+1,cc],[cr-1,cc],[cr,cc+1],[cr,cc-1])}
      setGrid(newGrid)
    }else{
      setGrid(g=>{const n=g.map(row=>[...row]);n[r][c]=tool2==='erase'?'transparent':color;return n})
    }
  }
  const exportPng=()=>{
    const canvas=document.createElement('canvas');canvas.width=SIZE*10;canvas.height=SIZE*10
    const ctx=canvas.getContext('2d')!
    grid.forEach((row,ri)=>row.forEach((cell,ci)=>{ctx.fillStyle=cell==='transparent'?'rgba(0,0,0,0)':cell;ctx.fillRect(ci*10,ri*10,10,10)}))
    const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='pixel-art.png';a.click()
  }
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex rounded overflow-hidden border border-gray-300">
            {(['draw','erase','fill'] as const).map(t=>(
              <button key={t} onClick={()=>setTool2(t)} className={`px-3 py-1.5 text-xs font-medium capitalize transition ${tool2===t?'bg-gray-900 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>{t==='draw'?'Draw':t==='erase'?'Erase':'Fill'}</button>
            ))}
          </div>
          <button onClick={()=>setGrid(makeGrid())} className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50">Clear</button>
          <button onClick={exportPng} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Export PNG</button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {PALETTE.map(c=>(
            <button key={c} onClick={()=>{setColor(c);setTool2('draw')}}
              className={`w-8 h-8 rounded border-2 transition ${color===c&&tool2==='draw'?'border-blue-600 scale-110':'border-gray-300'} ${c==='transparent'?'bg-[url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAHUlEQVQoU2NkYGD4z8BQDwQMjOoLGVAPBgwAAIkABsHxYMQAAAAASUVORK5CYII=")] bg-repeat':''}`}
              style={c!=='transparent'?{background:c}:{}}/>
          ))}
          <input type="color" value={color==='transparent'?'#000000':color} onChange={e=>{setColor(e.target.value);setTool2('draw')}} className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer p-0" title="Custom color"/>
        </div>
        <div
          className="border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair select-none"
          style={{display:'grid',gridTemplateColumns:`repeat(${SIZE},1fr)`,aspectRatio:'1'}}
          onMouseLeave={()=>{painting.current=false}}>
          {grid.map((row,ri)=>row.map((cell,ci)=>(
            <div key={`${ri}-${ci}`}
              style={{background:cell==='transparent'?'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 8px 8px':cell}}
              onMouseDown={()=>{painting.current=true;paint(ri,ci)}}
              onMouseEnter={()=>{if(painting.current)paint(ri,ci)}}
              onMouseUp={()=>{painting.current=false}}/>
          )))}
        </div>
      </div>
    </ToolLayout>
  )
}