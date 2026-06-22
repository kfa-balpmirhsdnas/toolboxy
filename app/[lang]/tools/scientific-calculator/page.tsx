'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'


const tool = getToolBySlug('scientific-calculator')!

export default function ScientificCalculatorPage() {
  const [display, setDisplay] = useState('0')
  const [expr, setExpr] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [isError, setIsError] = useState(false)
  const [isDeg, setIsDeg] = useState(true)

  function toRad(x:number):number{ return isDeg?x*(Math.PI/180):x }

  function press(val:string){
    setIsError(false)
    if(val==='C'){setDisplay('0');setExpr('');return}
    if(val==='\u232B'){setDisplay(d=>d.length>1?d.slice(0,-1):'0');return}
    if(val==='='){
      try{
        const e=expr+display
        const r=Function('x',`'use strict';const M=Math;return ${e}`)('x')
        const rs=String(parseFloat(r.toFixed(10)))
        setHistory(h=>[e+' = '+rs,...h].slice(0,10))
        setExpr('')
        setDisplay(rs)
      }catch{setIsError(true);setDisplay('Error')}
      return
    }
    if(['+','-','*','/','^'].includes(val)){setExpr(e=>e+display+val);setDisplay('0');return}
    // scientific fns
    const d=parseFloat(display)
    const fns:Record<string,number>={
      sin:Math.sin(toRad(d)),cos:Math.cos(toRad(d)),tan:Math.tan(toRad(d)),
      asin:isDeg?Math.asin(d)*(180/Math.PI):Math.asin(d),
      acos:isDeg?Math.acos(d)*(180/Math.PI):Math.acos(d),
      atan:isDeg?Math.atan(d)*(180/Math.PI):Math.atan(d),
      sqrt:Math.sqrt(d),'x\u00B2':d*d,'x\u00B3':d*d*d,
      log:Math.log10(d),ln:Math.log(d),'e^x':Math.exp(d),'10^x':Math.pow(10,d),
      '1/x':1/d,'|x|':Math.abs(d),'\u03C0':Math.PI,'e':Math.E,'n!':factorial(d),
    }
    if(val in fns){setDisplay(String(parseFloat(fns[val].toFixed(10))));return}
    // digits
    if(val==='.'){setDisplay(d=>d.includes('.')?d:d+'.'); return}
    setDisplay(d=>d==='0'?val:d+val)
  }

  function factorial(n:number):number{ if(n<=1)return 1;return n*factorial(n-1) }

  const ROW1=['sin','cos','tan','\u03C0']
  const ROW2=['asin','acos','atan','e']
  const ROW3=['sqrt','x\u00B2','log','ln']
  const ROW4=['n!','1/x','|x|','e^x']
  const NUM=[['7','8','9','\u232B'],['4','5','6','*'],['1','2','3','-'],['0','.','=','+']]

  const btnBase='h-12 rounded-xl font-medium transition-colors text-sm active:scale-95'

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scientific Calculator</h1>
        <p className="text-gray-500 mb-6">Full scientific calculator with trig functions, logarithms, and history</p>
        <div className="bg-gray-900 rounded-2xl p-4 shadow-xl">
          <div className="bg-gray-800 rounded-xl p-3 mb-3 text-right min-h-[70px]">
            {expr&&<div className="text-gray-400 text-sm font-mono mb-1 truncate">{expr}</div>}
            <div className={'text-3xl font-mono font-bold '+(isError?'text-red-400':'text-white')}>{display}</div>
          </div>
          <div className="flex items-center justify-between mb-2 px-1">
            <button onClick={()=>setIsDeg(d=>!d)} className="text-xs px-3 py-1 rounded-lg bg-gray-700 text-gray-300">
              {isDeg?'DEG':'RAD'}
            </button>
            <button onClick={()=>press('C')} className="text-xs px-3 py-1 rounded-lg bg-red-700 text-white">AC</button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-1.5">
            {[...ROW1,...ROW2,...ROW3,...ROW4].map(k=>(
              <button key={k} onClick={()=>press(k)} className={btnBase+' bg-indigo-700 hover:bg-indigo-600 text-indigo-100'}>{k}</button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {NUM.flat().map(k=>(
              <button key={k+Math.random()} onClick={()=>press(k)}
                className={btnBase+' '+(k==='='?'bg-brand-500 hover:bg-brand-400 text-white':k==='+' ||k==='-'||k==='*'||k==='/'?'bg-gray-600 hover:bg-gray-500 text-white':k==='\u232B'?'bg-red-800 hover:bg-red-700 text-white':'bg-gray-700 hover:bg-gray-600 text-white')}>
                {k}
              </button>
            ))}
          </div>
        </div>
        {history.length>0&&(
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">History</span>
              <button onClick={()=>setHistory([])} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
            </div>
            <div className="space-y-1">
              {history.map((h,i)=>(<div key={i} className="font-mono text-sm text-gray-600">{h}</div>))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}