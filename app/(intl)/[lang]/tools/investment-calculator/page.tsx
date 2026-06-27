'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('investment-calculator')!

export default function InvestmentCalculatorPage() {
  const tr = useTranslations('toolui')
  const [principal,setPrincipal]=useState('10000')
  const [rate,setRate]=useState('7')
  const [years,setYears]=useState('10')
  const [contrib,setContrib]=useState('100')
  const [compFreq,setCompFreq]=useState('12')

  const P=parseFloat(principal)||0
  const r=parseFloat(rate)/100
  const t=parseInt(years)||0
  const PMT=parseFloat(contrib)||0
  const n=parseInt(compFreq)||12

  // Compound interest with regular contributions
  const rn=r/n
  const nt=n*t
  const futureValue=P*Math.pow(1+rn,nt)+PMT*(Math.pow(1+rn,nt)-1)/rn
  const totalContrib=P+PMT*12*t
  const totalInterest=futureValue-totalContrib

  // Year-by-year breakdown
  const breakdown=Array.from({length:Math.min(t,30)},(_,i)=>{
    const yr=i+1
    const nyr=n*yr
    const fv=P*Math.pow(1+rn,nyr)+PMT*(Math.pow(1+rn,nyr)-1)/rn
    return{yr,fv,contrib:P+PMT*12*yr,interest:fv-(P+PMT*12*yr)}
  })

  const fmt=(v:number)=>v.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tr('inv_title')}</h1>
        <p className="text-gray-500 mb-8">{tr('inv_subtitle')}</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('inv_initial')}</label>
              <input type="number" value={principal} onChange={e=>setPrincipal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('inv_monthly')}</label>
              <input type="number" value={contrib} onChange={e=>setContrib(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('inv_rate')}</label>
              <input type="number" value={rate} onChange={e=>setRate(e.target.value)} step={0.1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('inv_years')}</label>
              <input type="number" value={years} onChange={e=>setYears(e.target.value)} min={1} max={50}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('inv_freq')}</label>
            <select value={compFreq} onChange={e=>setCompFreq(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="1">{tr('inv_annually')}</option>
              <option value="4">{tr('inv_quarterly')}</option>
              <option value="12">{tr('inv_monthlyf')}</option>
              <option value="365">{tr('inv_daily')}</option>
            </select>
          </div>
        </div>
        {P>0&&t>0&&(
          <>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-brand-700">{fmt(futureValue)}</div>
                <div className="text-xs text-gray-500 mt-1">{tr('inv_fv')}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-700">{fmt(totalInterest)}</div>
                <div className="text-xs text-gray-500 mt-1">{tr('inv_interest')}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-gray-700">{fmt(totalContrib)}</div>
                <div className="text-xs text-gray-500 mt-1">{tr('inv_contributed')}</div>
              </div>
            </div>
            <div className="mt-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">{tr('inv_growth')}</div>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{['inv_h_year','inv_h_balance','inv_h_contrib','inv_h_interest'].map(h=><th key={h} className="px-4 py-2 text-left text-gray-500 font-medium">{tr(h)}</th>)}</tr></thead>
                  <tbody>
                    {breakdown.map(r=>(
                      <tr key={r.yr} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2">{r.yr}</td>
                        <td className="px-4 py-2 font-semibold text-brand-700">{fmt(r.fv)}</td>
                        <td className="px-4 py-2 text-gray-500">{fmt(r.contrib)}</td>
                        <td className="px-4 py-2 text-green-600">{fmt(r.interest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}