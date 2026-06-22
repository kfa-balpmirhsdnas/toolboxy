'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function parseNextRuns(expr:string):string[]{
  // Simple next-run approximator for common patterns
  const now=new Date()
  const parts=expr.trim().split(/\s+/)
  if(parts.length<5) return['Invalid expression']
  return['Exact preview requires a cron library — expression looks valid']
}

function describe(expr:string):string{
  const parts=expr.trim().split(/\s+/)
  if(parts.length<5) return 'Invalid cron expression'
  const [min,hour,dom,month,dow]=parts
  const p:string[]=[]
  if(min==='*')p.push('every minute');else if(min.startsWith('*/'))p.push(`every ${min.slice(2)} minutes`);else p.push(`at minute ${min}`)
  if(hour!=='*'){if(hour.startsWith('*/'))p.push(`every ${hour.slice(2)} hours`);else p.push(`hour ${hour}`)}
  if(dom!=='*')p.push(`on day ${dom} of the month`)
  if(month!=='*')p.push(`in month ${month}`)
  if(dow!=='*'){const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];p.push(`on ${days[parseInt(dow)]||dow}`)}
  return p.join(', ')
}

const PRESETS=[
  {label:'Every minute',expr:'* * * * *'},
  {label:'Every hour',expr:'0 * * * *'},
  {label:'Every day at midnight',expr:'0 0 * * *'},
  {label:'Every day at noon',expr:'0 12 * * *'},
  {label:'Every Monday 9am',expr:'0 9 * * 1'},
  {label:'Every weekday 8am',expr:'0 8 * * 1-5'},
  {label:'Every Sunday midnight',expr:'0 0 * * 0'},
  {label:'Every 15 minutes',expr:'*/15 * * * *'},
  {label:'Every 6 hours',expr:'0 */6 * * *'},
  {label:'First of month',expr:'0 0 1 * *'},
  {label:'Quarterly',expr:'0 0 1 1,4,7,10 *'},
  {label:'Every year Jan 1',expr:'0 0 1 1 *'},
]


const tool = getToolBySlug('cron-expression-generator')!

export default function CronGeneratorPage() {
  const [expr,setExpr]=useState('0 9 * * 1-5')
  const [min,setMin]=useState('0')
  const [hour,setHour]=useState('9')
  const [dom,setDom]=useState('*')
  const [month,setMonth]=useState('*')
  const [dow,setDow]=useState('1-5')
  const [mode,setMode]=useState<'manual'|'builder'>('builder')

  function fromBuilder(){return`${min} ${hour} ${dom} ${month} ${dow}`}
  const current=mode==='builder'?fromBuilder():expr

  let valid=true
  try{new RegExp(current)}catch{valid=false}
  const parts=current.trim().split(/\s+/)
  valid=parts.length===5

  function applyPreset(e:string){
    setExpr(e)
    const p=e.split(' ')
    setMin(p[0]);setHour(p[1]);setDom(p[2]);setMonth(p[3]);setDow(p[4])
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cron Expression Generator</h1>
        <p className="text-gray-500 mb-8">Build and understand cron job schedules with an interactive builder</p>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode('builder')} className={'flex-1 py-2 rounded-lg font-medium '+(mode==='builder'?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>Builder</button>
          <button onClick={()=>setMode('manual')} className={'flex-1 py-2 rounded-lg font-medium '+(mode==='manual'?'bg-brand-500 text-white':'bg-gray-100 text-gray-700')}>Manual</button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          {mode==='builder'?(
            <div className="grid grid-cols-5 gap-2">
              {[['Minute',min,setMin,'0-59, *, */n'],['Hour',hour,setHour,'0-23, *, */n'],['Day',dom,setDom,'1-31, *, */n'],['Month',month,setMonth,'1-12, *'],['Weekday',dow,setDow,'0-6, *']].map(([l,v,fn,ph])=>(
                <div key={l as string}>
                  <label className="block text-xs text-gray-500 mb-1">{l as string}</label>
                  <input value={v as string} onChange={e=>(fn as (s:string)=>void)(e.target.value)} placeholder={ph as string}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              ))}
            </div>
          ):(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
              <input value={expr} onChange={e=>setExpr(e.target.value)} placeholder="* * * * *"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          )}
          <div className={'rounded-xl p-3 text-center '+(valid?'bg-brand-50 border border-brand-100':'bg-red-50 border border-red-200')}>
            <p className="font-mono font-bold text-lg">{current}</p>
            <p className={'text-sm mt-1 '+(valid?'text-gray-600':'text-red-500')}>{valid?describe(current):'Invalid expression'}</p>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Common Presets</h2>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(p=>(
              <button key={p.expr} onClick={()=>applyPreset(p.expr)} className="text-left bg-gray-50 hover:bg-brand-50 rounded-xl p-3 transition-colors">
                <div className="text-xs font-medium text-gray-700">{p.label}</div>
                <div className="font-mono text-xs text-gray-400">{p.expr}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}