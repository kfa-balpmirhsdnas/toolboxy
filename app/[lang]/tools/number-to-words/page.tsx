'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('number-to-words')!
const ones=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
function chunk(n:number):string{
  if(n===0)return''
  const h=Math.floor(n/100),t=Math.floor((n%100)/10),o=n%10,tt=n%100
  let s=''
  if(h>0)s+=ones[h]+' hundred '
  if(tt<20)s+=ones[tt]
  else s+=tens[t]+(o>0?' '+ones[o]:'')
  return s.trim()
}
function numToWords(n:number):string{
  if(n===0)return'zero'
  const neg=n<0
  let abs=Math.abs(n)
  const parts:string[]=[]
  const scales=['','thousand','million','billion','trillion']
  for(let i=0;i<scales.length;i++){
    const c=abs%1000;abs=Math.floor(abs/1000)
    if(c>0)parts.unshift(chunk(c)+(scales[i]?' '+scales[i]:''))
    if(abs===0)break
  }
  return(neg?'negative ':'')+parts.join(', ')
}
function toOrdinal(n:number):string{
  const w=numToWords(n),last=w.split(' ').pop()||''
  const ordMap:Record<string,string>={one:'first',two:'second',three:'third',four:'fourth',five:'fifth',eight:'eighth',nine:'ninth',twelve:'twelfth'}
  const ord=ordMap[last]||(last.endsWith('y')?last.slice(0,-1)+'ieth':last+'th')
  return w.slice(0,w.length-last.length)+ord
}
export default function NumberToWordsPage() {
  const t = useTranslations('toolui')
  const [input,setInput]=useState('1234567')
  const [copied,setCopied]=useState('')
  const n=parseInt(input.replace(/,/g,''))
  const valid=!isNaN(n)&&Math.abs(n)<=999999999999999
  const words=valid?numToWords(n):''
  const ordinal=valid&&n>0?toOrdinal(n):''
  const copy=(v:string)=>{navigator.clipboard.writeText(v);setCopied(v);setTimeout(()=>setCopied(''),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('nf_number')}</label>
          <input value={input} onChange={e=>setInput(e.target.value)}
            className={'w-full rounded-xl border px-3 py-3 font-mono text-2xl text-center font-bold focus:outline-none '+(valid||!input?'border-gray-300 focus:border-blue-400':'border-red-300 bg-red-50')}
            placeholder={t('ntw_ph')}/>
          {!valid&&input&&<p className="text-red-500 text-xs mt-1">{t('ntw_invalid')}</p>}
        </div>
        {valid&&(
          <>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="text-xs font-medium text-gray-500 mb-1">{t('ntw_cardinal')}</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{words}</p></div>
                  <button onClick={()=>copy(words)} className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-700">{copied===words?'✓ '+t('ui_copied'):t('ui_copy')}</button>
                </div>
              </div>
              {ordinal&&<div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="text-xs font-medium text-gray-500 mb-1">{t('ntw_ordinal')}</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{ordinal}</p></div>
                  <button onClick={()=>copy(ordinal)} className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-700">{copied===ordinal?'✓ '+t('ui_copied'):t('ui_copy')}</button>
                </div>
              </div>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[-1,0,12,100,1000,1000000].map(ex=>(
                <button key={ex} onClick={()=>setInput(ex.toString())}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-left">
                  <span className="font-mono">{ex.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}