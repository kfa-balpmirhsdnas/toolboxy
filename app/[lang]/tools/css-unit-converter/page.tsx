'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('css-unit-converter')!

type UnitCat = 'length' | 'font'
const BASE_PX = 16  // 1rem = 16px by default

const UNITS = {
  px:  (v: number, base: number) => ({ px:v, rem:v/base, em:v/base, pt:v*0.75, vw:null, vh:null, '%':null }),
  rem: (v: number, base: number) => ({ px:v*base, rem:v, em:v, pt:v*base*0.75, vw:null, vh:null, '%':null }),
  em:  (v: number, base: number) => ({ px:v*base, rem:v, em:v, pt:v*base*0.75, vw:null, vh:null, '%':null }),
  pt:  (v: number, base: number) => ({ px:v/0.75, rem:v/0.75/base, em:v/0.75/base, pt:v, vw:null, vh:null, '%':null }),
}

function round(n: number | null, d=4) { return n === null ? null : +n.toFixed(d) }

export default function CssUnitConverterPage({ params }: { params: { lang: string } }) {
  const [value, setValue] = useState('16')
  const [fromUnit, setFromUnit] = useState<keyof typeof UNITS>('px')
  const [basePx, setBasePx] = useState(BASE_PX)
  const [vwWidth, setVwWidth] = useState(1440)
  const [vhHeight, setVhHeight] = useState(900)
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('css-unit-converter'); tracked.current = true } }

  const n = parseFloat(value)
  const conversions = !isNaN(n) ? UNITS[fromUnit](n, basePx) : null
  
  const allConversions = conversions ? {
    ...conversions,
    vw: fromUnit==='px' ? round(n/vwWidth*100) : conversions.px ? round((conversions.px)/vwWidth*100) : null,
    vh: fromUnit==='px' ? round(n/vhHeight*100) : conversions.px ? round((conversions.px)/vhHeight*100) : null,
    '%': null,
  } : null

  async function copy(val: string, id: string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('css-unit-converter')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  const unitKeys = ['px','rem','em','pt','vw','vh'] as const

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
            <input value={value} onChange={e=>{setValue(e.target.value);track()}} type="number"
              className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="flex gap-1 pb-0.5">
            {Object.keys(UNITS).map(u=>(
              <button key={u} onClick={()=>{setFromUnit(u as keyof typeof UNITS);track()}}
                className={'px-3 py-2 rounded-xl text-sm font-mono font-medium transition-colors ' + (fromUnit===u?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Base font size:</span>
            <input type="number" value={basePx} min={8} max={32} onChange={e=>{setBasePx(parseInt(e.target.value)||16);track()}}
              className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center bg-white" />
            <span>px</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Viewport:</span>
            <input type="number" value={vwWidth} onChange={e=>{setVwWidth(parseInt(e.target.value)||1440);track()}} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center bg-white" />
            <span>×</span>
            <input type="number" value={vhHeight} onChange={e=>{setVhHeight(parseInt(e.target.value)||900);track()}} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center bg-white" />
          </div>
        </div>
        {allConversions && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {unitKeys.map(u => {
              const val = allConversions[u as keyof typeof allConversions]
              if (val === null) return null
              const str = String(val)+u
              return (
                <div key={u} onClick={()=>copy(str,u)}
                  className={'p-3 rounded-xl border cursor-pointer hover:border-brand-300 transition-colors ' + (fromUnit===u?'bg-brand-50 border-brand-200':'bg-white border-gray-200')}>
                  <p className="text-xs text-gray-400 mb-0.5">{u}</p>
                  <p className="text-lg font-mono font-semibold text-gray-800">{val}</p>
                  <p className="text-xs text-brand-400">{copied===u?'\u2713 Copied':''}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
