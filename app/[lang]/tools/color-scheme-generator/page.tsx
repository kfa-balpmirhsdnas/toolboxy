'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('color-scheme-generator')!

function hslToHex(h: number, s: number, l: number): string {
  s/=100; l/=100
  const a = s*Math.min(l,1-l)
  const f = (n: number) => {
    const k = (n+h/30)%12
    const c = l-a*Math.max(-1,Math.min(k-3,9-k,1))
    return Math.round(255*c).toString(16).padStart(2,'0')
  }
  return '#'+f(0)+f(8)+f(4)
}

function hexToHsl(hex: string): [number,number,number] {
  const r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255
  const max=Math.max(r,g,b), min=Math.min(r,g,b)
  let h=0, s=0; const l=(max+min)/2
  if (max!==min) {
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min)
    switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6}
  }
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)]
}

type Scheme = 'monochromatic'|'complementary'|'triadic'|'tetradic'|'analogous'|'split-complementary'

function generateScheme(hex: string, scheme: Scheme): string[] {
  const [h,s,l] = hexToHsl(hex)
  switch(scheme) {
    case 'monochromatic': return [
      hslToHex(h,s,Math.max(10,l-30)), hslToHex(h,s,Math.max(10,l-15)),
      hex, hslToHex(h,s,Math.min(90,l+15)), hslToHex(h,s,Math.min(90,l+30))
    ]
    case 'complementary': return [hex, hslToHex((h+180)%360,s,l), hslToHex(h,s,Math.min(90,l+20)), hslToHex((h+180)%360,s,Math.min(90,l+20)), hslToHex(h,Math.max(10,s-20),Math.min(90,l+35))]
    case 'triadic': return [hex, hslToHex((h+120)%360,s,l), hslToHex((h+240)%360,s,l), hslToHex(h,s,Math.min(90,l+20)), hslToHex((h+120)%360,s,Math.min(90,l+20))]
    case 'tetradic': return [hex, hslToHex((h+90)%360,s,l), hslToHex((h+180)%360,s,l), hslToHex((h+270)%360,s,l), hslToHex(h,Math.max(10,s-20),Math.min(90,l+35))]
    case 'analogous': return [hslToHex((h-40+360)%360,s,l), hslToHex((h-20+360)%360,s,l), hex, hslToHex((h+20)%360,s,l), hslToHex((h+40)%360,s,l)]
    case 'split-complementary': return [hex, hslToHex((h+150)%360,s,l), hslToHex((h+210)%360,s,l), hslToHex(h,s,Math.min(90,l+25)), hslToHex((h+180)%360,Math.max(10,s-20),Math.min(90,l+25))]
  }
}

export default function ColorSchemeGeneratorPage({ params }: { params: { lang: string } }) {
  const [base, setBase] = useState('#6366f1')
  const [scheme, setScheme] = useState<Scheme>('analogous')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('color-scheme-generator'); tracked.current = true }
  }

  const colors = generateScheme(base, scheme)

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('color-scheme-generator')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  async function copyAll() {
    await navigator.clipboard.writeText(colors.join(', '))
    trackToolCopy('color-scheme-generator')
    setCopied('all'); setTimeout(()=>setCopied(null),1500)
  }

  const SCHEMES: [Scheme,string][] = [['analogous','Analogous'],['complementary','Complementary'],['triadic','Triadic'],['tetradic','Tetradic'],['monochromatic','Monochromatic'],['split-complementary','Split Comp.']]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Base color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={base} onChange={e=>{setBase(e.target.value);track()}} className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200" />
              <input value={base} onChange={e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){setBase(e.target.value);track()}}} 
                className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SCHEMES.map(([s,label])=>(
            <button key={s} onClick={()=>{ setScheme(s); track() }}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (scheme===s?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex h-24 rounded-2xl overflow-hidden shadow-sm">
          {colors.map((c,i)=>(
            <div key={i} className="flex-1 cursor-pointer relative group" style={{ background: c }} onClick={()=>copy(c,c)}>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                <span className="text-white text-xs font-mono">{copied===c?'\u2713':c}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((c,i)=>(
            <div key={i} onClick={()=>copy(c,c+'_'+i)} className="cursor-pointer group">
              <div className="h-12 rounded-xl mb-1 transition-transform group-hover:scale-105" style={{ background: c }} />
              <p className="text-xs font-mono text-center text-gray-600">{c}</p>
              <p className="text-xs text-center text-brand-400 opacity-0 group-hover:opacity-100">{copied===c+'_'+i?'\u2713':'copy'}</p>
            </div>
          ))}
        </div>
        <button onClick={copyAll} className="text-xs text-brand-600 hover:underline">{copied==='all'?'\u2713 Copied all':'Copy all colors'}</button>
      </div>
    </ToolLayout>
  )
}
