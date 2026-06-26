'use client'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('regex-tester')!
const PRESETS=[{label:'Email',pattern:'[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',flags:'g'},{label:'URL',pattern:'https?:\/\/[^\\s]+',flags:'g'},{label:'IPv4',pattern:'\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',flags:'g'},{label:'Phone',pattern:'[+]?[(]?\\d{3}[)]?[-\\s.]?\\d{3}[-\\s.]?\\d{4}',flags:'g'},{label:'Date (YYYY-MM-DD)',pattern:'\\d{4}-\\d{2}-\\d{2}',flags:'g'},{label:'Hex color',pattern:'#[0-9a-fA-F]{3,6}\\b',flags:'g'},{label:'HTML tags',pattern:'<[^>]+>',flags:'g'},{label:'Numbers',pattern:'\\d+\\.?\\d*',flags:'g'}]
export default function RegexTesterPage() {
  const t = useTranslations('toolui')
  const [pattern,setPattern]=useState('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}')
  const [flags,setFlags]=useState('g')
  const [text,setText]=useState('Contact us at hello@example.com or support@toolboxy.net for assistance. Invalid: not-an-email, also@, @nodomain')
  const [replace,setReplace]=useState('')
  const [showReplace,setShowReplace]=useState(false)
  const result=useMemo(()=>{
    if(!pattern)return{matches:[],error:'',replaced:text,count:0}
    try{
      const re=new RegExp(pattern,flags)
      const matches:Array<{match:string;index:number;groups:string[]}>=[],allM=[]
      let m
      if(flags.includes('g')){const iter=text.matchAll(re);for(const match of iter){matches.push({match:match[0],index:match.index||0,groups:Array.from(match).slice(1)})}}
      else{const single=text.match(re);if(single)matches.push({match:single[0],index:single.index||0,groups:Array.from(single).slice(1)})}
      const replaced=showReplace?text.replace(re,replace):text
      return{matches,error:'',replaced,count:matches.length}
    }catch(e){return{matches:[],error:String(e),replaced:text,count:0}}
  },[pattern,flags,text,replace,showReplace])
  const highlight=()=>{
    if(!pattern||result.error)return text
    try{
      const re=new RegExp(pattern,'g'+flags.replace('g',''))
      let last=0,out=''
      for(const m of result.matches){
        out+=text.slice(last,m.index).replace(/&/g,'&amp;').replace(/</g,'&lt;')
        out+='<mark class="bg-yellow-200 rounded px-0.5">'+text.slice(m.index,m.index+m.match.length).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</mark>'
        last=m.index+m.match.length
      }
      out+=text.slice(last).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      return out
    }catch{return text}
  }
  const FLAG_LIST=['g','i','m','s']
  const toggleFlag=(f:string)=>setFlags(fl=>fl.includes(f)?fl.replace(f,''):fl+f)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('rx_pattern')}</label>
          <div className="flex gap-2">
            <div className={'flex-1 flex items-center rounded-xl border px-3 '+(result.error?'border-red-300':'border-gray-300')}>
              <span className="text-gray-400 font-mono mr-1">/</span>
              <input value={pattern} onChange={e=>setPattern(e.target.value)} className="flex-1 py-2.5 font-mono text-sm bg-transparent focus:outline-none" placeholder="regex pattern"/>
              <span className="text-gray-400 font-mono ml-1">/</span>
              <span className="text-blue-600 font-mono text-sm ml-1">{flags}</span>
            </div>
            <div className="flex gap-1">
              {FLAG_LIST.map(f=>(
                <button key={f} onClick={()=>toggleFlag(f)}
                  className={'w-9 h-9 rounded-lg border font-mono text-sm font-bold transition '+(flags.includes(f)?'bg-blue-600 text-white border-blue-600':'border-gray-300 text-gray-600 hover:bg-gray-50')}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {result.error&&<p className="text-red-500 text-xs mt-1">{result.error}</p>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{setPattern(p.pattern);setFlags(p.flags)}}
              className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600">{p.label}</button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('rx_test')}</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"/>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs font-medium text-amber-700 mb-2">{t('rx_highlight')}</p>
          <p className="font-mono text-sm leading-relaxed" dangerouslySetInnerHTML={{__html:highlight()}}/>
        </div>
        <div className="flex items-center gap-3">
          <div className={'px-4 py-2 rounded-lg text-sm font-bold '+(result.count>0?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500')}>
            {result.count} {t('rx_matches')}
          </div>
          {result.matches.length>0&&(
            <div className="flex flex-wrap gap-1.5">
              {result.matches.slice(0,8).map((m,i)=>(
                <span key={i} className="px-2 py-0.5 bg-yellow-100 rounded font-mono text-xs text-yellow-800">"{m.match}"</span>
              ))}
              {result.matches.length>8&&<span className="text-xs text-gray-400">+{result.matches.length-8} {t('rx_more')}</span>}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}