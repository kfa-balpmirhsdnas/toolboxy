'use client'
import { useState } from 'react'

function calcBmi(weight: number, height: number): number {
  return weight / (height * height)
}

function getCategory(bmi: number): { label: string; color: string; desc: string } {
  if(bmi<16) return {label:'Severely Underweight',color:'red',desc:'BMI below 16 indicates severe malnutrition risk.'}
  if(bmi<18.5) return {label:'Underweight',color:'orange',desc:'Consider consulting a healthcare professional about healthy weight gain.'}
  if(bmi<25) return {label:'Normal weight',color:'green',desc:'Your BMI is within the healthy range. Maintain a balanced diet and regular activity.'}
  if(bmi<30) return {label:'Overweight',color:'yellow',desc:'Consider lifestyle changes. Consult a healthcare provider for personalized advice.'}
  if(bmi<35) return {label:'Obese (Class I)',color:'orange',desc:'Health risks are elevated. Consulting a doctor is recommended.'}
  if(bmi<40) return {label:'Obese (Class II)',color:'red',desc:'Significant health risks. Medical consultation is strongly advised.'}
  return {label:'Obese (Class III)',color:'red',desc:'Severe health risks. Please consult a healthcare professional immediately.'}
}

const COLOR_CLASSES = {
  red:'bg-red-100 text-red-800 border-red-200',
  orange:'bg-orange-100 text-orange-800 border-orange-200',
  yellow:'bg-yellow-100 text-yellow-800 border-yellow-200',
  green:'bg-green-100 text-green-800 border-green-200'
} as const

export default function BmiCalculator() {
  const [unit,setUnit]=useState<'metric'|'imperial'>('metric')
  const [weight,setWeight]=useState('70')
  const [height,setHeight]=useState('170')
  const [heightFt,setHeightFt]=useState('5')
  const [heightIn,setHeightIn]=useState('7')
  const [weightLb,setWeightLb]=useState('154')

  const bmi = (() => {
    if(unit==='metric') {
      const w=parseFloat(weight), h=parseFloat(height)/100
      if(!w||!h||h<=0) return null
      return calcBmi(w,h)
    } else {
      const w=parseFloat(weightLb)*0.453592
      const h=(parseFloat(heightFt)*12+parseFloat(heightIn))*0.0254
      if(!w||!h||h<=0) return null
      return calcBmi(w,h)
    }
  })()

  const cat = bmi ? getCategory(bmi) : null
  const colorClass = cat ? COLOR_CLASSES[cat.color as keyof typeof COLOR_CLASSES] : ''

  // BMI scale markers
  const scale = [
    {bmi:16,label:'16'},{bmi:18.5,label:'18.5'},{bmi:25,label:'25'},
    {bmi:30,label:'30'},{bmi:35,label:'35'},{bmi:40,label:'40'}
  ]
  const pct = bmi ? Math.min(Math.max((bmi-10)/35,0),1)*100 : null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BMI Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate your Body Mass Index and understand what it means for your health.</p>
        <div className="flex gap-2 mb-6">
          {(['metric','imperial'] as const).map(u=>(
            <button key={u} onClick={()=>setUnit(u)} className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${unit===u?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {u==='metric'?'Metric (kg, cm)':'Imperial (lb, ft/in)'}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          {unit==='metric'?(
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg)</label>
                <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" max="500"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Height (cm)</label>
                <input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" min="50" max="300"/>
              </div>
            </div>
          ):(
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (lb)</label>
                <input type="number" value={weightLb} onChange={e=>setWeightLb(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Height (ft)</label>
                <input type="number" value={heightFt} onChange={e=>setHeightFt(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Height (in)</label>
                <input type="number" value={heightIn} onChange={e=>setHeightIn(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>
          )}
        </div>
        {bmi && cat && (
          <>
            <div className={`rounded-2xl border-2 p-6 mb-4 ${colorClass}`}>
              <div className="text-5xl font-black mb-1">{bmi.toFixed(1)}</div>
              <div className="text-xl font-bold mb-2">{cat.label}</div>
              <p className="text-sm opacity-80">{cat.desc}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">BMI Scale</p>
              <div className="relative h-4 rounded-full overflow-hidden mb-1" style={{background:'linear-gradient(to right,#ef4444 0%,#f97316 15%,#22c55e 30%,#eab308 60%,#f97316 78%,#ef4444 100%)'}}>
                {pct!==null&&<div className="absolute top-0 w-3 h-3 bg-white border-2 border-gray-800 rounded-full -translate-x-1/2 mt-0.5 shadow" style={{left:pct+'%'}}/>}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                {['10','18.5','25','30','35','45'].map(v=><span key={v}>{v}</span>)}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="text-left px-4 py-2.5 text-gray-600 font-medium">Category</th><th className="text-right px-4 py-2.5 text-gray-600 font-medium">BMI Range</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {[['Severely Underweight','< 16'],['Underweight','16–18.5'],['Normal weight','18.5–25'],['Overweight','25–30'],['Obese Class I','30–35'],['Obese Class II','35–40'],['Obese Class III','≥ 40']].map(([l,r])=>(
                    <tr key={l} className={cat.label===l?'bg-blue-50 font-semibold':''}>
                      <td className="px-4 py-2">{l}</td><td className="px-4 py-2 text-right font-mono">{r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">BMI is a screening tool only and does not diagnose health conditions. Consult a healthcare provider for medical advice.</p>
          </>
        )}
      </div>
    </div>
  )
}