'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('tip-calculator')!
const PRESETS=[10,15,18,20,25]
export default function TipCalculatorPage() {
  const t = useTranslations('toolui')
  const [bill,setBill]=useState('50')
  const [tip,setTip]=useState(18)
  const [people,setPeople]=useState(2)
  const b=parseFloat(bill)||0
  const tipAmt=b*tip/100
  const total=b+tipAmt
  const perPerson=total/people
  const tipPerPerson=tipAmt/people
  const fmt=(v:number)=>'$'+v.toFixed(2)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('tc_bill')}</label>
          <div className="relative"><span className="absolute left-3 top-2.5 text-gray-400">$</span>
            <input type="number" value={bill} onChange={e=>setBill(e.target.value)} className="w-full rounded border border-gray-300 pl-7 pr-3 py-2 text-lg"/></div></div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label className="font-medium text-gray-700">{t('tc_tippct')}</label>
            <span className="font-bold text-blue-700">{tip}%</span>
          </div>
          <div className="flex gap-2 mb-2">
            {PRESETS.map(p=>(
              <button key={p} onClick={()=>setTip(p)}
                className={`flex-1 py-1.5 rounded border text-sm font-medium transition ${tip===p?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>{p}%</button>
            ))}
          </div>
          <input type="range" min="0" max="50" value={tip} onChange={e=>setTip(Number(e.target.value))} className="w-full"/>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('tc_people')}</label>
          <div className="flex items-center gap-3">
            <button onClick={()=>setPeople(Math.max(1,people-1))} className="w-10 h-10 rounded-full border border-gray-300 text-xl hover:bg-gray-100">-</button>
            <span className="text-2xl font-bold w-12 text-center">{people}</span>
            <button onClick={()=>setPeople(people+1)} className="w-10 h-10 rounded-full border border-gray-300 text-xl hover:bg-gray-100">+</button>
          </div></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-500 font-medium">{t('tc_tipamt')}</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{fmt(tipAmt)}</p>
            {people>1&&<p className="text-xs text-blue-400 mt-0.5">{fmt(tipPerPerson)} {t('tc_perperson')}</p>}
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-xs text-green-500 font-medium">{t('tc_total')}{people>1?' '+t('tc_per_person_label'):''}</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{fmt(people>1?perPerson:total)}</p>
            {people>1&&<p className="text-xs text-green-400 mt-0.5">{t('tc_total')}: {fmt(total)}</p>}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}