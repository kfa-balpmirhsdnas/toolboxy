'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('cron-expression-generator')!
const PRESETS=[
  {k:'0',expr:'* * * * *'},
  {k:'1',expr:'*/5 * * * *'},
  {k:'2',expr:'*/15 * * * *'},
  {k:'3',expr:'*/30 * * * *'},
  {k:'4',expr:'0 * * * *'},
  {k:'5',expr:'0 0 * * *'},
  {k:'6',expr:'0 12 * * *'},
  {k:'7',expr:'0 0 * * 0'},
  {k:'8',expr:'0 9 * * 1-5'},
  {k:'9',expr:'0 0 1 * *'},
  {k:'10',expr:'0 0 1 1 *'},
]
function parseCron(expr:string,t:(k:string)=>string):string{
  const parts=expr.trim().split(/\s+/)
  if(parts.length!==5)return t('cr_invalid')
  const [min,hour,dom,mon,dow]=parts
  const fmtNum=(v:string,unit:string):string=>{
    if(v==='*')return t('cr_every')+' '+unit
    if(v.startsWith('*/'))return t('cr_every')+' '+v.slice(2)+' '+unit
    if(v.includes('-'))return unit+' '+v.replace('-',' '+t('cr_through')+' ')
    return unit+' '+v
  }
  return [fmtNum(min,t('cr_u_minute')),fmtNum(hour,t('cr_u_hour')),fmtNum(dom,t('cr_u_dom')),fmtNum(mon,t('cr_u_month')),fmtNum(dow,t('cr_u_dow'))].join(', ')
}
export default function CronExpressionGeneratorPage() {
  const t = useTranslations('toolui')
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
            <button key={p.k} onClick={()=>{const pts=p.expr.split(' ');if(mode==='visual'){setMin(pts[0]);setHour(pts[1]);setDom(pts[2]);setMon(pts[3]);setDow(pts[4])}else setExpr(p.expr)}}
              className="px-2.5 py-1 rounded-full border border-gray-200 text-xs hover:bg-gray-50">{t('cr_p_'+p.k)}</button>
          ))}
        </div>
        <div className="flex rounded overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('visual')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='visual'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('cr_visual')}</button>
          <button onClick={()=>setMode('manual')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='manual'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('cr_manual')}</button>
        </div>
        {mode==='visual'?(
          <div className="grid grid-cols-5 gap-2">
            <Field label={t('cr_min')} val={min} set={setMin} ph="0-59"/>
            <Field label={t('cr_hour')} val={hour} set={setHour} ph="0-23"/>
            <Field label={t('cr_day')} val={dom} set={setDom} ph="1-31"/>
            <Field label={t('cr_month')} val={mon} set={setMon} ph="1-12"/>
            <Field label={t('cr_weekday')} val={dow} set={setDow} ph="0-6"/>
          </div>
        ):(
          <input value={expr} onChange={e=>setExpr(e.target.value)} placeholder="* * * * *" className="w-full rounded border border-gray-300 px-3 py-2.5 font-mono text-xl text-center"/>
        )}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-sm font-mono font-bold text-blue-800 mb-1">{activeExpr}</p>
          <p className="text-sm text-blue-700">{parseCron(activeExpr,t)}</p>
        </div>
        <div className="flex justify-between items-center">
          <button onClick={copy} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{copied?t('ui_copied'):t('cr_copy_expr')}</button>
          <p className="text-xs text-gray-400">min hour dom month dow</p>
        </div>
      </div>
    </ToolLayout>
  )
}