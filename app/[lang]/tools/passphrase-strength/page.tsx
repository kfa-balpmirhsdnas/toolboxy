'use client'
import { useState } from 'react'

function checkStrength(p:string):{score:number;label:string;color:string;checks:{label:string;passed:boolean}[]}{
  const checks=[
    {label:'At least 8 characters',passed:p.length>=8},
    {label:'At least 12 characters',passed:p.length>=12},
    {label:'Uppercase letters (A-Z)',passed:/[A-Z]/.test(p)},
    {label:'Lowercase letters (a-z)',passed:/[a-z]/.test(p)},
    {label:'Numbers (0-9)',passed:/[0-9]/.test(p)},
    {label:'Special characters (!@#...)',passed:/[^A-Za-z0-9]/.test(p)},
    {label:'No common patterns',passed:!/(..)\1{2}|^(123|abc|qwerty|pass|admin)/i.test(p)},
  ]
  const score=checks.filter(c=>c.passed).length
  const label=score<=2?'Very Weak':score<=3?'Weak':score<=4?'Fair':score<=5?'Good':'Strong'
  const color=score<=2?'bg-red-500':score<=3?'bg-orange-400':score<=4?'bg-yellow-400':score<=5?'bg-blue-500':'bg-green-500'
  return{score,label,color,checks}
}

function entropyBits(p:string):number{
  let pool=0
  if(/[a-z]/.test(p)) pool+=26
  if(/[A-Z]/.test(p)) pool+=26
  if(/[0-9]/.test(p)) pool+=10
  if(/[^A-Za-z0-9]/.test(p)) pool+=32
  return pool>0?Math.floor(p.length*Math.log2(pool)):0
}

export default function PassphraseStrengthPage() {
  const [input,setInput]=useState('')
  const [show,setShow]=useState(false)

  const {score,label,color,checks}=checkStrength(input)
  const entropy=entropyBits(input)
  const pct=input.length===0?0:Math.min(100,(score/6)*100)

  const crackTime=entropy<28?'Instant':entropy<36?'Seconds':entropy<60?'Hours to Days':entropy<80?'Years':entropy<100?'Centuries':'Billions of years'

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Passphrase Strength Checker</h1>
        <p className="text-gray-500 mb-8">Check the strength of your passphrase — all analysis happens locally in your browser</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Passphrase</label>
            <div className="relative">
              <input type={show?'text':'password'} value={input} onChange={e=>setInput(e.target.value)} placeholder="Type your passphrase..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button onClick={()=>setShow(s=>!s)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs">{show?'Hide':'Show'}</button>
            </div>
          </div>
          {input&&(
            <>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-400">{input.length} chars</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div style={{width:pct+'%'}} className={'h-3 rounded-full transition-all '+color} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['Entropy',entropy+' bits'],['Crack Time (estimate)',crackTime]].map(([l,v])=>(
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <div className="font-bold text-gray-900 text-sm">{v}</div>
                    <div className="text-xs text-gray-500">{l}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Checklist</p>
                {checks.map(c=>(
                  <div key={c.label} className="flex items-center gap-2 text-sm">
                    <span className={c.passed?'text-green-500':'text-gray-300'}>{c.passed?'\u2713':'\u00D7'}</span>
                    <span className={c.passed?'text-gray-700':'text-gray-400'}>{c.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">\u{1F512} Your input never leaves your device — no data is sent to any server</p>
      </div>
    </main>
  )
}