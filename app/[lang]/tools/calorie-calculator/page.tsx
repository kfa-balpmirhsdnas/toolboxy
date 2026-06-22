'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('calorie-calculator')!
const ACTIVITY=[
  {label:'Sedentary (little/no exercise)',mult:1.2},
  {label:'Light (1-3 days/week)',mult:1.375},
  {label:'Moderate (3-5 days/week)',mult:1.55},
  {label:'Active (6-7 days/week)',mult:1.725},
  {label:'Very active (hard exercise daily)',mult:1.9},
]
const GOALS=[{label:'Lose weight (−0.5 kg/week)',adj:-550},{label:'Lose weight (−0.25 kg/week)',adj:-275},{label:'Maintain weight',adj:0},{label:'Gain weight (+0.25 kg/week)',adj:275},{label:'Gain weight (+0.5 kg/week)',adj:550}]
export default function CalorieCalculatorPage() {
  const [unit,setUnit]=useState<'metric'|'imperial'>('metric')
  const [sex,setSex]=useState<'male'|'female'>('male')
  const [age,setAge]=useState(30)
  const [weight,setWeight]=useState(70)
  const [height,setHeight]=useState(175)
  const [actIdx,setActIdx]=useState(2)
  const [goalIdx,setGoalIdx]=useState(2)
  const wKg=unit==='imperial'?weight*0.453592:weight
  const hCm=unit==='imperial'?height*2.54:height
  const bmr=sex==='male'?10*wKg+6.25*hCm-5*age+5:10*wKg+6.25*hCm-5*age-161
  const tdee=Math.round(bmr*ACTIVITY[actIdx].mult)
  const target=tdee+GOALS[goalIdx].adj
  const macros={protein:Math.round(target*0.30/4),carbs:Math.round(target*0.45/4),fat:Math.round(target*0.25/9)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['metric','imperial'] as const).map(u=>(
            <button key={u} onClick={()=>setUnit(u)}
              className={'flex-1 py-2 text-sm font-medium capitalize transition '+(unit===u?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{u}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Sex</label>
            <div className="flex gap-2">
              {(['male','female'] as const).map(s=>(
                <button key={s} onClick={()=>setSex(s)}
                  className={'flex-1 py-2 rounded-xl border text-sm capitalize font-medium transition '+(sex===s?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-600 hover:bg-gray-50')}>{s}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">Age (years)</label>
            <input type="number" value={age} onChange={e=>setAge(Number(e.target.value))} min="15" max="100"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Weight ({unit==='metric'?'kg':'lbs'})</label>
            <input type="number" value={weight} onChange={e=>setWeight(Number(e.target.value))} min="30"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">Height ({unit==='metric'?'cm':'in'})</label>
            <input type="number" value={height} onChange={e=>setHeight(Number(e.target.value))} min="100"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-blue-400"/></div>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">Activity level</label>
          <select value={actIdx} onChange={e=>setActIdx(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
            {ACTIVITY.map((a,i)=><option key={i} value={i}>{a.label}</option>)}
          </select></div>
        <div><label className="block text-xs text-gray-500 mb-1">Goal</label>
          <select value={goalIdx} onChange={e=>setGoalIdx(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
            {GOALS.map((g,i)=><option key={i} value={i}>{g.label}</option>)}
          </select></div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[['BMR (Base)',Math.round(bmr)+' kcal'],['TDEE (Maintenance)',tdee+' kcal'],['Daily Target',target+' kcal','text-blue-700']].map(([l,v,cls])=>(
              <div key={l} className={'bg-white/70 rounded-xl py-3 px-4 '+(l==='Daily Target'?'col-span-2 text-center':'')}>
                <p className={'font-bold text-lg '+(cls||'text-gray-800')}>{v}</p>
                <p className="text-xs text-gray-500">{l}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-gray-600 mb-2">Suggested macros (30/45/25)</p>
          <div className="grid grid-cols-3 gap-2">
            {[['Protein',macros.protein+'g','30%'],['Carbs',macros.carbs+'g','45%'],['Fat',macros.fat+'g','25%']].map(([l,v,p])=>(
              <div key={l} className="bg-white/70 rounded-xl py-2 text-center">
                <p className="font-bold text-gray-800">{v}</p>
                <p className="text-xs text-gray-500">{l} ({p})</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">Based on Mifflin-St Jeor equation. Consult a professional for medical advice.</p>
      </div>
    </ToolLayout>
  )
}