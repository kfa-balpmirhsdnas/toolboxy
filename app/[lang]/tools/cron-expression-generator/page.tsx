'use client'
import { useState } from 'react'

type Field = {name:string;min:number;max:number;labels?:string[]}
const FIELDS: Field[] = [
  {name:'Minute',  min:0, max:59},
  {name:'Hour',    min:0, max:23},
  {name:'Day',     min:1, max:31},
  {name:'Month',   min:1, max:12, labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']},
  {name:'Weekday', min:0, max:6,  labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']},
]
const PRESETS=[
  {label:'Every minute',cron:'* * * * *'},
  {label:'Every hour',  cron:'0 * * * *'},
  {label:'Every day at midnight',cron:'0 0 * * *'},
  {label:'Every day at noon',cron:'0 12 * * *'},
  {label:'Every Sunday midnight',cron:'0 0 * * 0'},
  {label:'Every Monday 9am',cron:'0 9 * * 1'},
  {label:'1st of every month',cron:'0 0 1 * *'},
  {label:'Every weekday 8am',cron:'0 8 * * 1-5'},
]

function describe(expr:string):string{
  const parts=expr.trim().split(/\s+/)
  if(parts.length!==5) return 'Invalid expression'
  const [min,hr,day,mon,wd]=parts
  const p=(v:string,unit:string,f:Field)=>{
    if(v==='*') return 'every '+unit
    if(v.startsWith('*/')) return 'every '+v.slice(2)+' '+unit+'s'
    if(v.includes('-')) return unit+' '+v.split('-').join(' to ')
    if(v.includes(',')) return 'at '+unit+' '+v
    const n=parseInt(v)
    if(f.labels&&f.labels[n-f.min]) return f.labels[n-f.min]
    return unit+' '+v
  }
  const parts2=[p(min,'minute',FIELDS[0]),p(hr,'hour',FIELDS[1])]
  if(day!=='*') parts2.push(p(day,'day',FIELDS[2]))
  if(mon!=='*') parts2.push(p(mon,'month',FIELDS[3]))
  if(wd!=='*') parts2.push('on '+p(wd,'weekday',FIELDS[4]))
  return parts2.join(', ')
}

export default function CronExpressionGeneratorPage() {
  const [vals, setVals] = useState(['*','*','*','*','*'])
  const [copied, setCopied] = useState(false)

  const expr = vals.join(' ')

  function setField(i:number,v:string){
    setVals(prev=>{const n=[...prev];n[i]=v||'*';return n})
  }

  function applyPreset(c:string){setVals(c.split(' '))}
  function copy(){navigator.clipboard.writeText(expr);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cron Expression Generator</h1>
        <p className="text-gray-500 mb-8">Build cron schedule expressions visually with common presets</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-5 gap-3">
            {FIELDS.map((f,i)=>(
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">{f.name}</label>
                <input value={vals[i]} onChange={e=>setField(i,e.target.value)}
                  placeholder="*"
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            ))}
          </div>
          <div className="bg-gray-900 rounded-xl px-5 py-4 flex items-center justify-between">
            <code className="text-green-400 font-mono text-lg tracking-widest">{expr}</code>
            <button onClick={copy} className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg ml-4 shrink-0">
              {copied?'\u2713 Copied':'Copy'}
            </button>
          </div>
          <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
            <div className="text-xs text-brand-600 font-medium uppercase mb-0.5">Description</div>
            <div className="text-brand-800">{describe(expr)}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Special values: * (any) &nbsp; */n (every n) &nbsp; a-b (range) &nbsp; a,b (list)</div>
          </div>
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Common Presets</h2>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(p=>(
              <button key={p.cron} onClick={()=>applyPreset(p.cron)}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-brand-50 hover:border-brand-200 border border-gray-100 rounded-lg text-left transition-colors">
                <span className="text-sm text-gray-700">{p.label}</span>
                <code className="text-xs font-mono text-brand-600 ml-2">{p.cron}</code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}