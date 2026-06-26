'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('calorie-calculator')!
const ACTIVITY=[{k:'act0',mult:1.2},{k:'act1',mult:1.375},{k:'act2',mult:1.55},{k:'act3',mult:1.725},{k:'act4',mult:1.9}]
const GOALS=[{k:'goal0',adj:-550},{k:'goal1',adj:-275},{k:'goal2',adj:0},{k:'goal3',adj:275},{k:'goal4',adj:550}]
export default function CalorieCalculatorPage() {
  const t = useTranslations('toolui')
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
              className={'flex-1 py-2 text-sm font-medium transition '+(unit===u?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('cal_'+u)}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">{t('cal_sex')}</label>
            <div className="flex gap-2">
              {(['male','female'] as const).map(s=>(
                <button key={s} onClick={()=>setSex(s)}
                  className={'flex-1 py-2 rounded-xl border text-sm font-medium transition '+(sex===s?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-600 hover:bg-gray-50')}>{t('cal_'+s)}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">{t('cal_age')}</label>
            <input type="number" value={age} onChange={e=>setAge(Number(e.target.value))} min="15" max="100"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">{t('bmi_weight')} ({unit==='metric'?'kg':'lbs'})</label>
            <input type="number" value={weight} onChange={e=>setWeight(Number(e.target.value))} min="30"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs text-gray-500 mb-1">{t('bmi_height')} ({unit==='metric'?'cm':'in'})</label>
            <input type="number" value={height} onChange={e=>setHeight(Number(e.target.value))} min="100"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-center font-mono focus:outline-none focus:border-blue-400"/></div>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">{t('cal_activity')}</label>
          <select value={actIdx} onChange={e=>setActIdx(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
            {ACTIVITY.map((a,i)=><option key={i} value={i}>{t('cal_'+a.k)}</option>)}
          </select></div>
        <div><label className="block text-xs text-gray-500 mb-1">{t('cal_goal')}</label>
          <select value={goalIdx} onChange={e=>setGoalIdx(Number(e.target.value))} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
            {GOALS.map((g,i)=><option key={i} value={i}>{t('cal_'+g.k)}</option>)}
          </select></div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[{id:'cal_bmr',v:Math.round(bmr)+' kcal'},{id:'cal_tdee',v:tdee+' kcal'},{id:'cal_target',v:target+' kcal',cls:'text-blue-700',big:true}].map(({id,v,cls,big})=>(
              <div key={id} className={'bg-white/70 rounded-xl py-3 px-4 '+(big?'col-span-2 text-center':'')}>
                <p className={'font-bold text-lg '+(cls||'text-gray-800')}>{v}</p>
                <p className="text-xs text-gray-500">{t(id)}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-gray-600 mb-2">{t('cal_macros')}</p>
          <div className="grid grid-cols-3 gap-2">
            {[{id:'cal_protein',v:macros.protein+'g',p:'30%'},{id:'cal_carbs',v:macros.carbs+'g',p:'45%'},{id:'cal_fat',v:macros.fat+'g',p:'25%'}].map(({id,v,p})=>(
              <div key={id} className="bg-white/70 rounded-xl py-2 text-center">
                <p className="font-bold text-gray-800">{v}</p>
                <p className="text-xs text-gray-500">{t(id)} ({p})</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">{t('cal_disclaimer')}</p>
      </div>
    </ToolLayout>
  )
}
