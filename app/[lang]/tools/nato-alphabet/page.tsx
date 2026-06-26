'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('nato-alphabet')!
const NATO:Record<string,string>={A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliet',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-ray',Y:'Yankee',Z:'Zulu','0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine',' ':'(space)','.':', Decimal','-':'Dash'}
const PHONETIC_DIGITS:Record<string,string>={'0':'Nadazero','1':'Unaone','2':'Bissotwo','3':'Terrathree','4':'Kartefour','5':'Pantafive','6':'Soxisix','7':'Setteseven','8':'Oktoeight','9':'Novenine'}
export default function NatoAlphabetPage() {
  const t = useTranslations('toolui')
  const [input,setInput]=useState('Hello World')
  const [mode,setMode]=useState<'nato'|'icao'>('nato')
  const [showAll,setShowAll]=useState(false)
  const [copied,setCopied]=useState(false)
  const encode=(t:string)=>t.toUpperCase().split('').map(c=>{
    if(mode==='icao'&&PHONETIC_DIGITS[c])return PHONETIC_DIGITS[c]
    return NATO[c]||c
  })
  const words=encode(input)
  const result=words.join(' - ')
  const copy=()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),1200)}
  const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('nato')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='nato'?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>NATO</button>
          <button onClick={()=>setMode('icao')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='icao'?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>ICAO (digits)</button>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('nato_label')}</label>
          <input value={input} onChange={e=>setInput(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            placeholder={t('nato_ph')}/></div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-wrap gap-1.5">
            {input.toUpperCase().split('').map((c,i)=>(
              <div key={i} className="flex flex-col items-center bg-white rounded-lg px-2 py-1.5 border border-blue-100 text-center min-w-12">
                <span className="font-bold text-blue-700 text-sm">{c}</span>
                <span className="text-xs text-gray-600">{(mode==='icao'&&PHONETIC_DIGITS[c]?PHONETIC_DIGITS[c]:NATO[c])||c}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600 font-mono break-all">{result}</p>
            <button onClick={copy} className="flex-shrink-0 ml-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">{copied?t('ui_copied'):t('ui_copy')}</button>
          </div>
        </div>
        <div>
          <button onClick={()=>setShowAll(s=>!s)} className="text-sm text-blue-600 hover:underline">{showAll?t('ps_hide'):t('ps_show')} {t('nato_full')}</button>
          {showAll&&(
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {ALPHABET.split('').map(l=>(
                <div key={l} className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                  <span className="font-bold text-gray-800 w-5">{l}</span>
                  <span className="text-xs text-gray-600">{NATO[l]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}