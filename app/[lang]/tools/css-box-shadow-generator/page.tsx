'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('css-box-shadow-generator')!

export default function CssBoxShadowGeneratorPage({ params }: { params: { lang: string } }) {
  const [x, setX] = useState(0)
  const [y, setY] = useState(4)
  const [blur, setBlur] = useState(12)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState('#00000040')
  const [inset, setInset] = useState(false)
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() {
    if (!tracked.current) { trackToolUsed('css-box-shadow-generator'); tracked.current = true }
  }

  const shadow = (inset ? 'inset ' : '') + x + 'px ' + y + 'px ' + blur + 'px ' + spread + 'px ' + color
  const cssRule = 'box-shadow: ' + shadow + ';'

  async function copy() {
    await navigator.clipboard.writeText(cssRule)
    trackToolCopy('css-box-shadow-generator')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const Slider = ({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-mono text-brand-700">{value}px</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => { onChange(parseInt(e.target.value)); track() }}
        className="w-full accent-brand-600" />
    </div>
  )

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="flex items-center justify-center p-10 bg-gray-100 rounded-2xl">
          <div className="w-32 h-32 bg-white rounded-xl transition-all duration-200" style={{ boxShadow: shadow }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Slider label="Horizontal (X)" value={x} min={-50} max={50} onChange={setX} />
          <Slider label="Vertical (Y)" value={y} min={-50} max={50} onChange={setY} />
          <Slider label="Blur" value={blur} min={0} max={100} onChange={setBlur} />
          <Slider label="Spread" value={spread} min={-50} max={50} onChange={setSpread} />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
            <input type="color" value={color.slice(0,7)} onChange={e => { setColor(e.target.value + color.slice(7) || e.target.value); track() }}
              className="h-9 w-20 rounded-lg cursor-pointer border border-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Opacity</label>
            <input type="range" min={0} max={100} value={Math.round(parseInt(color.slice(7) || 'ff', 16) / 255 * 100)} 
              onChange={e => { const alpha = Math.round(parseInt(e.target.value) / 100 * 255).toString(16).padStart(2,'0'); setColor(color.slice(0,7) + alpha); track() }}
              className="w-28 accent-brand-600" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none mt-4">
            <input type="checkbox" checked={inset} onChange={e => { setInset(e.target.checked); track() }} className="w-4 h-4 accent-brand-600 rounded" />
            <span className="text-sm font-medium text-gray-700">Inset</span>
          </label>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">CSS Output</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied ? '\u2713 Copied' : 'Copy'}</button>
          </div>
          <code className="block p-3 bg-gray-900 text-green-400 text-xs rounded-xl font-mono break-all">{cssRule}</code>
        </div>
      </div>
    </ToolLayout>
  )
}
