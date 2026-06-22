'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('color-palette-generator')!

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  const l = (max+min)/2
  if (max === min) return [0,0,Math.round(l*100)]
  const d = max-min
  const s = l>0.5 ? d/(2-max-min) : d/(max+min)
  let h = 0
  if (max===r) h=(g-b)/d+(g<b?6:0)
  else if (max===g) h=(b-r)/d+2
  else h=(r-g)/d+4
  return [Math.round(h*60), Math.round(s*100), Math.round(l*100)]
}

function hslToHex(h: number, s: number, l: number): string {
  const sl = s/100, ll = l/100
  const a = sl*Math.min(ll,1-ll)
  const f = (n: number) => {
    const k=(n+h/30)%12
    const col=ll-a*Math.max(Math.min(k-3,9-k,1),-1)
    return Math.round(255*col).toString(16).padStart(2,'0')
  }
  return '#'+f(0)+f(8)+f(4)
}

type PaletteType = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'shades'

function generatePalette(baseHex: string, type: PaletteType): string[] {
  const [h,s,l] = hexToHsl(baseHex)
  switch(type) {
    case 'monochromatic':
      return [20,35,50,65,80].map(ll => hslToHex(h,s,ll))
    case 'analogous':
      return [-60,-30,0,30,60].map(dh => hslToHex((h+dh+360)%360,s,l))
    case 'complementary':
      return [hslToHex(h,s,l), hslToHex(h,s*0.8,Math.min(l+15,90)), hslToHex((h+180)%360,s,l), hslToHex((h+180)%360,s*0.8,Math.min(l+15,90)), hslToHex(h,s*0.5,Math.min(l+30,95))]
    case 'triadic':
      return [0,120,240].map(dh => hslToHex((h+dh)%360,s,l)).concat([hslToHex(h,s*0.6,Math.min(l+20,90)), hslToHex((h+120)%360,s*0.6,Math.min(l+20,90))])
    case 'tetradic':
      return [0,90,180,270].map(dh => hslToHex((h+dh)%360,s,l)).concat([hslToHex(h,s*0.5,Math.min(l+25,92))])
    case 'shades':
      return [10,25,40,55,70,85,95].map(ll => hslToHex(h,s,ll))
    default:
      return [baseHex]
  }
}

const PALETTE_TYPES: { key: PaletteType; label: string }[] = [
  { key: 'monochromatic', label: 'Monochromatic' },
  { key: 'analogous', label: 'Analogous' },
  { key: 'complementary', label: 'Complementary' },
  { key: 'triadic', label: 'Triadic' },
  { key: 'tetradic', label: 'Tetradic' },
  { key: 'shades', label: 'Shades' },
]

export default function ColorPaletteGeneratorPage({ params }: { params: { lang: string } }) {
  const [base, setBase] = useState('#3B82F6')
  const [type, setType] = useState<PaletteType>('monochromatic')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  const palette = generatePalette(base, type)

  function handleBaseChange(hex: string) {
    if (!tracked.current) { trackToolUsed('color-palette-generator'); tracked.current = true }
    setBase(hex)
  }

  async function copyColor(hex: string) {
    await navigator.clipboard.writeText(hex)
    trackToolCopy('color-palette-generator')
    setCopied(hex)
    setTimeout(() => setCopied(null), 1500)
  }

  async function copyAll() {
    await navigator.clipboard.writeText(palette.join(', '))
    trackToolCopy('color-palette-generator')
    setCopied('all')
    setTimeout(() => setCopied(null), 1500)
  }

  function textColor(hex: string) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
    return (r*299+g*587+b*114)/1000 > 128 ? '#000000' : '#ffffff'
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* Base color */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Base Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={base} onChange={e => handleBaseChange(e.target.value)}
                className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input type="text" value={base.toUpperCase()} onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) handleBaseChange(e.target.value) }}
                className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 uppercase" />
            </div>
          </div>
        </div>
        {/* Palette type */}
        <div className="flex flex-wrap gap-2">
          {PALETTE_TYPES.map(({ key, label }) => (
            <button key={key} onClick={() => setType(key)}
              className={'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ' + (type===key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>
        {/* Palette display */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{PALETTE_TYPES.find(t=>t.key===type)?.label} Palette</p>
            <button onClick={copyAll} className="text-xs text-brand-600 hover:underline">{copied==='all' ? 'Copied!' : 'Copy all'}</button>
          </div>
          <div className={'grid gap-2 ' + (palette.length > 5 ? 'grid-cols-4 sm:grid-cols-7' : 'grid-cols-5')}>
            {palette.map((hex, i) => {
              const [hh,ss,ll] = hexToHsl(hex)
              return (
                <button key={i} onClick={() => copyColor(hex)}
                  className="group relative aspect-square rounded-xl border border-white/20 shadow-sm overflow-hidden transition-transform hover:scale-105"
                  style={{ backgroundColor: hex }}
                  title={'Click to copy ' + hex}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl">
                    <span className="text-xs font-bold" style={{ color: textColor(hex) }}>
                      {copied===hex ? '✓' : 'Copy'}
                    </span>
                  </div>
                  <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center">
                    <span className="text-xs font-mono font-semibold" style={{ color: textColor(hex), textShadow: '0 0 4px rgba(0,0,0,0.3)' }}>
                      {hex.toUpperCase()}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        {/* Details table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left text-gray-500 border border-gray-200">Color</th>
                <th className="p-2 text-left text-gray-500 border border-gray-200">HEX</th>
                <th className="p-2 text-left text-gray-500 border border-gray-200">HSL</th>
                <th className="p-2 text-left text-gray-500 border border-gray-200">RGB</th>
              </tr>
            </thead>
            <tbody>
              {palette.map((hex, i) => {
                const [hh,ss,ll] = hexToHsl(hex)
                const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-200">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: hex }} />
                    </td>
                    <td className="p-2 border border-gray-200 cursor-pointer hover:text-brand-600" onClick={() => copyColor(hex)}>{hex.toUpperCase()}</td>
                    <td className="p-2 border border-gray-200">hsl({hh},{ss}%,{ll}%)</td>
                    <td className="p-2 border border-gray-200">rgb({r},{g},{b})</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  )
}
