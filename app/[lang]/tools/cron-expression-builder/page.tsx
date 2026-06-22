'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('cron-expression-builder')!

const PRESETS = [
  { label:'Every minute',    expr:'* * * * *' },
  { label:'Every hour',      expr:'0 * * * *' },
  { label:'Every day midnight', expr:'0 0 * * *' },
  { label:'Every Mon 9am',   expr:'0 9 * * 1' },
  { label:'Every 1st of month', expr:'0 0 1 * *' },
  { label:'Every 15 minutes', expr:'*/15 * * * *' },
  { label:'Weekdays at noon', expr:'0 12 * * 1-5' },
  { label:'Every Sunday',    expr:'0 0 * * 0' },
]

function getDescription(parts: string[]): string {
  const [min,hr,dom,mon,dow] = parts
  const desc: string[] = []

  function descField(val: string, unit: string, names?: string[]): string {
    if (val==='*') return 'every '+unit
    if (val.startsWith('*/')) return 'every '+val.slice(2)+' '+unit+'s'
    if (val.includes('-')) { const [a,b]=val.split('-'); return (names?.[parseInt(a)]||a)+' to '+(names?.[parseInt(b)]||b) }
    if (val.includes(',')) return val.split(',').map(v=>names?.[parseInt(v)]||v).join(', ')
    return names?.[parseInt(val)] ? names[parseInt(val)] : 'at '+val
  }

  const MONTHS=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  if (min==='*') desc.push('every minute')
  else if (min.startsWith('*/')) desc.push('every '+min.slice(2)+' minutes')
  else desc.push('at minute '+min)

  if (hr!=='*') desc.push(hr.startsWith('*/')?'every '+hr.slice(2)+' hours':'hour '+hr)
  if (dom!=='*') desc.push('on day '+dom+' of the month')
  if (mon!=='*') desc.push('in '+descField(mon,'month',MONTHS))
  if (dow!=='*') desc.push('on '+descField(dow,'day',DAYS))

  return desc.join(', ')
}

function getNextRuns(expr: string, count=5): string[] {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return []
  try {
    const [min,hr,dom,mon,dow] = parts
    const runs: string[] = []
    const now = new Date()
    const d = new Date(now)
    d.setSeconds(0,0)
    d.setMinutes(d.getMinutes()+1)

    const matchField = (val: string, n: number, max: number): boolean => {
      if (val==='*') return true
      if (val.startsWith('*/')) { const step=parseInt(val.slice(2)); return n%step===0 }
      if (val.includes('-')) { const [a,b]=val.split('-').map(Number); return n>=a&&n<=b }
      return val.split(',').some(v=>parseInt(v)===n)
    }

    let tries = 0
    while (runs.length < count && tries++ < 525600) {
      if (matchField(mon,d.getMonth()+1,12) && matchField(dom,d.getDate(),31) &&
          matchField(dow,d.getDay(),6) && matchField(hr,d.getHours(),23) && matchField(min,d.getMinutes(),59)) {
        runs.push(d.toLocaleString('en-US',{weekday:'short',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}))
      }
      d.setMinutes(d.getMinutes()+1)
    }
    return runs
  } catch { return [] }
}

export default function CronExpressionBuilderPage({ params }: { params: { lang: string } }) {
  const [expr, setExpr] = useState('0 9 * * 1-5')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('cron-expression-builder'); tracked.current = true } }

  const parts = expr.trim().split(/\s+/)
  const valid = parts.length === 5
  const description = valid ? getDescription(parts) : 'Invalid expression'
  const nextRuns = valid ? getNextRuns(expr) : []

  async function copy() {
    await navigator.clipboard.writeText(expr)
    trackToolCopy('cron-expression-builder')
    setCopied(true); setTimeout(()=>setCopied(false),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cron Expression</label>
          <div className="flex gap-2">
            <input value={expr} onChange={e=>{setExpr(e.target.value);track()}} placeholder="* * * * *"
              className={'flex-1 px-4 py-3 border rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 ' + (!valid&&expr?'border-red-300':'border-gray-200')} />
            <button onClick={copy} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm hover:bg-brand-700 transition-colors">{copied?'\u2713':'Copy'}</button>
          </div>
          <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
            {['minute','hour','day','month','weekday'].map((f,i)=>(
              <span key={f}><span className="font-mono text-gray-600">{parts[i]||'*'}</span> = {f}</span>
            ))}
          </div>
        </div>
        {valid && (
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-800 font-medium capitalize">{description}</div>
        )}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.expr} onClick={()=>{setExpr(p.expr);track()}}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        {nextRuns.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Next {nextRuns.length} runs</p>
            <div className="space-y-1">
              {nextRuns.map((run,i)=>(
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 w-4">{i+1}.</span>
                  <span className="font-mono text-gray-700">{run}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
