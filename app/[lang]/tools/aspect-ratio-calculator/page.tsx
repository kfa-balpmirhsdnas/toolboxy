'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('aspect-ratio-calculator')!

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

function simplifyRatio(w: number, h: number): string {
  if (!w || !h) return ''
  const d = gcd(Math.round(w), Math.round(h))
  return Math.round(w/d) + ':' + Math.round(h/d)
}

const PRESETS = [
  ['16:9', 16, 9], ['4:3', 4, 3], ['1:1', 1, 1],
  ['21:9', 21, 9], ['3:2', 3, 2], ['9:16', 9, 16],
]

export default function AspectRatioCalculatorPage({ params }: { params: { lang: string } }) {
  const [w, setW] = useState('')
  const [h, setH] = useState('')
  const [targetW, setTargetW] = useState('')
  const [targetH, setTargetH] = useState('')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('aspect-ratio-calculator'); tracked.current = true }
  }

  const ratio = simplifyRatio(parseFloat(w), parseFloat(h))
  const decimal = (w && h) ? (parseFloat(w) / parseFloat(h)).toFixed(4) : ''

  function calcTargetH() {
    if (!w || !h || !targetW) return ''
    return ((parseFloat(targetW) * parseFloat(h)) / parseFloat(w)).toFixed(0)
  }
  function calcTargetW() {
    if (!w || !h || !targetH) return ''
    return ((parseFloat(targetH) * parseFloat(w)) / parseFloat(h)).toFixed(0)
  }

  function applyPreset(pw: number, ph: number) {
    setW(String(pw))
    setH(String(ph))
    setTargetW('')
    setTargetH('')
    track()
  }

  async function copy() {
    await navigator.clipboard.writeText(ratio)
    trackToolCopy('aspect-ratio-calculator')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(([label, pw, ph]) => (
            <button key={label as string} onClick={() => applyPreset(pw as number, ph as number)}
              className={'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ' + (w===String(pw) && h===String(ph) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400')}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
            <input type="number" value={w} onChange={e => { setW(e.target.value); track() }} placeholder="1920"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
            <input type="number" value={h} onChange={e => { setH(e.target.value); track() }} placeholder="1080"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        {ratio && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-600 font-medium mb-0.5">Aspect Ratio</p>
              <p className="text-3xl font-bold text-brand-800">{ratio}</p>
              <p className="text-xs text-brand-500 mt-0.5">Decimal: {decimal}</p>
            </div>
            <button onClick={copy} className="px-3 py-1.5 bg-brand-600 text-white text-xs rounded-lg hover:bg-brand-700">
              {copied ? '\u2713 Copied' : 'Copy'}
            </button>
          </div>
        )}
        {w && h && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Scale to new size</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">New Width &#x2192; Height</label>
                <input type="number" value={targetW} onChange={e => { setTargetH(''); setTargetW(e.target.value) }} placeholder="Enter width"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                {targetW && <p className="mt-1 text-sm text-gray-600">Height: <strong>{calcTargetH()}px</strong></p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">New Height &#x2192; Width</label>
                <input type="number" value={targetH} onChange={e => { setTargetW(''); setTargetH(e.target.value) }} placeholder="Enter height"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                {targetH && <p className="mt-1 text-sm text-gray-600">Width: <strong>{calcTargetW()}px</strong></p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
