'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('cron-expression-parser')!
const PRESETS=[{label:'Every minute',expr:'* * * * *'},{label:'Every hour',expr:'0 * * * *'},{label:'Every day at midnight',expr:'0 0 * * *'},{label:'Every day at noon',expr:'0 12 * * *'},{label:'Every Monday 9am',expr:'0 9 * * 1'},{label:'Every weekday',expr:'0 9 * * 1-5'},{label:'First of month',expr:'0 0 1 * *'},{label:'Every 15 min',expr:'*/15 * * * *'},{label:'Every 6 hours',expr:'0 */6 * * *'},{label:'Twice daily',expr:'0 8,18 * * *'}]
function parseCron(expr:string):{valid:boolean;description:string;parts:{field:string;value:string;desc:string}[]}{
  const parts=expr.trim().split(/s+/)
  if(parts.length!==5)return{valid:false,description:'Must have 5 fields: minute hour day-of-month month day-of-week',parts:[]}
  const [min,hour,dom,mon,dow]=parts
  const fmtMin=(v:string)=>v==='*'?'every minute':v.startsWith('*/')?' every '+v.slice(2)+' minutes':v.includes(',')?' at minutes '+v:' at minute '+v
  const fmtHour=(v:string)=>v==='*'?'every hour':v.startsWith('*/')?' every '+v.slice(2)+' hours':v.includes(',')?' at hours '+v:' at '+v+':00'
  const fmtDom=(v:string)=>v==='*'?'every day':v.startsWith('*/')?' every '+v.slice(2)+' days':' on day '+v
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']
  const fmtMon=(v:string)=>v==='*'?'every month':MONTHS[(parseInt(v)||1)-1]||v
  const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const fmtDow=(v:string)=>v==='*'?'every day of week':v.includes('-')?DAYS[parseInt(v[0])]+' to '+DAYS[parseInt(v[2])]:DAYS[parseInt(v)]||v
  const desc=[fmtMin(min),' '+fmtHour(hour)+',','on '+fmtDom(dom)+',','in '+fmtMon(mon)+',',fmtDow(dow)].join(' ')
  return{valid:true,description:desc,parts:[{field:'Minute',value:min,desc:fmtMin(min)},{field:'Hour',value:hour,desc:fmtHour(hour)},{field:'Day of month',value:dom,desc:fmtDom(dom)},{field:'Month',value:mon,desc:fmtMon(mon)},{field:'Day of week',value:dow,desc:fmtDow(dow)}]}
}
export default function CronExpressionParserPage() {
  const [expr,setExpr]=useState('0 9 * * 1-5')
  const [copied,setCopied]=useState(false)
  const result=parseCron(expr)
  const copy=()=>{navigator.clipboard.writeText(expr);setCopied(true);setTimeout(()=>setCopied(false),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Cron expression</label>
          <div className="flex gap-2">
            <input value={expr} onChange={e=>setExpr(e.target.value)}
              className={'flex-1 rounded-xl border px-3 py-2.5 font-mono text-lg font-bold tracking-widest focus:outline-none '+(result.valid?'border-gray-300 focus:border-blue-400':'border-red-300 bg-red-50')}
              placeholder="* * * * *"/>
            <button onClick={copy} className="px-3 rounded-xl bg-gray-100 text-sm hover:bg-gray-200">{copied?'✓':'Copy'}</button>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-mono text-center">minute  hour  day-of-month  month  day-of-week</p>
        </div>
        {result.valid?(
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-600 font-medium mb-1">Runs</p>
              <p className="text-sm text-green-800 font-medium">{result.description}</p>
            </div>
            <div className="space-y-1.5">
              {result.parts.map(p=>(
                <div key={p.field} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl">
                  <span className="w-28 text-xs font-medium text-gray-500">{p.field}</span>
                  <code className="px-2 py-0.5 bg-gray-800 text-green-400 rounded text-xs font-mono w-16 text-center">{p.value}</code>
                  <span className="text-xs text-gray-600">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ):(
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{result.description}</div>
        )}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p=>(
              <button key={p.label} onClick={()=>setExpr(p.expr)}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">{p.label}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}