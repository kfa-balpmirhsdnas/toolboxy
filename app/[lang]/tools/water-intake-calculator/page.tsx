'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('water-intake-calculator')!

export default function WaterIntakeCalculatorPage() {
  const [weight,setWeight]=useState('70')
  const [unit,setUnit]=useState<'kg'|'lbs'>('kg')
  const [activity,setActivity]=useState('moderate')
  const [climate,setClimate]=useState('temperate')

  const wKg=unit==='kg'?parseFloat(weight)||0:(parseFloat(weight)||0)*0.453592

  const ACTIVITY_MULT={sedentary:0.033,light:0.036,moderate:0.039,active:0.042,intense:0.046}
  const CLIMATE_ADD={cold:-0.2,temperate:0,warm:0.3,hot:0.5,humid:0.4}

  const baseL=wKg*(ACTIVITY_MULT[activity as keyof typeof ACTIVITY_MULT]||0.033)
  const finalL=Math.max(1.5,baseL+(CLIMATE_ADD[climate as keyof typeof CLIMATE_ADD]||0))
  const cups=finalL/0.237
  const oz=finalL*33.814
  const glasses=finalL/0.25

  const pct=Math.min(100,(finalL/4)*100)

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Water Intake Calculator</h1>
        <p className="text-gray-500 mb-8">Calculate your recommended daily water intake based on weight, activity, and climate</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Weight</label>
            <div className="flex gap-2">
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="70"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {(['kg','lbs'] as const).map(u=>(
                <button key={u} onClick={()=>setUnit(u)} className={'px-3 py-2 rounded-lg font-medium transition-colors '+(unit===u?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{u}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
            <div className="space-y-1">
              {[['sedentary','Sedentary','Little or no exercise'],['light','Lightly active','1-3 days/week'],['moderate','Moderately active','3-5 days/week'],['active','Very active','6-7 days/week'],['intense','Extremely active','Hard exercise + physical job']].map(([id,l,d])=>(
                <button key={id} onClick={()=>setActivity(id)} className={'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left '+(activity===id?'border-brand-300 bg-brand-50':'border-gray-200 hover:bg-gray-50')}>
                  <span className="text-sm font-medium">{l}</span>
                  <span className="text-xs text-gray-400">{d}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Climate</label>
            <div className="flex flex-wrap gap-2">
              {[['cold','\u2744\uFE0F Cold'],['temperate','\uD83C\uDF24\uFE0F Temperate'],['warm','\uD83C\uDF25\uFE0F Warm'],['hot','\u2600\uFE0F Hot'],['humid','\uD83D\uDCA7 Humid']].map(([id,l])=>(
                <button key={id} onClick={()=>setClimate(id)} className={'px-3 py-2 text-sm rounded-lg font-medium transition-colors '+(climate===id?'bg-cyan-500 text-white':'bg-gray-100 text-gray-700')}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        {wKg>0&&(
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 text-center space-y-4">
            <div>
              <p className="text-sm text-gray-500">Recommended Daily Intake</p>
              <p className="text-5xl font-bold text-cyan-600">{finalL.toFixed(1)} L</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-cyan-500 h-3 rounded-full transition-all" style={{width:pct+'%'}} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><div className="font-bold text-gray-800">{cups.toFixed(0)}</div><div className="text-xs text-gray-500">US cups</div></div>
              <div><div className="font-bold text-gray-800">{oz.toFixed(0)} oz</div><div className="text-xs text-gray-500">fl oz</div></div>
              <div><div className="font-bold text-gray-800">{glasses.toFixed(0)}</div><div className="text-xs text-gray-500">250ml glasses</div></div>
            </div>
            <p className="text-xs text-gray-400">This is an estimate. Consult a healthcare provider for personalized advice.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}