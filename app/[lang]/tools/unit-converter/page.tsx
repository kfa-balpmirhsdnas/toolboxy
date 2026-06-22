'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('unit-converter')!

type UnitDef = { label: string; toBase: number }
type Category = { name: string; base: string; units: Record<string, UnitDef> }

const CATEGORIES: Record<string, Category> = {
  length: {
    name: 'Length', base: 'm',
    units: {
      m: { label: 'Meter (m)', toBase: 1 },
      km: { label: 'Kilometer (km)', toBase: 1000 },
      cm: { label: 'Centimeter (cm)', toBase: 0.01 },
      mm: { label: 'Millimeter (mm)', toBase: 0.001 },
      mi: { label: 'Mile (mi)', toBase: 1609.344 },
      yd: { label: 'Yard (yd)', toBase: 0.9144 },
      ft: { label: 'Foot (ft)', toBase: 0.3048 },
      in: { label: 'Inch (in)', toBase: 0.0254 },
      nm: { label: 'Nautical mile (nm)', toBase: 1852 },
    }
  },
  weight: {
    name: 'Weight', base: 'kg',
    units: {
      kg: { label: 'Kilogram (kg)', toBase: 1 },
      g: { label: 'Gram (g)', toBase: 0.001 },
      mg: { label: 'Milligram (mg)', toBase: 1e-6 },
      t: { label: 'Metric ton (t)', toBase: 1000 },
      lb: { label: 'Pound (lb)', toBase: 0.453592 },
      oz: { label: 'Ounce (oz)', toBase: 0.0283495 },
      st: { label: 'Stone (st)', toBase: 6.35029 },
    }
  },
  temperature: {
    name: 'Temperature', base: 'C',
    units: {
      C: { label: 'Celsius (°C)', toBase: 1 },
      F: { label: 'Fahrenheit (°F)', toBase: 1 },
      K: { label: 'Kelvin (K)', toBase: 1 },
    }
  },
  area: {
    name: 'Area', base: 'm2',
    units: {
      m2: { label: 'Square meter (m²)', toBase: 1 },
      km2: { label: 'Square kilometer (km²)', toBase: 1e6 },
      cm2: { label: 'Square centimeter (cm²)', toBase: 1e-4 },
      ha: { label: 'Hectare (ha)', toBase: 10000 },
      acre: { label: 'Acre', toBase: 4046.86 },
      ft2: { label: 'Square foot (ft²)', toBase: 0.092903 },
      in2: { label: 'Square inch (in²)', toBase: 6.4516e-4 },
      mi2: { label: 'Square mile (mi²)', toBase: 2.59e6 },
    }
  },
  volume: {
    name: 'Volume', base: 'L',
    units: {
      L: { label: 'Liter (L)', toBase: 1 },
      mL: { label: 'Milliliter (mL)', toBase: 0.001 },
      m3: { label: 'Cubic meter (m³)', toBase: 1000 },
      gal: { label: 'Gallon (US)', toBase: 3.78541 },
      qt: { label: 'Quart (US)', toBase: 0.946353 },
      pt: { label: 'Pint (US)', toBase: 0.473176 },
      floz: { label: 'Fluid ounce (US)', toBase: 0.0295735 },
      cup: { label: 'Cup (US)', toBase: 0.24 },
    }
  },
  speed: {
    name: 'Speed', base: 'ms',
    units: {
      ms: { label: 'm/s', toBase: 1 },
      kmh: { label: 'km/h', toBase: 0.277778 },
      mph: { label: 'mph', toBase: 0.44704 },
      kn: { label: 'Knot', toBase: 0.514444 },
      fts: { label: 'ft/s', toBase: 0.3048 },
    }
  },
  data: {
    name: 'Data', base: 'B',
    units: {
      B: { label: 'Byte (B)', toBase: 1 },
      KB: { label: 'Kilobyte (KB)', toBase: 1024 },
      MB: { label: 'Megabyte (MB)', toBase: 1048576 },
      GB: { label: 'Gigabyte (GB)', toBase: 1073741824 },
      TB: { label: 'Terabyte (TB)', toBase: 1099511627776 },
      bit: { label: 'Bit', toBase: 0.125 },
    }
  },
}

function convertTemp(val: number, from: string, to: string): number {
  let c: number
  if (from === 'F') c = (val - 32) * 5 / 9
  else if (from === 'K') c = val - 273.15
  else c = val
  if (to === 'F') return c * 9 / 5 + 32
  if (to === 'K') return c + 273.15
  return c
}

function convert(val: number, from: string, to: string, cat: Category): number {
  if (cat.name === 'Temperature') return convertTemp(val, from, to)
  const base = val * cat.units[from].toBase
  return base / cat.units[to].toBase
}

export default function UnitConverterPage({ params }: { params: { lang: string } }) {
  const [catKey, setCatKey] = useState('length')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('km')
  const [input, setInput] = useState('')
  const [tracked] = useState(() => ({ val: false }))

  const cat = CATEGORIES[catKey]
  const unitKeys = Object.keys(cat.units)

  function handleCatChange(k: string) {
    setCatKey(k)
    const u = Object.keys(CATEGORIES[k].units)
    setFromUnit(u[0])
    setToUnit(u[1] || u[0])
    setInput('')
  }

  const numVal = parseFloat(input)
  const result = input && !isNaN(numVal) ? convert(numVal, fromUnit, toUnit, cat) : null

  function fmt(n: number) {
    if (Math.abs(n) >= 1e-4 && Math.abs(n) < 1e12) return parseFloat(n.toPrecision(10)).toString()
    return n.toExponential(6)
  }

  function handleInput(v: string) {
    if (!tracked.val) { trackToolUsed('unit-converter'); tracked.val = true }
    setInput(v)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORIES).map(([k, c]) => (
            <button
              key={k}
              onClick={() => handleCatChange(k)}
              className={'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ' + (catKey === k ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              {c.name}
            </button>
          ))}
        </div>
        {/* Conversion row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          <div className="sm:col-span-2 space-y-1">
            <select
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              {unitKeys.map(u => <option key={u} value={u}>{cat.units[u].label}</option>)}
            </select>
            <input
              type="number"
              value={input}
              onChange={e => handleInput(e.target.value)}
              placeholder="Enter value"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => { setFromUnit(toUnit); setToUnit(fromUnit) }}
              className="text-gray-400 hover:text-brand-600 transition-colors text-2xl"
              title="Swap"
            >&#8644;</button>
          </div>
          <div className="sm:col-span-2 space-y-1">
            <select
              value={toUnit}
              onChange={e => setToUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              {unitKeys.map(u => <option key={u} value={u}>{cat.units[u].label}</option>)}
            </select>
            <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 text-gray-800 min-h-[42px]">
              {result !== null ? fmt(result) : <span className="text-gray-400">Result</span>}
            </div>
          </div>
        </div>
        {result !== null && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-center">
            <p className="text-sm text-brand-800 font-medium">
              {input} {cat.units[fromUnit].label} = <span className="font-bold text-brand-900">{fmt(result)}</span> {cat.units[toUnit].label}
            </p>
          </div>
        )}
        {/* All conversions */}
        {input && !isNaN(numVal) && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">All {cat.name} Conversions from {input} {fromUnit}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {unitKeys.filter(u => u !== fromUnit).map(u => (
                <div key={u} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 mb-0.5">{cat.units[u].label}</p>
                  <p className="text-sm font-mono font-semibold text-gray-800">{fmt(convert(numVal, fromUnit, u, cat))}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
