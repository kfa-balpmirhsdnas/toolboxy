'use client'
import { useState } from 'react'

function gcd(a:number,b:number):number{return b===0?a:gcd(b,a%b)}
function simplify(n:number,d:number):{n:number,d:number}{const g=gcd(Math.abs(n),Math.abs(d));const sign=d<0?-1:1;return{n:sign*n/g,d:sign*d/g}}

type Frac={n:string,d:string}

function calc(a:Frac,b:Frac,op:string):{n:number,d:number}|string{
  const an=parseInt(a.n||'0'),ad=parseInt(a.d||'1'),bn=parseInt(b.n||'0'),bd=parseInt(b.d||'1')
  if(isNaN(an)||isNaN(ad)||isNaN(bn)||isNaN(bd)) return 'Invalid input'
  if(ad===0||bd===0) return 'Denominator cannot be zero'
  if(op==='\u00F7'&&bn===0) return 'Division by zero'
  if(op==='+') return simplify(an*bd+bn*ad,ad*bd)
  if(op==='-') return simplify(an*bd-bn*ad,ad*bd)
  if(op==='\u00D7') return simplify(an*bn,ad*bd)
  if(op==='\u00F7') return simplify(an*bd,ad*bn)
  return 'Unknown op'
}

export default function FractionCalculatorPage() {
  const [a,setA]=useState<Frac>({n:'1',d:'2'})
  const [b,setB]=useState<Frac>({n:'1',d:'3'})
  const [op,setOp]=useState('+')

  const result=calc(a,b,op)
  const isNum=typeof result!=='string'

  function FracInput({val,onChange}:{val:Frac,onChange:(f:Frac)=>void}){
    return(
      <div className="flex flex-col items-center">
        <input type="text" value={val.n} onChange={e=>onChange({...val,n:e.target.value})}
          className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <div className="w-16 h-0.5 bg-gray-400 my-1" />
        <input type="text" value={val.d} onChange={e=>onChange({...val,d:e.target.value})}
          className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fraction Calculator</h1>
        <p className="text-gray-500 mb-8">Add, subtract, multiply, and divide fractions with automatic simplification</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <FracInput val={a} onChange={setA} />
            <div className="flex gap-2">
              {['+','-','\u00D7','\u00F7'].map(o=>(
                <button key={o} onClick={()=>setOp(o)}
                  className={'w-10 h-10 rounded-xl text-xl font-bold transition-colors '+(op===o?'bg-brand-500 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                  {o}
                </button>
              ))}
            </div>
            <FracInput val={b} onChange={setB} />
            <span className="text-2xl text-gray-400">=</span>
            {isNum?(
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-brand-700">{result.n}</span>
                <div className="w-12 h-0.5 bg-brand-400 my-1" />
                <span className="text-2xl font-bold font-mono text-brand-700">{result.d}</span>
              </div>
            ):(
              <span className="text-red-500 text-sm">{result as string}</span>
            )}
          </div>
          {isNum&&(
            <div className="mt-6 grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Decimal</div>
                <div className="font-mono font-semibold text-gray-800">{(result.n/result.d).toFixed(8).replace(/\.?0+$/,'')}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Mixed number</div>
                <div className="font-mono font-semibold text-gray-800">
                  {Math.abs(result.n)>=Math.abs(result.d)?
                    (result.n<0?'-':'')+(Math.abs(Math.floor(result.n/result.d))>0?Math.abs(Math.floor(result.n/result.d))+' ':'')+
                    (Math.abs(result.n)%Math.abs(result.d)>0?Math.abs(result.n)%Math.abs(result.d)+'/'+Math.abs(result.d):'')||'0'
                  :result.n+'/'+result.d}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}