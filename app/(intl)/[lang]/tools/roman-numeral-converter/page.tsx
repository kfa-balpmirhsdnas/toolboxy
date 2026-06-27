'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('roman-numeral-converter')!
const MAP:Array<[number,string]>=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]
function toRoman(n:number,oorMsg='Out of range (1–3999)'):string{
  if(n<1||n>3999)return oorMsg
  let r='',num=n
  for(const [v,s]of MAP){while(num>=v){r+=s;num-=v}}
  return r
}
function fromRoman(s:string):number|null{
  const val:Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000}
  const u=s.toUpperCase().replace(/[^IVXLCDM]/g,'')
  let n=0
  for(let i=0;i<u.length;i++){
    const cur=val[u[i]],next=val[u[i+1]]
    if(next>cur){n+=next-cur;i++}else n+=cur
  }
  return n||null
}
const EXAMPLES=[1,4,9,14,40,90,399,400,500,900,1000,1444,1999,2024,3999]
export default function RomanNumeralConverterPage() {
  const t = useTranslations('toolui')
  const [mode,setMode]=useState<'to'|'from'>('to')
  const [numInput,setNumInput]=useState('2024')
  const [romInput,setRomInput]=useState('MMXXIV')
  const numVal=parseInt(numInput)||0
  const toResult=toRoman(numVal,t('rnc_outofrange'))
  const fromResult=fromRoman(romInput)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('to')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='to'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('rnc_n2r')}</button>
          <button onClick={()=>setMode('from')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='from'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('rnc_r2n')}</button>
        </div>
        {mode==='to'?(
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('rnc_integer')}</label>
              <input type="number" value={numInput} onChange={e=>setNumInput(e.target.value)} min="1" max="3999"
                className="w-full rounded border border-gray-300 px-3 py-3 text-2xl font-mono text-center"/></div>
            <div className="text-center bg-amber-50 rounded-xl py-5 border border-amber-100">
              <p className="text-xs text-amber-600 mb-1">{t('rnc_roman')}</p>
              <p className="text-4xl font-bold text-amber-800 font-serif tracking-widest">{toResult}</p>
            </div>
          </div>
        ):(
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('rnc_roman')}</label>
              <input value={romInput} onChange={e=>setRomInput(e.target.value.toUpperCase())} maxLength={15}
                className="w-full rounded border border-gray-300 px-3 py-3 text-2xl font-mono text-center tracking-widest uppercase" placeholder="MMXXIV"/></div>
            <div className="text-center bg-blue-50 rounded-xl py-5 border border-blue-100">
              <p className="text-xs text-blue-600 mb-1">{t('rnc_integerres')}</p>
              <p className="text-4xl font-bold text-blue-800 font-mono">{fromResult??t('jsv_invalid')}</p>
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">{t('rnc_examples')}</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map(n=>(
              <button key={n} onClick={()=>{if(mode==='to')setNumInput(String(n));else setRomInput(toRoman(n))}}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 font-mono">
                {n} = {toRoman(n)}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-0.5">
          <p className="font-medium text-gray-700 mb-1">{t('rnc_reference')}</p>
          {MAP.map(([v,s])=><p key={s} className="flex gap-2 font-mono"><span className="w-6">{s}</span><span>=</span><span>{v}</span></p>)}
        </div>
      </div>
    </ToolLayout>
  )
}