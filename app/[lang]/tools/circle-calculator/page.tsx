'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

const PI=Math.PI


const tool = getToolBySlug('circle-calculator')!

export default function CircleCalculatorPage() {
  const t = useTranslations('toolui')
  const [input,setInput]=useState('5')
  const [inputType,setInputType]=useState<'radius'|'diameter'|'circumference'|'area'>('radius')

  const val=parseFloat(input)||0
  let r=0
  if(inputType==='radius') r=val
  else if(inputType==='diameter') r=val/2
  else if(inputType==='circumference') r=val/(2*PI)
  else if(inputType==='area') r=Math.sqrt(val/PI)

  const diameter=2*r
  const circumference=2*PI*r
  const area=PI*r*r
  const arcLength1=(PI*r)/2 // quarter arc
  const sectorArea1=(PI*r*r)/4 // quarter sector

  function fmt(n:number):string{return parseFloat(n.toFixed(6)).toString()}

  const results=[
    {label:'cl_radius',value:fmt(r),unit:''},
    {label:'cl_diameter',value:fmt(diameter),unit:''},
    {label:'cl_circumference',value:fmt(circumference),unit:''},
    {label:'cl_area',value:fmt(area),unit:'\u00B2'},
  ]

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('cl_title')}</h1>
        <p className="text-gray-500 mb-8">{t('cl_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('cl_known')}</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(['radius','diameter','circumference','area'] as const).map(it=>(
                <button key={it} onClick={()=>setInputType(it)} className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors '+(inputType===it?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>{t('cl_'+it)}</button>
              ))}
            </div>
            <input type="number" value={input} onChange={e=>setInput(e.target.value)} min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {r>0&&(
            <>
              <div className="flex justify-center">
                <div className="relative">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
                    <line x1="80" y1="80" x2="150" y2="80" stroke="#EF4444" strokeWidth="2" />
                    <line x1="10" y1="80" x2="150" y2="80" stroke="#10B981" strokeWidth="1" strokeDasharray="4" />
                    <text x="112" y="75" fontSize="11" fill="#EF4444" textAnchor="middle">r</text>
                    <text x="80" y="95" fontSize="11" fill="#10B981" textAnchor="middle">d</text>
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {results.map(res=>(
                  <div key={res.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-0.5">{t(res.label)}</div>
                    <div className="font-mono font-bold text-gray-900">{res.value}{res.unit}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400 space-y-0.5">
                <p>{t('cl_using')} \u03C0 = {PI.toFixed(10)}...</p>
              </div>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}