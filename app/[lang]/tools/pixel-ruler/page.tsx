'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('pixel-ruler')!

export default function PixelRulerPage({ params }: { params: { lang: string } }) {
  const [dpi, setDpi] = useState(96)
  const [unit, setUnit] = useState<'px'|'cm'|'in'>('px')
  const [rulerLen, setRulerLen] = useState(800)
  const [mouseX, setMouseX] = useState<number|null>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('pixel-ruler'); tracked.current = true } }

  // auto-detect DPI via 1-inch reference element
  useEffect(() => {
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;width:1in;left:-9999px'
    document.body.appendChild(el)
    const w = el.offsetWidth
    document.body.removeChild(el)
    if (w > 0) setDpi(w)
  }, [])

  const pxToCm = (px: number) => (px/dpi*2.54)
  const pxToIn = (px: number) => (px/dpi)

  function formatVal(px: number): string {
    if (unit==='px') return px+'px'
    if (unit==='cm') return pxToCm(px).toFixed(2)+'cm'
    return pxToIn(px).toFixed(3)+'in'
  }

  // tick marks
  const TICK_PX = unit==='px'?10:unit==='cm'?(dpi*0.1):Math.round(dpi/16)
  const ticks: {px:number;major:boolean}[] = []
  for (let px=0; px<=rulerLen; px+=TICK_PX) {
    const major = unit==='px'?px%50===0:unit==='cm'?Math.round(px/TICK_PX)%10===0:Math.round(px/TICK_PX)%16===0
    ticks.push({px,major})
  }

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return
    const rect = rulerRef.current.getBoundingClientRect()
    setMouseX(Math.round(e.clientX-rect.left))
    track()
  }, [])

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex gap-1">
            {(['px','cm','in'] as const).map(u=>(
              <button key={u} onClick={()=>setUnit(u)}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (unit===u?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {u}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">DPI</label>
            <input type="number" value={dpi} min={72} max={400} onChange={e=>setDpi(parseInt(e.target.value)||96)}
              className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Length</label>
            <input type="number" value={rulerLen} min={200} max={1600} step={50} onChange={e=>setRulerLen(parseInt(e.target.value)||800)}
              className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center" />
            <span className="text-xs text-gray-400">px</span>
          </div>
        </div>
        <div
          ref={rulerRef}
          onMouseMove={onMouseMove}
          onMouseLeave={()=>setMouseX(null)}
          className="relative h-16 bg-amber-50 border-2 border-amber-400 rounded-xl overflow-hidden cursor-crosshair select-none"
          style={{width:Math.min(rulerLen,780)}}>
          {/* ticks */}
          {ticks.map(({px,major})=>(
            <div key={px} className="absolute bottom-0 flex flex-col items-center" style={{left:px}}>
              <div className={'bg-amber-600 ' + (major?'h-4 w-px':'h-2 w-px')} />
              {major && <span className="absolute bottom-5 text-xs text-amber-800 font-mono" style={{transform:'translateX(-50%)',whiteSpace:'nowrap',fontSize:'9px'}}>{formatVal(px)}</span>}
            </div>
          ))}
          {/* cursor indicator */}
          {mouseX !== null && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none" style={{left:mouseX}}>
              <div className="absolute -top-0 left-1 text-xs text-red-600 font-mono font-bold whitespace-nowrap bg-white/80 px-1 rounded" style={{fontSize:'10px'}}>
                {formatVal(mouseX)}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">Move mouse over the ruler to measure. Screen DPI auto-detected: {dpi}px/in.</p>
      </div>
    </ToolLayout>
  )
}
