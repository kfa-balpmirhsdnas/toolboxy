'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('number-to-words')!
const ONES=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
function belt100(n:number):string{
  if(n<20)return ONES[n]
  return TENS[Math.floor(n/10)]+(n%10?' '+ONES[n%10]:'')
}
function convert(n:number):string{
  if(n===0)return 'zero'
  if(n<0)return 'negative '+convert(-n)
  const CHUNKS=['','thousand','million','billion','trillion']
  const parts:string[]=[]
  let num=n
  for(let i=0;i<CHUNKS.length&&num>0;i++){
    const chunk=num%1000;num=Math.floor(num/1000)
    if(chunk===0)continue
    let str=''
    if(chunk>=100){str+=ONES[Math.floor(chunk/100)]+' hundred';if(chunk%100)str+=' '+belt100(chunk%100)}
    else str=belt100(chunk)
    parts.unshift(CHUNKS[i]?str+' '+CHUNKS[i]:str)
  }
  return parts.join(', ')
}
function toOrdinal(s:string):string{
  const end=s.split(' ').pop()||''
  const map:Record<string,string>={one:'first',two:'second',three:'third',four:'fourth',five:'fifth',six:'sixth',seven:'seventh',eight:'eighth',nine:'ninth',ten:'tenth',eleven:'eleventh',twelve:'twelfth',thirteen:'thirteenth'}
  const words=s.split(' ')
  const last=words[words.length-1]
  if(map[last])words[words.length-1]=map[last]
  else if(last.endsWith('y'))words[words.length-1]=last.slice(0,-1)+'ieth'
  else words[words.length-1]=last+'th'
  return words.join(' ')
}
export default function NumberToWordsPage() {
  const [input,setInput]=useState('1234567')
  const [mode,setMode]=useState<'cardinal'|'ordinal'|'currency'>('cardinal')
  const [currency,setCurrency]=useState('USD')
  const [copied,setCopied]=useState(false)
  const n=parseInt(input.replace(/,/g,''))
  const isValid=!isNaN(n)&&Math.abs(n)<=999999999999999
  const result=():string=>{
    if(!isValid)return 'Enter a valid integer (up to 999 trillion)'
    if(mode==='cardinal')return convert(n)
    if(mode==='ordinal')return toOrdinal(convert(n))
    const dollars=Math.floor(Math.abs(n))
    const r=currency==='USD'?convert(dollars)+' dollar'+(dollars!==1?'s':'')
      :currency==='EUR'?convert(dollars)+' euro'+(dollars!==1?'s':'')
      :currency==='GBP'?convert(dollars)+' pound'+(dollars!==1?'s':'')
      :convert(dollars)+' yen'
    return (n<0?'negative ':'')+r
  }
  const output=result()
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. 1234567" className="w-full rounded border border-gray-300 px-3 py-3 text-2xl font-mono"/></div>
        <div className="flex gap-2">
          {([['cardinal','Cardinal'],['ordinal','Ordinal'],['currency','Currency']] as const).map(([id,label])=>(
            <button key={id} onClick={()=>setMode(id)}
              className={'flex-1 py-2 rounded-lg border text-sm font-medium transition '+(mode===id?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{label}</button>
          ))}
        </div>
        {mode==='currency'&&(
          <div className="flex gap-2">
            {['USD','EUR','GBP','JPY'].map(c=>(
              <button key={c} onClick={()=>setCurrency(c)}
                className={'flex-1 py-1.5 rounded border text-xs font-mono font-medium transition '+(currency===c?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{c}</button>
            ))}
          </div>
        )}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-blue-500 font-medium">Result</span>
            <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
          </div>
          <p className="text-blue-800 font-medium capitalize leading-relaxed">{isValid?output:<span className="text-red-500 font-normal">{output}</span>}</p>
        </div>
        {isValid&&<div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Formatted:</span><p className="font-mono font-medium mt-0.5">{n.toLocaleString()}</p></div>
          <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Scientific:</span><p className="font-mono font-medium mt-0.5">{n.toExponential(2)}</p></div>
          <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Hex:</span><p className="font-mono font-medium mt-0.5">{n.toString(16).toUpperCase()}</p></div>
          <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Binary:</span><p className="font-mono font-medium mt-0.5 truncate">{n.toString(2)}</p></div>
        </div>}
      </div>
    </ToolLayout>
  )
}