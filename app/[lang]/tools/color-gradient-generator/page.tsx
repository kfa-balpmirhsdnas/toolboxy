'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('color-gradient-generator')!

const PRESETS = [
  { name: 'Sunset', colors: ['#f97316','#ec4899','#8b5cf6'] },
  { name: 'Ocean', colors: ['#06b6d4','#3b82f6','#6366f1'] },
  { name: 'Forest', colors: ['#84cc16','#22c55e','#14b8a6'] },
  { name: 'Fire', colors: ['#fbbf24','#f97316','#ef4444'] },
  { name: 'Candy', colors: ['#f472b6','#c084fc','#818cf8'] },
  { name: 'Mono', colors: ['#1e293b','#64748b','#e2e8f0'] },
]

export default function ColorGradientGeneratorPage({ params }: { params: { lang: string } }) {
  const [colors, setColors] = useState(['#6366f1','#8b5cf6','#ec4899'])
  const [direction, setDirection] = useState('135deg')
  const [type, setType] = useState<'linear'|'radial'>('linear')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('color-gradient-generator'); tracked.current = true }
  }

  const css = type === 'linear'
    ? 'linear-gradient(' + direction + ', ' + colors.join(', ') + ')'
    : 'radial-gradient(circle, ' + colors.join(', ') + ')'

  const cssRule = 'background: ' + css + ';'

  async function copy() {
    await navigator.clipboard.writeText(cssRule)
    trackToolCopy('color-gradient-generator')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function addColor() { if (colors.length < 6) { setColors([...colors, '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')]); track() } }
  function removeColor(i: number) { if (colors.length > 2) setColors(colors.filter((_, idx) => idx !== i)) }
  function updateColor(i: number, v: string) { const c = [...colors]; c[i] = v; setColors(c); track() }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="h-40 rounded-2xl shadow-inner transition-all duration-300" style={{ background: css }} />
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => { setColors(p.colors); track() }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-brand-400 text-xs font-medium">
              <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg,' + p.colors.join(',') + ')' }} />
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          {(['linear','radial'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ' + (type===t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {t}
            </button>
          ))}
          {type === 'linear' && (
            <select value={direction} onChange={e => { setDirection(e.target.value); track() }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              {['to right','to left','to bottom','to top','135deg','45deg','90deg','0deg'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Colors ({colors.length})</label>
            {colors.length < 6 && <button onClick={addColor} className="text-xs text-brand-600 hover:underline">+ Add color</button>}
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                <input type="color" value={c} onChange={e => updateColor(i, e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                <code className="text-xs font-mono">{c}</code>
                {colors.length > 2 && (
                  <button onClick={() => removeColor(i)} className="text-xs text-red-400 hover:text-red-600 ml-1">\u00D7</button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">CSS Code</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied ? '\u2713 Copied' : 'Copy'}</button>
          </div>
          <code className="block p-3 bg-gray-900 text-green-400 text-xs rounded-xl font-mono break-all">{cssRule}</code>
        </div>
      </div>
    </ToolLayout>
  )
}
