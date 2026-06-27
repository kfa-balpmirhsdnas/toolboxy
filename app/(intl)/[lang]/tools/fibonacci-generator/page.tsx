'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('fibonacci-generator')!
function getFib(n:number):bigint[]{
  if(n<=0)return[]
  const seq:bigint[]=[BigInt(0)]
  if(n===1)return seq
  seq.push(BigInt(1))
  for(let i=2;i<n;i++)seq.push(seq[i-1]+seq[i-2])
  return seq
}
export default function FibonacciGeneratorPage() {
  const t = useTranslations('toolui')
  const [count,setCount]=useState(20)
  const [startIdx,setStartIdx]=useState(0)
  const [mode,setMode]=useState<'list'|'find'>('list')
  const [findN,setFindN]=useState(144)
  const seq=getFib(Math.min(count+startIdx,200)).slice(startIdx)
  const [copied,setCopied]=useState(false)
  const copy=()=>{navigator.clipboard.writeText(seq.map(String).join(', '));setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const checkFib=(n:number):boolean=>{
    const isFib=(x:number):boolean=>{const s=Math.sqrt(x);return Number.isInteger(s)}
    return isFib(5*n*n+4)||isFib(5*n*n-4)
  }
  const factors=(n:number):number[]=>{
    const f:number[]=[]
    for(let i=1;i<=Math.sqrt(n);i++){if(n%i===0){f.push(i);if(i!==n/i)f.push(n/i)}}
    return f.sort((a,b)=>a-b)
  }
  const goldenRatio=seq.length>1?parseFloat((Number(seq[seq.length-1])/Number(seq[seq.length-2])).toFixed(8)).toString():''
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('list')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='list'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('fib_gen')}</button>
          <button onClick={()=>setMode('find')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='find'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>{t('fib_check')}</button>
        </div>
        {mode==='list'?(
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-500 mb-1">{t('fib_count')}</label>
                <input type="number" value={count} onChange={e=>setCount(Math.min(200,Math.max(1,Number(e.target.value))))} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-center"/></div>
              <div><label className="block text-xs text-gray-500 mb-1">{t('fib_start')}</label>
                <input type="number" value={startIdx} onChange={e=>setStartIdx(Math.max(0,Number(e.target.value)))} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-center"/></div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">{t('fib_showing',{a:startIdx,b:startIdx+seq.length-1})}</p>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?t('ui_copied'):t('fib_copyall')}</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 max-h-60 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {seq.map((n,i)=>(
                  <span key={i} className="font-mono text-sm bg-white border border-gray-200 rounded px-1.5 py-0.5">{String(n)}</span>
                ))}
              </div>
            </div>
            {goldenRatio&&<p className="text-xs text-gray-500 text-center">{t('fib_golden')}: <span className="font-mono text-blue-600">{goldenRatio}</span> {t('fib_converges')}</p>}
          </div>
        ):(
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('fib_enter')}</label>
              <input type="number" value={findN} onChange={e=>setFindN(Number(e.target.value))} className="w-full rounded border border-gray-300 px-3 py-3 text-xl font-mono text-center" min="0"/></div>
            <div className={'text-center p-6 rounded-xl '+(checkFib(findN)?'bg-green-50 border-2 border-green-300':'bg-red-50 border-2 border-red-200')}>
              <p className="text-3xl font-bold mb-1" style={{color:checkFib(findN)?'#16a34a':'#dc2626'}}>{checkFib(findN)?t('fib_yes'):t('fib_no')}</p>
              <p className="text-sm" style={{color:checkFib(findN)?'#15803d':'#b91c1c'}}>{findN}{checkFib(findN)?t('fib_is'):t('fib_isnot')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">{t('fib_factors',{n:findN})}</p>
              <div className="flex flex-wrap gap-1.5">
                {factors(findN).map(f=>(
                  <span key={f} className={'font-mono text-xs px-2 py-1 rounded '+(checkFib(f)?'bg-green-100 text-green-700 border border-green-200':'bg-gray-100 text-gray-700')}>{f}{checkFib(f)?'*':''}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{t('fib_also')}</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}