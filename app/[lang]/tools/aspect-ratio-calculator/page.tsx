'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

export default function AspectRatioCalculatorPage({ params }: { params: { lang: string } }) {
  const [widthPx, setWidthPx] = useState('1920')
  const [heightPx, setHeightPx] = useState('1080')
  const [ratioA, setRatioA] = useState('16')
  const [ratioB, setRatioB] = useState('9')
  const [targetW, setTargetW] = useState('1280')
  const tool = getToolBySlug('aspect-ratio-calculator')!
  const w = parseInt(widthPx)||0, h = parseInt(heightPx)||0
  const g = w&&h ? gcd(w,h) : 1
  const ratioStr = w&&h ? (w/g)+':'+(h/g) : '-'
  const decimal = w&&h ? (w/h).toFixed(4) : '-'
  const rA = parseFloat(ratioA)||0, rB = parseFloat(ratioB)||0, tW = parseInt(targetW)||0
  const calcH = rA&&rB&&tW ? Math.round(tW*rB/rA) : 0
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Get Ratio from Dimensions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Width (px)</label>
              <input type="number" value={widthPx} onChange={e=>setWidthPx(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Height (px)</label>
              <input type="number" value={heightPx} onChange={e=>setHeightPx(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div><p className="text-sm text-gray-500">Aspect Ratio</p><p className="text-2xl font-bold text-brand-600">{ratioStr}</p></div>
            <div><p className="text-sm text-gray-500">Decimal</p><p className="text-2xl font-bold text-brand-600">{decimal}</p></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Calculate Height from Ratio</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ratio W</label>
              <input type="number" value={ratioA} onChange={e=>setRatioA(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ratio H</label>
              <input type="number" value={ratioB} onChange={e=>setRatioB(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Width (px)</label>
              <input type="number" value={targetW} onChange={e=>setTargetW(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Height</p>
            <p className="text-2xl font-bold text-brand-600">{calcH ? calcH+'px' : '-'}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}