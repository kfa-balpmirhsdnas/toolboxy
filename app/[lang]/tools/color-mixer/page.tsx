'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('color-mixer')!

function hexToRgb(hex: string): [number,number,number] {
  const h = hex.replace('#','')
  const n = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16)
  return [(n>>16)&255,(n>>8)&255,n&255]
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')
}
function rgbToHsl(r: number, g: number, b: number): [number,number,number] {
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h=0,s=0;const l=(max+min)/2;
  if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}}
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)]
}

interface Color { hex: string; weight: number }

export default function ColorMixerPage({ params }: { params: { lang: string } }) {
  const [colors, setColors] = useState<Color[]>([
    { hex: '#6366f1', weight: 50 },
    { hex: '#ec4899', weight: 50 },
  ])
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('color-mixer'); tracked.current = true }
  }

  function updateColor(i: number, field: 'hex'|'weight', val: string|number) {
    const c = [...colors]
    if (field === 'hex') c[i] = { ...c[i], hex: String(val) }
    else c[i] = { ...c[i], weight: Number(val) }
    setColors(c); track()
  }

  function addColor() {
    if (colors.length < 5) setColors([...colors, { hex: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'), weight: 50 }])
  }
  function removeColor(i: number) { if (colors.length > 2) setColors(colors.filter((_,idx)=>idx!==i)) }

  const totalWeight = colors.reduce((s,c) => s+c.weight, 0)
  const mixed = colors.reduce((acc, c) => {
    const [r,g,b] = hexToRgb(c.hex)
    const w = totalWeight > 0 ? c.weight/totalWeight : 1/colors.length
    return [acc[0]+r*w, acc[1]+g*w, acc[2]+b*w]
  }, [0,0,0])
  const mixedHex = rgbToHex(mixed[0],mixed[1],mixed[2])
  const [r,g,b] = [Math.round(mixed[0]),Math.round(mixed[1]),Math.round(mixed[2])]
  const [h,s,l] = rgbToHsl(r,g,b)
  const cssRgb = 'rgb('+r+', '+g+', '+b+')'
  const cssHsl = 'hsl('+h+', '+s+'%, '+l+'%)'

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('color-mixer')
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="space-y-3">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <input type="color" value={c.hex} onChange={e => updateColor(i,'hex',e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 flex-shrink-0" />
              <code className="text-xs font-mono w-20 text-gray-700">{c.hex}</code>
              <div className="flex-1 flex items-center gap-2">
                <input type="range" min={1} max={100} value={c.weight} onChange={e => updateColor(i,'weight',parseInt(e.target.value))}
                  className="flex-1 accent-brand-600" />
                <span className="text-xs font-mono text-gray-500 w-8 text-right">{c.weight}</span>
              </div>
              {colors.length > 2 && (
                <button onClick={() => removeColor(i)} className="text-red-400 hover:text-red-600 text-sm font-bold">\u00D7</button>
              )}
            </div>
          ))}
        </div>
        {colors.length < 5 && (
          <button onClick={addColor} className="text-xs text-brand-600 hover:underline">+ Add color</button>
        )}
        <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: 'linear-gradient(135deg,' + colors.map(c=>c.hex).join(',') + ')' }}>
          <div className="w-16 h-16 rounded-xl flex-shrink-0 border-2 border-white shadow" style={{ background: mixedHex }} />
          <div>
            <p className="text-xs text-white/70 mb-1">Mixed result</p>
            <p className="text-xl font-bold text-white font-mono">{mixedHex}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[[mixedHex,'HEX','hex'],[cssRgb,'RGB','rgb'],[cssHsl,'HSL','hsl']].map(([val,label,id]) => (
            <div key={id} onClick={() => copy(val,id)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xs font-mono text-gray-800 break-all">{val}</p>
              <p className="text-xs text-brand-400 mt-1">{copied===id ? '\u2713 Copied' : 'Copy'}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
