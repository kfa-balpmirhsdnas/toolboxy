'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('date-calculator')!

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime()-a.getTime())/(1000*60*60*24))
}

function addDuration(date: Date, years: number, months: number, days: number): Date {
  const d = new Date(date)
  d.setFullYear(d.getFullYear()+years, d.getMonth()+months, d.getDate()+days)
  return d
}

function getAge(birth: Date, now: Date): { years:number; months:number; days:number } {
  let years = now.getFullYear()-birth.getFullYear()
  let months = now.getMonth()-birth.getMonth()
  let days = now.getDate()-birth.getDate()
  if (days < 0) { months--; const prevMonth=new Date(now.getFullYear(),now.getMonth(),0); days+=prevMonth.getDate() }
  if (months < 0) { years--; months+=12 }
  return { years, months, days }
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
}

export default function DateCalculatorPage({ params }: { params: { lang: string } }) {
  const todayStr = new Date().toISOString().slice(0,10)
  const [tab, setTab] = useState<'diff'|'add'|'age'>('diff')
  const [date1, setDate1] = useState(todayStr)
  const [date2, setDate2] = useState(() => { const d=new Date(); d.setDate(d.getDate()+30); return d.toISOString().slice(0,10) })
  const [addDate, setAddDate] = useState(todayStr)
  const [addY, setAddY] = useState(0)
  const [addM, setAddM] = useState(3)
  const [addD, setAddD] = useState(0)
  const [birthDate, setBirthDate] = useState('1990-01-01')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('date-calculator'); tracked.current = true } }

  async function copy(val:string,id:string) {
    await navigator.clipboard.writeText(val)
    trackToolCopy('date-calculator')
    setCopied(id); setTimeout(()=>setCopied(null),1500)
  }

  const d1 = new Date(date1), d2 = new Date(date2)
  const diffDays = !isNaN(d1.getTime())&&!isNaN(d2.getTime()) ? daysBetween(d1,d2) : 0
  const diffAbs = Math.abs(diffDays)
  
  const addResult = !isNaN(new Date(addDate).getTime()) ? addDuration(new Date(addDate),addY,addM,addD) : null
  
  const birthD = new Date(birthDate)
  const age = !isNaN(birthD.getTime()) ? getAge(birthD,new Date()) : null
  const nextBirthday = age ? (() => {
    const nb=new Date(new Date().getFullYear(),birthD.getMonth(),birthD.getDate())
    if (nb<=new Date()) nb.setFullYear(nb.getFullYear()+1)
    return nb
  })() : null

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {([['diff','Date Difference'],['add','Add / Subtract'],['age','Age Calculator']] as const).map(([t,label])=>(
            <button key={t} onClick={()=>{setTab(t);track()}}
              className={'px-3 py-1.5 rounded-lg text-sm transition-colors ' + (tab===t?'bg-brand-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {label}
            </button>
          ))}
        </div>

        {tab==='diff' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[['Start date',date1,setDate1],['End date',date2,setDate2]].map(([label,val,set])=>(
                <div key={label as string}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label as string}</label>
                  <input type="date" value={val as string} onChange={e=>{(set as (v:string)=>void)(e.target.value);track()}}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              ))}
            </div>
            {!isNaN(d1.getTime())&&!isNaN(d2.getTime()) && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label:'Days', val:String(diffAbs) },
                  { label:'Weeks', val:(diffAbs/7).toFixed(2) },
                  { label:'Months (approx)', val:(diffAbs/30.44).toFixed(2) },
                  { label:'Years (approx)', val:(diffAbs/365.25).toFixed(2) },
                  { label:'Hours', val:(diffAbs*24).toLocaleString() },
                  { label:'Direction', val:diffDays>=0?'Future':'Past' },
                ].map(row=>(
                  <div key={row.label} onClick={()=>copy(row.val,row.label)}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 transition-colors">
                    <p className="text-xs text-gray-500">{row.label}</p>
                    <p className="text-base font-semibold text-gray-800">{row.val}</p>
                    {copied===row.label && <p className="text-xs text-brand-400">\u2713</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='add' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Base date</label>
              <input type="date" value={addDate} onChange={e=>{setAddDate(e.target.value);track()}}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['Years',addY,setAddY],['Months',addM,setAddM],['Days',addD,setAddD]].map(([label,val,set])=>(
                <div key={label as string}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label as string}</label>
                  <input type="number" value={val as number} onChange={e=>{(set as (v:number)=>void)(parseInt(e.target.value)||0);track()}}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              ))}
            </div>
            {addResult && (
              <div onClick={()=>copy(formatDate(addResult),'addResult')}
                className="p-4 bg-brand-50 border border-brand-200 rounded-xl cursor-pointer hover:border-brand-400 transition-colors">
                <p className="text-xs text-gray-500 mb-1">Result</p>
                <p className="text-lg font-semibold text-brand-700">{formatDate(addResult)}</p>
                <p className="text-xs text-gray-400">{addResult.toISOString().slice(0,10)}</p>
                {copied==='addResult' && <p className="text-xs text-brand-400">\u2713 Copied</p>}
              </div>
            )}
          </div>
        )}

        {tab==='age' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date of birth</label>
              <input type="date" value={birthDate} onChange={e=>{setBirthDate(e.target.value);track()}}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            {age && (
              <div className="space-y-2">
                <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-center">
                  <p className="text-3xl font-bold text-brand-700">{age.years}</p>
                  <p className="text-xs text-gray-500">years old</p>
                  <p className="text-sm text-gray-600 mt-1">{age.months} months, {age.days} days</p>
                </div>
                {nextBirthday && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                    <span className="text-gray-500">Next birthday: </span>
                    <span className="font-medium">{formatDate(nextBirthday)}</span>
                    <span className="text-gray-400 ml-2">({daysBetween(new Date(),nextBirthday)} days)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
