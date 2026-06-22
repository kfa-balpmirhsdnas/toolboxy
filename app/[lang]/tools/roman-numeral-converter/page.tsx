'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function toRoman(num: number): string {
  if (num < 1 || num > 3999) return 'Out of range (1–3999)'
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let result = ''
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i] }
  }
  return result
}

function fromRoman(str: string): string {
  const map: Record<string, number> = {M:1000,D:500,C:100,L:50,X:10,V:5,I:1}
  const upper = str.toUpperCase().trim()
  if (!upper || !/^[MDCLXVI]+$/.test(upper)) return 'Invalid Roman numeral'
  let result = 0
  for (let i = 0; i < upper.length; i++) {
    const cur = map[upper[i]]
    const next = map[upper[i+1]] || 0
    result += cur < next ? -cur : cur
  }
  return String(result)
}

export default function RomanNumeralConverterPage({ params }: { params: { lang: string } }) {
  const [decInput, setDecInput] = useState('2024')
  const [romInput, setRomInput] = useState('MMXXIV')
  const tool = getToolBySlug('roman-numeral-converter')!
  const romanResult = toRoman(parseInt(decInput) || 0)
  const decResult = fromRoman(romInput)
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Decimal to Roman</h2>
          <input type="number" min="1" max="3999" value={decInput}
            onChange={e => setDecInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Result</p>
            <p className="text-3xl font-bold text-brand-600 font-mono">{romanResult}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Roman to Decimal</h2>
          <input type="text" placeholder="e.g. MMXXIV" value={romInput}
            onChange={e => setRomInput(e.target.value.toUpperCase())}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Result</p>
            <p className="text-3xl font-bold text-brand-600">{decResult}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}