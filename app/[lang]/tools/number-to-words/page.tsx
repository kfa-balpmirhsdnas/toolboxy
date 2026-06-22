'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('number-to-words')!
const ones=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
function toWords(n:number):string{
  if(n===0)return 'zero'
  if(n<0)return 'negative '+toWords(-n)
  if(n<20)return ones[n]
  if(n<100)return tens[Math.floor(n/10)]+(n%10?'-'+ones[n%10]:'')
  if(n<1000)return ones[Math.floor(n/100)]+' hundred'+(n%100?' '+toWords(n%100):'')
  if(n<1000000)return toWords(Math.floor(n/1000))+' thousand'+(n%1000?' '+toWords(n%1000):'')
  if(n<1000000000)return toWords(Math.floor(n/1000000))+' million'+(n%1000000?' '+toWords(n%1000000):'')
  if(n<1000000000000)return toWords(Math.floor(n/1000000000))+' billion'+(n%1000000000?' '+toWords(n%1000000000):'')
  return toWords(Math.floor(n/1000000000000))+' trillion'+(n%1000000000000?' '+toWords(n%1000000000000):'')
}
function toOrdinal(n:number):string{
  const w=toWords(n)
  const suffixes:{[k:string]:string}={one:'first',two:'second',three:'third',five:'fifth',eight:'eighth',nine:'ninth',twelve:'twelfth'}
  const last=w.split(/[-\s]/).pop()||''
  if(suffixes[last])return w.slice(0,w.length-last.length)+suffixes[last]
  if(last.endsWith('y'))return w.slice(0,-1)+'ieth'
  return w+'th'
}
export default function NumberToWordsPage() {
  const [num,setNum]=useState('42')
  const n=parseInt(num)
  const valid=!isNaN(n)&&n>=-999999999999&&n<=999999999999
  const words=valid?toWords(n):''
  const ordinal=valid&&n>0?toOrdinal(n):''
  const [copied,setCopied]=useState('')
  const copy=(val:string,k:string)=>{navigator.clipboard.writeText(val);setCopied(k);setTimeout(()=>setCopied(''),1500)}
  const EXAMPLES=[0,1,13,42,100,1000,1000000,1000000000]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enter a number</label>
          <input type="number" value={num} onChange={e=>setNum(e.target.value)}
            min="-999999999999" max="999999999999" className="w-full rounded border border-gray-300 px-3 py-2 text-xl font-mono"/>
        </div>
        {valid&&words&&(
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-blue-500 font-medium mb-1">Cardinal</p>
                  <p className="text-lg font-semibold text-blue-900 capitalize">{words}</p>
                </div>
                <button onClick={()=>copy(words,'card')} className="text-xs text-blue-500 hover:underline flex-shrink-0">{copied==='card'?'Copied!':'Copy'}</button>
              </div>
            </div>
            {ordinal&&(
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-purple-500 font-medium mb-1">Ordinal</p>
                    <p className="text-lg font-semibold text-purple-900 capitalize">{ordinal}</p>
                  </div>
                  <button onClick={()=>copy(ordinal,'ord')} className="text-xs text-purple-500 hover:underline flex-shrink-0">{copied==='ord'?'Copied!':'Copy'}</button>
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500 mb-2">Quick examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(e=>(
              <button key={e} onClick={()=>setNum(String(e))}
                className="px-3 py-1 rounded border border-gray-200 text-sm hover:bg-gray-50 font-mono">{e.toLocaleString()}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}