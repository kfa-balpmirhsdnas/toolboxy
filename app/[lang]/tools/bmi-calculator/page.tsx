'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('bmi-calculator')!

function getBmiCategory(bmi: number): { label: string; color: string; range: string } {
  if (bmi < 18.5) return { label:'Underweight', color:'text-blue-600', range:'< 18.5' }
  if (bmi < 25)   return { label:'Normal weight', color:'text-green-600', range:'18.5–24.9' }
  if (bmi < 30)   return { label:'Overweight', color:'text-yellow-600', range:'25–29.9' }
  return { label:'Obese', color:'text-red-600', range:'≥ 30' }
}

export default function BmiCalculatorPage({ params }: { params: { lang: string } }) {
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('bmi-calculator'); tracked.current = true } }

  let bmi: number|null = null
  let heightM = 0
  if (unit==='metric') {
    const h = parseFloat(height)/100, w = parseFloat(weight)
    if (h>0 && w>0) { bmi = Math.round(w/(h*h)*10)/10; heightM=h }
  } else {
    const totalIn = parseFloat(height)*12+parseFloat(heightIn||'0'), w = parseFloat(weight)
    if (totalIn>0 && w>0) { const hM=totalIn*0.0254; bmi=Math.round(w*0.453592/(hM*hM)*10)/10; heightM=hM }
  }

  const cat = bmi !== null ? getBmiCategory(bmi) : null
  const normalWeightMin = heightM>0 ? Math.round(18.5*heightM*heightM*10)/10 : 0
  const normalWeightMax = heightM>0 ? Math.round(24.9*heightM*heightM*10)/10 : 0
  const bmiPercent = bmi !== null ? Math.min(100,Math.max(0,(bmi-10)/30*100)) : 0

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="flex gap-1">
          {(['metric','imperial'] as const).map(u=>(
            <button key={u} onClick={()=>{setUnit(u);setWeight('');setHeight('');setHeightIn('');track()}}
              className={'px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ' + (unit===u?'bg-brand-600 text-white':'bg-gray-100 text-gray-600')}>
              {u}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Weight ({unit==='metric'?'kg':'lbs'})</label>
            <input type="number" value={weight} onChange={e=>{setWeight(e.target.value);track()}} placeholder={unit==='metric'?'70':'154'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          {unit==='metric' ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Height (cm)</label>
              <input type="number" value={height} onChange={e=>{setHeight(e.target.value);track()}} placeholder="175"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
              <div className="flex gap-2">
                <input type="number" value={height} onChange={e=>{setHeight(e.target.value);track()}} placeholder="5 ft"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <input type="number" value={heightIn} onChange={e=>{setHeightIn(e.target.value);track()}} placeholder="9 in"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
          )}
        </div>
        {bmi !== null && cat && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
              <p className="text-4xl font-bold text-gray-800">{bmi}</p>
              <p className={'text-sm font-semibold mt-1 ' + cat.color}>{cat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">BMI range: {cat.range}</p>
            </div>
            <div>
              <div className="h-3 rounded-full overflow-hidden" style={{background:'linear-gradient(to right,#3b82f6 0%,#22c55e 33%,#eab308 67%,#ef4444 100%)'}}>
                <div className="relative h-full">
                  <div className="absolute top-0 w-1 h-full bg-white rounded shadow" style={{left:bmiPercent+'%',transform:'translateX(-50%)'}} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
              </div>
            </div>
            {heightM>0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
                Normal weight range: <span className="font-bold">{normalWeightMin}–{normalWeightMax} {unit==='metric'?'kg':'lbs'}</span>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-gray-400 text-center">
          BMI is an estimate and does not account for muscle mass, bone density, or other individual factors.
        </div>
      </div>
    </ToolLayout>
  )
}
