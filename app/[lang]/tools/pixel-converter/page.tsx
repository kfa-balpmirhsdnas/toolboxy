'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

export default function PixelConverterPage({ params }: { params: { lang: string } }) {
  const [pxInput, setpxInput] = useState('16')
  const [baseSize, setBaseSize] = useState('16')
  const tool = getToolBySlug('pixel-converter')!
  const px = parseFloat(pxInput)||0
  const base = parseFloat(baseSize)||16
  const conversions = [
    { unit:'rem', value:(px/base).toFixed(4), desc:'Relative to root font size' },
    { unit:'em', value:(px/base).toFixed(4), desc:'Relative to parent element' },
    { unit:'pt', value:(px*0.75).toFixed(4), desc:'1px = 0.75pt' },
    { unit:'cm', value:(px/37.795).toFixed(4), desc:'1cm = 37.795px' },
    { unit:'mm', value:(px/3.7795).toFixed(4), desc:'1mm = 3.7795px' },
    { unit:'in', value:(px/96).toFixed(4), desc:'1in = 96px' },
    { unit:'vw', value:(px/19.2).toFixed(4), desc:'Based on 1920px viewport' },
    { unit:'vh', value:(px/10.8).toFixed(4), desc:'Based on 1080px viewport' },
  ]
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pixels (px)</label>
            <input type="number" value={pxInput} onChange={e=>setpxInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size (px)</label>
            <input type="number" value={baseSize} onChange={e=>setBaseSize(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {conversions.map(c => (
            <div key={c.unit} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{c.unit}</span>
                <button onClick={()=>navigator.clipboard.writeText(c.value+c.unit)}
                  className="text-xs text-brand-500 hover:text-brand-700">Copy</button>
              </div>
              <p className="text-xl font-bold text-gray-900">{c.value}<span className="text-sm font-normal text-gray-400 ml-1">{c.unit}</span></p>
              <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}