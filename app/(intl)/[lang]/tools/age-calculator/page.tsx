'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('age-calculator')!
export default function AgeCalculatorPage() {
  const t = useTranslations('toolui')
  const [dob,setDob]=useState('1990-01-01')
  const [toDate,setToDate]=useState(new Date().toISOString().slice(0,10))
  const [now,setNow]=useState(new Date())
  useEffect(()=>{const iv=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(iv)},[])
  const birth=new Date(dob)
  const target=new Date(toDate)
  const ms=target.getTime()-birth.getTime()
  const totalDays=Math.floor(ms/(1000*60*60*24))
  const years=Math.floor(totalDays/365.25)
  const months=Math.floor((totalDays%365.25)/30.437)
  const days=Math.floor((totalDays%365.25)%30.437)
  const hours=Math.floor(ms/(1000*60*60))
  const minutes=Math.floor(ms/(1000*60))
  const seconds=Math.floor(ms/1000)
  const nextBday=new Date(birth)
  nextBday.setFullYear(now.getFullYear())
  if(nextBday<=now)nextBday.setFullYear(now.getFullYear()+1)
  const daysUntil=Math.ceil((nextBday.getTime()-now.getTime())/(1000*60*60*24))
  const zodiac=(d:Date)=>{const m=d.getMonth()+1,day=d.getDate();if((m===3&&day>=21)||(m===4&&day<=19))return'aries';if((m===4&&day>=20)||(m===5&&day<=20))return'taurus';if((m===5&&day>=21)||(m===6&&day<=20))return'gemini';if((m===6&&day>=21)||(m===7&&day<=22))return'cancer';if((m===7&&day>=23)||(m===8&&day<=22))return'leo';if((m===8&&day>=23)||(m===9&&day<=22))return'virgo';if((m===9&&day>=23)||(m===10&&day<=22))return'libra';if((m===10&&day>=23)||(m===11&&day<=21))return'scorpio';if((m===11&&day>=22)||(m===12&&day<=21))return'sagittarius';if((m===12&&day>=22)||(m===1&&day<=19))return'capricorn';if((m===1&&day>=20)||(m===2&&day<=18))return'aquarius';return'pisces'}
  const valid=!isNaN(ms)&&ms>=0
  // 만나이 계산기(man-age-calculator) 통합 — 연 나이·세는 나이 병기
  const yearAge=target.getFullYear()-birth.getFullYear()
  const counting=yearAge+1
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('ag_dob')}</label>
            <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2.5"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('ag_atdate')}</label>
            <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2.5"/></div>
        </div>
        {valid?(
          <>
            <div className="text-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
              <p className="text-xs opacity-80 mb-1">{t('ag_age')}</p>
              <p className="text-5xl font-bold font-mono">{years}</p>
              <p className="text-lg mt-1 opacity-90">{months} {t('ag_months')}, {days} {t('ag_days')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-500">{t('ag_yearage')}</p>
                <p className="font-bold text-gray-800 font-mono">{yearAge}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-500">{t('ag_counting')}</p>
                <p className="font-bold text-gray-800 font-mono">{counting}</p>
              </div>
              {[['ag_tdays',totalDays.toLocaleString()],['ag_thours',hours.toLocaleString()],['ag_tmins',minutes.toLocaleString()],['ag_tsecs',seconds.toLocaleString()]].map(([l,v])=>(
                <div key={l} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-gray-500">{t(l)}</p>
                  <p className="font-bold text-gray-800 font-mono">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 rounded-xl px-4 py-3 flex justify-between items-center border border-amber-100">
              <div>
                <p className="text-xs text-amber-600">{t('ag_nextbday')}</p>
                <p className="font-semibold text-amber-800">{daysUntil === 0 ? t('ag_today') : daysUntil+' '+t('ag_daysaway')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-600">{t('ag_zodiac')}</p>
                <p className="font-semibold text-amber-800">{t('ag_z_'+zodiac(birth))}</p>
              </div>
            </div>
          </>
        ):(
          <div className="text-center py-6 text-gray-400">{t('ag_invalid')}</div>
        )}
      </div>
    </ToolLayout>
  )
}