'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

type Unit = 'metric'|'imperial'

function calcBmi(unit:Unit,weight:number,height:number,feet:number,inches:number):number|null{
  if(unit==='metric'){
    if(!weight||!height)return null
    return weight/((height/100)**2)
  }else{
    const totalInches=feet*12+inches
    if(!weight||!totalInches)return null
    return(weight/(totalInches**2))*703
  }
}

function category(bmi:number):{label:string;color:string;range:string}{
  if(bmi<18.5) return{label:'Underweight',color:'text-blue-600',range:'< 18.5'}
  if(bmi<25)   return{label:'Normal weight',color:'text-green-600',range:'18.5 – 24.9'}
  if(bmi<30)   return{label:'Overweight',color:'text-yellow-600',range:'25 – 29.9'}
  return{label:'Obese',color:'text-red-600',range:'\u2265 30'}
}


const tool = getToolBySlug('bmi-calculator')!

export default function BmiCalculatorPage() {
  const [unit,setUnit]=useState<Unit>('metric')
  const [weight,setWeight]=useState('')
  const [height,setHeight]=useState('')
  const [feet,setFeet]=useState('')
  const [inches,setInches]=useState('')
  const [age,setAge]=useState('')
  const [sex,setSex]=useState<'male'|'female'>('male')

  const bmiVal=calcBmi(unit,parseFloat(weight),parseFloat(height),parseFloat(feet)||0,parseFloat(inches)||0)
  const cat=bmiVal!==null?category(bmiVal):null
  const pct=bmiVal!==null?Math.min(Math.max((bmiVal-10)/30*100,0),100):0

  const cats=[{l:'Underweight',c:'bg-blue-400',w:24},{l:'Normal',c:'bg-green-400',w:26},{l:'Overweight',c:'bg-yellow-400',w:20},{l:'Obese',c:'bg-red-400',w:30}]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BMI Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate your Body Mass Index (BMI) and check which weight category you fall into</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-2">
            {(['metric','imperial'] as const).map(u=>(
              <button key={u} onClick={()=>setUnit(u)} className={'flex-1 py-2 rounded-lg capitalize font-medium transition-colors '+(unit===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{u}</button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight ({unit==='metric'?'kg':'lbs'})</label>
            <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder={unit==='metric'?'e.g. 70':'e.g. 154'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {unit==='metric'?(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input type="number" value={height} onChange={e=>setHeight(e.target.value)} placeholder="e.g. 175"
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
          {bmiVal!==null&&cat&&(
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-gray-900">{bmiVal.toFixed(1)}</span>
                <span className={'text-lg font-semibold '+cat.color}>{cat.label}</span>
              </div>
              <div className="flex rounded-full overflow-hidden h-3">
                {cats.map(c=><div key={c.l} className={c.c+' h-3'} style={{width:c.w+'%'}} />)}
              </div>
              <div className="relative h-0">
                <div className="absolute top-0 w-2 h-4 bg-gray-800 rounded-full -translate-x-1 -translate-y-4" style={{left:pct+'%'}} />
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">BMI Categories</h2>
          <div className="space-y-2">
            {[{label:'Underweight',range:'< 18.5',color:'bg-blue-100 text-blue-700'},{label:'Normal weight',range:'18.5 – 24.9',color:'bg-green-100 text-green-700'},{label:'Overweight',range:'25 – 29.9',color:'bg-yellow-100 text-yellow-700'},{label:'Obese',range:'\u2265 30',color:'bg-red-100 text-red-700'}].map(c=>(
              <div key={c.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                <span className={c.color+' text-xs font-semibold px-2 py-0.5 rounded-full'}>{c.label}</span>
                <span className="text-sm text-gray-500 font-mono">{c.range}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">BMI is a screening tool, not a diagnostic measure. Consult a healthcare provider for medical advice.</p>
        </div>
      </div>
    </ToolLayout>
  )
}