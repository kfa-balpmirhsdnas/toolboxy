'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('cron-expression-parser')!
function parseCron(expr:string):string{
  const parts=expr.trim().split(/\s+/)
  if(parts.length!==5)return 'Invalid: must have 5 fields (min hour dom mon dow)'
  const [min,hour,dom,mon,dow]=parts
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const f=(v:string,max:number,names?:string[]):string=>{
    if(v==='*')return 'every'
    if(v.startsWith('*/'))return 'every '+v.slice(2)
    if(v.includes(','))return v.split(',').map(x=>names?names[parseInt(x)-1]||x:x).join(', ')
    if(v.includes('-')){const [a,b]=v.split('-');return (names?names[parseInt(a)-1]||a:a)+' through '+(names?names[parseInt(b)-1]||b:b)}
    const n=parseInt(v)
    if(names&&n>=0&&n<names.length)return names[n]
    return v
  }
  const lines=[
    'Minute: '+f(min,59),
    'Hour: '+f(hour,23),
    'Day of month: '+f(dom,31),
    'Month: '+f(mon,12,MONTHS),
    'Day of week: '+f(dow,6,DAYS),
  ]
  let desc='Runs '
  if(min==='*'&&hour==='*')desc+='every minute'
  else if(min.startsWith('*/'))desc+='every '+min.slice(2)+' minutes'
  else if(hour==='*')desc+='at minute '+min+' of every hour'
  else desc+='at '+hour.padStart(2,'0')+':'+min.padStart(2,'0')
  if(dom!=='*')desc+=', on day '+dom+' of the month'
  if(mon!=='*')desc+=', in '+f(mon,12,MONTHS)
  if(dow!=='*')desc+=', on '+f(dow,6,DAYS)
  return lines.join('\n')+'\n\n'+desc
}
const PRESETS=[
  {label:'Every minute',val:'* * * * *'},
  {label:'Every hour',val:'0 * * * *'},
  {label:'Daily at midnight',val:'0 0 * * *'},
  {label:'Every Monday 9am',val:'0 9 * * 1'},
  {label:'Monthly 1st midnight',val:'0 0 1 * *'},
  {label:'Every 5 minutes',val:'*/5 * * * *'},
  {label:'Weekdays 9-17',val:'0 9-17 * * 1-5'},
]
export default function CronExpressionParserPage() {
  const [expr,setExpr]=useState('0 9 * * 1-5')
  const parsed=parseCron(expr)
  const isValid=!parsed.startsWith('Invalid')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CRON Expression</label>
          <input value={expr} onChange={e=>setExpr(e.target.value)}
            className={`w-full rounded border px-3 py-2 font-mono text-lg ${isValid?'border-gray-300':'border-red-300 bg-red-50'}`}
            placeholder="* * * * *"/>
          <p className="text-xs text-gray-400 mt-1">Format: minute hour day-of-month month day-of-week</p>
        </div>
        {isValid&&(
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <pre className="font-mono text-sm text-blue-800 whitespace-pre-wrap">{parsed}</pre>
          </div>
        )}
        {!isValid&&<p className="text-red-500 text-sm">{parsed}</p>}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Common Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p=>(
              <button key={p.val} onClick={()=>setExpr(p.val)}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-xs hover:bg-gray-100 font-mono">{p.val}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS.map(p=>(
              <span key={p.label} className="text-xs text-gray-500">{p.label}</span>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}