'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

// Harris-Benedict equation
function bmr(weight:number,height:number,age:number,sex:'male'|'female'):number{
  if(sex==='male') return 88.362+(13.397*weight)+(4.799*height)-(5.677*age)
  return 447.593+(9.247*weight)+(3.098*height)-(4.330*age)
}

const ACTIVITY=[
  {id:'sedentary',label:'Sedentary',desc:'Little or no exercise',factor:1.2},
  {id:'light',label:'Lightly active',desc:'Light exercise 1-3 days/week',factor:1.375},
  {id:'moderate',label:'Moderately active',desc:'Moderate exercise 3-5 days/week',factor:1.55},
  {id:'active',label:'Very active',desc:'Hard exercise 6-7 days/week',factor:1.725},
  {id:'extra',label:'Extra active',desc:'Very hard exercise & physical job',factor:1.9},
]


const tool = getToolBySlug('calorie-calculator')!

export default function CalorieCalculatorPage() {
  const [unit,setUnit]=useState<'metric'|'imperial'>('metric')
  const [sex,setSex]=useState<'male'|'female'>('male')
  const [age,setAge]=useState('')
  const [weight,setWeight]=useState('')
  const [height,setHeight]=useState('')
  const [feet,setFeet]=useState('')
  const [inches,setInches]=useState('')
  const [activity,setActivity]=useState('moderate')

  const wKg=unit==='metric'?parseFloat(weight):parseFloat(weight)*0.453592
  const hCm=unit==='metric'?parseFloat(height):((parseFloat(feet)||0)*12+(parseFloat(inches)||0))*2.54
  const ageN=parseInt(age)
  const ready=wKg>0&&hCm>0&&ageN>0

  const bmrVal=ready?bmr(wKg,hCm,ageN,sex):0
  const actFactor=ACTIVITY.find(a=>a.id===activity)?.factor??1.55
  const tdee=Math.round(bmrVal*actFactor)

  const goals=[
    {label:'Extreme loss (-2 lb/wk)',cal:tdee-1000,color:'text-red-600'},
    {label:'Weight loss (-1 lb/wk)',cal:tdee-500,color:'text-orange-500'},
    {label:'Mild loss (-0.5 lb/wk)',cal:tdee-250,color:'text-yellow-600'},
    {label:'Maintain weight',cal:tdee,color:'text-green-600'},
    {label:'Mild gain (+0.5 lb/wk)',cal:tdee+250,color:'text-blue-500'},
    {label:'Weight gain (+1 lb/wk)',cal:tdee+500,color:'text-indigo-600'},
  ]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calorie Calculator</h1>
        <p className="text-gray-500 mb-8">Estimate your daily calorie needs based on your body metrics and activity level</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            {(['metric','imperial'] as const).map(u=>(
              <button key={u} onClick={()=>setUnit(u)} className={'flex-1 py-2 rounded-lg capitalize font-medium transition-colors '+(unit===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{u}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['male','female'] as const).map(s=>(
              <button key={s} onClick={()=>setSex(s)} className={'flex-1 py-2 rounded-lg capitalize font-medium transition-colors '+(sex===s?'bg-purple-500 text-white':'bg-gray-100 text-gray-700')}>{s}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="e.g. 30"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight ({unit==='metric'?'kg':'lbs'})</label>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder={unit==='metric'?'70':'154'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          {unit==='metric'?(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="175"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          ):(
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feet</label>
                <input type="number" value={feet} onChange={e=>setFeet(e.target.value)} placeholder="5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inches</label>
                <input type="number" value={inches} onChange={e=>setInches(e.target.value)} placeholder="9"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
            <div className="space-y-1">
              {ACTIVITY.map(a=>(
                <button key={a.id} onClick={()=>setActivity(a.id)}
                  className={'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors '+(activity===a.id?'border-brand-300 bg-brand-50':'border-gray-200 hover:bg-gray-50')}>
                  <span className="text-sm font-medium text-gray-800">{a.label}</span>
                  <span className="text-xs text-gray-500">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {ready&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">BMR (Basal Metabolic Rate)</p>
              <p className="text-2xl font-bold text-gray-700">{Math.round(bmrVal).toLocaleString()} kcal/day</p>
            </div>
            <h2 className="font-semibold text-gray-800 mb-3">Daily Calories by Goal (TDEE: {tdee.toLocaleString()} kcal)</h2>
            <div className="space-y-2">
              {goals.map(g=>(
                <div key={g.label} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{g.label}</span>
                  <span className={'font-bold font-mono '+g.color}>{Math.max(1200,g.cal).toLocaleString()} kcal</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Based on Harris-Benedict equation. Values are estimates — consult a nutritionist for personalized advice.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}