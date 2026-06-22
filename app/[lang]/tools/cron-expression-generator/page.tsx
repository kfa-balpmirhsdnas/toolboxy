'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('cron-expression-generator')!
const PRESETS=[
  {label:'Every minute',expr:'* * * * *'},
  {label:'Every 5 minutes',expr:'*/5 * * * *'},
  {label:'Every 15 minutes',expr:'*/15 * * * *'},
  {label:'Every 30 minutes',expr:'*/30 * * * *'},
  {label:'Every hour',expr:'0 * * * *'},
  {label:'Every day at midnight',expr:'0 0 * * *'},
  {label:'Every day at noon',expr:'0 12 * * *'},
  {label:'Every Sunday',expr:'0 0 * * 0'},
  {label:'Every Monday-Friday',expr:'0 9 * * 1-5'},
  {label:'1st of every month',expr:'0 0 1 * *'},
  {label:'Every Jan 1st',expr:'0 0 1 1 *'},
]
const DAYS_SHORT=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS_SHORT=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function parseCron(expr:string):string{
  const parts=expr.trim().split(/s+/)
  if(parts.length!==5)return 'Invalid expression (need 5 parts)'
  const [min,hour,dom,mon,dow]=parts
  const fmtNum=(v:string,unit:string):string=>{
    if(v==='*')return 'every '+unit
    if(v.startsWith('*/'))return 'every '+v.slice(2)+' '+unit+'s'
    if(v.includes('-'))return unit+' '+v.replace('-',' through ')
    if(v.includes(','))return unit+'s '+v
    return unit+' '+v
  }
  return ['At',fmtNum(min,'minute'),fmtNum(hour,'hour'),fmtNum(dom,'day of month'),fmtNum(mon,'month'),fmtNum(dow,'day of week')].join(', ')
}
export default function CronExpressionGeneratorPage() {
  const [expr,setExpr]=useState('0 9 * * 1-5')
  const [min,setMin]=useState('0')
  const [hour,setHour]=useState('9')
  const [dom,setDom]=useState('*')
  const [mon,setMon]=useState('*')
  const [dow,setDow]=useState('1-5')
  const [mode,setMode]=useState<'visual'|'manual'>('visual')
  const visualExpr=min+' '+hour+' '+dom+' '+mon+' '+dow
  const activeExpr=mode==='visual'?visualExpr:expr
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(activeExpr);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const Field=({label,val,set,ph}:{label:string;val:string;set:(v:string)=>void;ph:string})=>(
    <div><label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} className="w-full rounded border border-gray-300 px-2 py-1.5 font-mono text-sm text-center"/></div>
  )
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{const pts=p.expr.split(' ');if(mode==='visual'){setMin(pts[0]);setHour(pts[1]);setDom(pts[2]);setMon(pts[3]);setDow(pts[4])}else setExpr(p.expr)}}
              className="px-2.5 py-1 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{p.label}</button>
          ))}
        </div>
        <div className="flex rounded overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('visual')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='visual'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Visual Builder</button>
          <button onClick={()=>setMode('manual')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='manual'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Manual</button>
        </div>
        {mode==='visual'?(
          <div className="grid grid-cols-5 gap-2">
            <Field label="Minute" val={min} set={setMin} ph="0-59"/>
            <Field label="Hour" val={hour} set={setHour} ph="0-23"/>
            <Field label="Day" val={dom} set={setDom} ph="1-31"/>
            <Field label="Month" val={mon} set={setMon} ph="1-12"/>
            <Field label="Weekday" val={dow} set={setDow} ph="0-6"/>
          </div>
        ):(
          <input value={expr} onChange={e=>setExpr(e.target.value)} placeholder="* * * * *" className="w-full rounded border border-gray-300 px-3 py-2.5 font-mono text-xl text-center"/>
        )}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-sm font-mono font-bold text-blue-800 mb-1">{activeExpr}</p>
          <p className="text-sm text-blue-700">{parseCron(activeExpr)}</p>
        </div>
        <div className="flex justify-between items-center">
          <button onClick={copy} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{copied?'Copied!':'Copy Expression'}</button>
          <p className="text-xs text-gray-400">min hour dom month dow</p>
        </div>
      </div>
    </ToolLayout>
  )
}