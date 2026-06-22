'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('bmi-calculator')!
const CATEGORIES=[
  {label:'Underweight',range:'< 18.5',color:'#3b82f6',min:0,max:18.5},
  {label:'Normal',range:'18.5 - 24.9',color:'#22c55e',min:18.5,max:25},
  {label:'Overweight',range:'25 - 29.9',color:'#f59e0b',min:25,max:30},
  {label:'Obese',range:'>= 30',color:'#ef4444',min:30,max:Infinity},
]
export default function BmiCalculatorPage() {
  const [unit,setUnit]=useState<'metric'|'imperial'>('metric')
  const [weight,setWeight]=useState('')
  const [height,setHeight]=useState('')
  const [heightFt,setHeightFt]=useState('')
  const [heightIn,setHeightIn]=useState('')
  const calcBmi=():number|null=>{
    if(unit==='metric'){
      const w=parseFloat(weight),h=parseFloat(height)/100
      if(!w||!h||h<=0)return null
      return w/(h*h)
    } else {
      const w=parseFloat(weight)*0.453592
      const inches=(parseFloat(heightFt)||0)*12+(parseFloat(heightIn)||0)
      const h=inches*0.0254
      if(!w||!h||h<=0)return null
      return w/(h*h)
    }
  }
  const bmi=calcBmi()
  const category=bmi?CATEGORIES.find(c=>bmi>=c.min&&bmi<c.max):null
  const idealMin=18.5,idealMax=24.9
  const idealWeightKg=unit==='metric'?{
    min:(idealMin*Math.pow(parseFloat(height)/100,2)).toFixed(1),
    max:(idealMax*Math.pow(parseFloat(height)/100,2)).toFixed(1)
  }:null
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['metric','imperial'] as const).map(u=>(
            <button key={u} onClick={()=>setUnit(u)}
              className={`flex-1 py-2 text-sm font-medium transition ${unit===u?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>
              {u==='metric'?'Metric (kg/cm)':'Imperial (lb/ft)'}
            </button>
          ))}
        </div>
        {unit==='metric'?(
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="e.g. 70" className="w-full rounded border border-gray-300 px-3 py-2"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="e.g. 175" className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          </div>
        ):(
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight (lb)</label>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="154" className="w-full rounded border border-gray-300 px-3 py-2"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Height (ft)</label>
              <input type="number" value={heightFt} onChange={e=>setHeightFt(e.target.value)} placeholder="5" className="w-full rounded border border-gray-300 px-3 py-2"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Inches</label>
              <input type="number" value={heightIn} onChange={e=>setHeightIn(e.target.value)} placeholder="9" className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          </div>
        )}
        {bmi&&category&&(
          <div className="rounded-xl p-5 text-center border-2" style={{borderColor:category.color,background:category.color+'15'}}>
            <p className="text-5xl font-bold mb-1" style={{color:category.color}}>{bmi.toFixed(1)}</p>
            <p className="text-lg font-semibold" style={{color:category.color}}>{category.label}</p>
            <p className="text-sm text-gray-500 mt-1">BMI {category.range}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(c=>(
            <div key={c.label} className={`rounded-lg p-2.5 text-center ${category?.label===c.label?'ring-2':'opacity-60'}`}
              style={{background:c.color+'20',ringColor:c.color}}>
              <p className="text-xs font-semibold" style={{color:c.color}}>{c.label}</p>
              <p className="text-xs text-gray-500">{c.range}</p>
            </div>
          ))}
        </div>
        {idealWeightKg&&height&&(
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 text-center">
            Ideal weight for your height: <strong>{idealWeightKg.min} – {idealWeightKg.max} kg</strong>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}