'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('calorie-calculator')!
export default function CalorieCalculatorPage() {
  const [gender,setGender]=useState<'male'|'female'>('male')
  const [age,setAge]=useState('30')
  const [weight,setWeight]=useState('70')
  const [height,setHeight]=useState('175')
  const [activity,setActivity]=useState(1.55)
  const LEVELS=[
    {label:'Sedentary',desc:'Little/no exercise',val:1.2},
    {label:'Light',desc:'1-3 days/week',val:1.375},
    {label:'Moderate',desc:'3-5 days/week',val:1.55},
    {label:'Active',desc:'6-7 days/week',val:1.725},
    {label:'Very Active',desc:'Hard daily exercise',val:1.9},
  ]
  const w=parseFloat(weight),h=parseFloat(height),a=parseFloat(age)
  const bmr=w&&h&&a?(gender==='male'?10*w+6.25*h-5*a+5:10*w+6.25*h-5*a-161):0
  const tdee=bmr*activity
  const goals=[
    {label:'Lose weight (fast)',cal:tdee-500,color:'#ef4444'},
    {label:'Lose weight',cal:tdee-250,color:'#f97316'},
    {label:'Maintain weight',cal:tdee,color:'#22c55e'},
    {label:'Gain weight',cal:tdee+250,color:'#3b82f6'},
    {label:'Gain weight (fast)',cal:tdee+500,color:'#8b5cf6'},
  ]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['male','female'] as const).map(g=>(
            <button key={g} onClick={()=>setGender(g)}
              className={`flex-1 py-2 text-sm font-medium transition ${gender===g?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50'}`}>
              {g.charAt(0).toUpperCase()+g.slice(1)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
            <input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
          <div><label className="block text-xs font-medium text-gray-700 mb-1">Height (cm)</label>
            <input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2"/></div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Activity Level</p>
          <div className="space-y-1.5">
            {LEVELS.map(l=>(
              <label key={l.val} className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition ${activity===l.val?'border-blue-500 bg-blue-50':'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" checked={activity===l.val} onChange={()=>setActivity(l.val)} className="text-blue-600"/>
                <div>
                  <p className="text-sm font-medium text-gray-800">{l.label}</p>
                  <p className="text-xs text-gray-500">{l.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
        {tdee>0&&(
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Daily Calorie Goals</p>
            {goals.map(g=>(
              <div key={g.label} className="flex justify-between items-center rounded-lg border border-gray-200 px-4 py-2.5">
                <span className="text-sm text-gray-700">{g.label}</span>
                <span className="font-bold text-base" style={{color:g.color}}>{Math.round(g.cal)} kcal</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 text-center">BMR: {Math.round(bmr)} kcal/day (Mifflin-St Jeor)</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}