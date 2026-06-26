'use client'
import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('calculator')!
export default function CalculatorPage() {
  const t = useTranslations('toolui')
  const [display,setDisplay]=useState('0')
  const [expr,setExpr]=useState('')
  const [newNum,setNewNum]=useState(true)
  const [history,setHistory]=useState<string[]>([])
  const press=useCallback((key:string)=>{
    if(key>='0'&&key<='9'||key==='.'){
      if(newNum){setDisplay(key==='.'?'0.':key);setNewNum(false)}
      else setDisplay(d=>d==='0'&&key!=='.'?key:d.includes('.')&&key==='.'?d:d+key)
    }else if(key==='C'){setDisplay('0');setExpr('');setNewNum(true)
    }else if(key==='CE'){setDisplay('0');setNewNum(true)
    }else if(key==='+/-'){setDisplay(d=>d.startsWith('-')?d.slice(1):d==='0'?d:'-'+d)
    }else if(key==='%'){setDisplay(d=>String(parseFloat(d)/100));setNewNum(true)
    }else if(['+','-','x','divide'].includes(key)){
      const op=key==='x'?'*':key==='divide'?'/':key
      setExpr(display+' '+op+' ')
      setNewNum(true)
    }else if(key==='='){
      try{
        const full=expr+display
        const res=Function('"use strict";return ('+full.replace(/x/g,'*').replace(/divide/g,'/')+')')()
        const rounded=parseFloat(res.toFixed(10)).toString()
        setHistory(h=>[full+' = '+rounded,...h.slice(0,9)])
        setDisplay(rounded)
        setExpr('')
        setNewNum(true)
      }catch{setDisplay(t('ca_error'));setNewNum(true)}
    }else if(key==='sqrt'){
      const n=parseFloat(display)
      setDisplay(n>=0?parseFloat(Math.sqrt(n).toFixed(10)).toString():t('ca_error'))
      setNewNum(true)
    }else if(key==='1/x'){
      const n=parseFloat(display)
      setDisplay(n!==0?parseFloat((1/n).toFixed(10)).toString():t('ca_error'))
      setNewNum(true)
    }else if(key==='x2'){
      setDisplay(parseFloat((parseFloat(display)**2).toFixed(10)).toString())
      setNewNum(true)
    }
  },[display,expr,newNum])
  const ROWS=[
    ['%','CE','C','divide'],
    ['1/x','x2','sqrt','x'],
    ['7','8','9','-'],
    ['4','5','6','+'],
    ['1','2','3','='],
    ['+/-','0','.','='],
  ]
  const labels:Record<string,string>={'divide':'÷','x':'×','sqrt':'√','x2':'x²','1/x':'¹/x','+/-':'±'}
  const isOp=(k:string)=>['divide','x','+','-'].includes(k)
  const isEq=(k:string)=>k==='='
  const isSpecial=(k:string)=>['%','CE','C','sqrt','x2','1/x'].includes(k)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-sm mx-auto px-4 space-y-4">
        <div className="bg-gray-900 rounded-2xl p-4 space-y-2">
          <p className="text-gray-400 text-sm font-mono min-h-5 text-right">{expr}</p>
          <p className="text-white text-4xl font-bold font-mono text-right truncate">{display}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ROWS.slice(0,1)[0].map(k=>(
            <button key={k} onClick={()=>press(k)}
              className="py-4 rounded-xl font-semibold text-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition">
              {labels[k]||k}
            </button>
          ))}
          {ROWS.slice(1,2)[0].map(k=>(
            <button key={k} onClick={()=>press(k)}
              className="py-4 rounded-xl font-semibold text-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition">
              {labels[k]||k}
            </button>
          ))}
          {[['7','8','9','-'],['4','5','6','+'],['+/-','1','2','3'],['0','.']].map((row,ri)=>
            row.map(k=>(
              <button key={ri+k} onClick={()=>press(k)}
                className={'py-4 rounded-xl font-semibold text-lg active:scale-95 transition '+(isOp(k)?'bg-amber-400 text-white hover:bg-amber-500':isEq(k)?'bg-blue-600 text-white hover:bg-blue-700':'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50')}>
                {labels[k]||k}
              </button>
            ))
          )}
          <button onClick={()=>press('=')}
            className="col-span-2 py-4 rounded-xl font-semibold text-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition">=</button>
        </div>
        {history.length>0&&(
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">{t('ca_history')}</p>
            {history.map((h,i)=><p key={i} className="text-xs font-mono text-gray-600 py-0.5 border-b border-gray-100 last:border-0">{h}</p>)}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}