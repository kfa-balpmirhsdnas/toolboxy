'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

export default function GradientGeneratorPage({ params }: { params: { lang: string } }) {
  const [color1, setColor1] = useState('#6366f1')
  const [color2, setColor2] = useState('#ec4899')
  const [gradAngle, setGradAngle] = useState(135)
  const [gradType, setGradType] = useState<'linear'|'radial'>('linear')
  const [copied, setCopied] = useState(false)
  const tool = getToolBySlug('gradient-generator')!
  const css = gradType === 'linear'
    ? 'linear-gradient('+gradAngle+'deg, '+color1+', '+color2+')'
    : 'radial-gradient(circle, '+color1+', '+color2+')'
  const cssCode = 'background: '+css+';'
  const handleCopy = () => { navigator.clipboard.writeText(cssCode); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="w-full h-48 rounded-2xl shadow-inner" style={{ background: css }} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color 1</label>
            <div className="flex gap-2">
              <input type="color" value={color1} onChange={e=>setColor1(e.target.value)}
                className="h-10 w-14 rounded border border-gray-300 cursor-pointer p-0.5" />
              <input type="text" value={color1} onChange={e=>setColor1(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color 2</label>
            <div className="flex gap-2">
              <input type="color" value={color2} onChange={e=>setColor2(e.target.value)}
                className="h-10 w-14 rounded border border-gray-300 cursor-pointer p-0.5" />
              <input type="text" value={color2} onChange={e=>setColor2(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select value={gradType} onChange={e=>setGradType(e.target.value as 'linear'|'radial')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </div>
          {gradType === 'linear' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Angle: {gradAngle}deg</label>
              <input type="range" min="0" max="360" value={gradAngle}
                onChange={e=>setGradAngle(Number(e.target.value))} className="w-full" />
            </div>
          )}
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs font-mono uppercase tracking-wide">CSS Output</span>
            <button onClick={handleCopy}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
          <code className="text-green-400 font-mono text-sm break-all">{cssCode}</code>
        </div>
      </div>
    </ToolLayout>
  )
}