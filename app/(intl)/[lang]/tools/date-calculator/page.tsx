'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('date-calculator')!
const LOC:Record<string,string>={en:'en-US',ko:'ko-KR',ja:'ja-JP'}
type Mode='diff'|'add'|'subtract'
export default function DateCalculatorPage() {
  const t = useTranslations('toolui')
  const locale = useLocale()
  const [mode,setMode]=useState<Mode>('diff')
  const [date1,setDate1]=useState(new Date().toISOString().slice(0,10))
  const [date2,setDate2]=useState(new Date(Date.now()+86400000*100).toISOString().slice(0,10))
  const [baseDate,setBaseDate]=useState(new Date().toISOString().slice(0,10))
  const [addYears,setAddYears]=useState(0)
  const [addMonths,setAddMonths]=useState(0)
  const [addDays,setAddDays]=useState(30)
  const diff=()=>{
    const a=new Date(date1),b=new Date(date2)
    const ms=Math.abs(b.getTime()-a.getTime())
    const totalDays=Math.floor(ms/86400000)
    return{totalDays,totalWeeks:Math.floor(totalDays/7),years:Math.floor(totalDays/365),months:Math.floor((totalDays%365)/30),days:totalDays%30,hours:Math.floor(ms/3600000),minutes:Math.floor(ms/60000)}
  }
  const addSub=(sign:1|-1)=>{
    const d=new Date(baseDate)
    d.setFullYear(d.getFullYear()+sign*addYears)
    d.setMonth(d.getMonth()+sign*addMonths)
    d.setDate(d.getDate()+sign*addDays)
    return d.toLocaleDateString(LOC[locale]||'en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
  }
  const result=mode==='diff'?diff():null
  const resultDate=mode!=='diff'?addSub(mode==='add'?1:-1):null
  const MODES:Array<{v:Mode;l:string}>=[{v:'diff',l:t('dt_diff')},{v:'add',l:t('dt_add')},{v:'subtract',l:t('dt_sub')}]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {MODES.map(m=>(
            <button key={m.v} onClick={()=>setMode(m.v)}
              className={'flex-1 py-2 text-xs font-medium transition '+(mode===m.v?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>{m.l}</button>
          ))}
        </div>
        {mode==='diff'?(
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">{t('dt_start')}</label>
              <input type="date" value={date1} onChange={e=>setDate1(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">{t('dt_end')}</label>
              <input type="date" value={date2} onChange={e=>setDate2(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"/></div>
          </div>
        ):(
          <div className="space-y-3">
            <div><label className="block text-xs text-gray-500 mb-1">{t('dt_base')}</label>
              <input type="date" value={baseDate} onChange={e=>setBaseDate(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"/></div>
            <div className="grid grid-cols-3 gap-2">
              {([['dt_years',addYears,setAddYears],['dt_months',addMonths,setAddMonths],['dt_days',addDays,setAddDays]] as const).map(([l,v,s])=>(
                <div key={l}><label className="block text-xs text-gray-500 mb-1">{t(l)}</label>
                  <input type="number" value={v} onChange={e=>(s as any)(Number(e.target.value))} min="0"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-center font-bold focus:outline-none focus:border-blue-400"/></div>
              ))}
            </div>
          </div>
        )}
        {mode==='diff'&&result&&(
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-medium text-blue-600">{t('dt_difference')}</p>
            <p className="text-3xl font-bold text-blue-700">{result.totalDays.toLocaleString()} {t('ag_days')}</p>
            <div className="grid grid-cols-2 gap-2">
              {([['dt_years',result.years],['dt_months',result.months],['dt_weeks',result.totalWeeks],['dt_rdays',result.days],['ag_thours',result.hours.toLocaleString()],['ag_tmins',result.minutes.toLocaleString()]] as const).map(([l,v])=>(
                <div key={l} className="bg-white/70 rounded-xl px-3 py-2">
                  <p className="font-bold text-gray-800">{v}</p><p className="text-xs text-gray-500">{t(l)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {mode!=='diff'&&resultDate&&(
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
            <p className="text-xs font-medium text-blue-600 mb-1">{t('dt_result')}</p>
            <p className="text-xl font-bold text-blue-700">{resultDate}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}