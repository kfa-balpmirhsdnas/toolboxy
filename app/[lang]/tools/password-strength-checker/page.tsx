'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('password-strength-checker')!
function checkStrength(pw:string):{score:number;label:string;color:string;checks:{label:string;ok:boolean}[]}{
  const checks=[
    {label:'At least 8 characters',ok:pw.length>=8},
    {label:'At least 12 characters',ok:pw.length>=12},
    {label:'Uppercase letters (A-Z)',ok:/[A-Z]/.test(pw)},
    {label:'Lowercase letters (a-z)',ok:/[a-z]/.test(pw)},
    {label:'Numbers (0-9)',ok:/[0-9]/.test(pw)},
    {label:'Special characters (!@#...)',ok:/[^a-zA-Z0-9]/.test(pw)},
    {label:'No common patterns',ok:!/^(password|123456|qwerty|abc123)/i.test(pw)},
  ]
  const score=checks.filter(c=>c.ok).length
  const label=score<=2?'Very Weak':score<=3?'Weak':score<=4?'Fair':score<=5?'Strong':'Very Strong'
  const color=score<=2?'#ef4444':score<=3?'#f97316':score<=4?'#eab308':score<=5?'#22c55e':'#10b981'
  return {score,label,color,checks}
}
function estimateCrack(pw:string):string{
  const chars=((/[a-z]/.test(pw)?26:0)+(/[A-Z]/.test(pw)?26:0)+(/[0-9]/.test(pw)?10:0)+(/[^a-zA-Z0-9]/.test(pw)?32:0))||26
  const combinations=Math.pow(chars,pw.length)
  const guessesPerSec=1e10
  const seconds=combinations/guessesPerSec
  if(seconds<60)return 'Less than a minute'
  if(seconds<3600)return Math.round(seconds/60)+' minutes'
  if(seconds<86400)return Math.round(seconds/3600)+' hours'
  if(seconds<2592000)return Math.round(seconds/86400)+' days'
  if(seconds<31536000)return Math.round(seconds/2592000)+' months'
  if(seconds<3153600000)return Math.round(seconds/31536000)+' years'
  return 'Centuries'
}
export default function PasswordStrengthCheckerPage() {
  const [pw,setPw]=useState('')
  const [show,setShow]=useState(false)
  const r=pw?checkStrength(pw):null
  const crack=pw?estimateCrack(pw):''
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
            placeholder="Enter password to check..." className="w-full rounded border border-gray-300 px-3 py-2.5 pr-20 text-base"/>
          <button onClick={()=>setShow(s=>!s)} className="absolute right-3 top-8 text-xs text-blue-600">{show?'Hide':'Show'}</button>
        </div>
        {r&&<>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-semibold" style={{color:r.color}}>{r.label}</span>
              <span className="text-xs text-gray-500">{r.score}/7</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{width:(r.score/7*100)+'%',background:r.color}}/>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Time to crack (10B guesses/sec)</p>
            <p className="text-lg font-bold text-gray-800 mt-0.5">{crack}</p>
          </div>
          <div className="space-y-2">
            {r.checks.map(c=>(
              <div key={c.label} className="flex items-center gap-2.5">
                <span className="text-lg">{c.ok?'✅':'❌'}</span>
                <span className={`text-sm ${c.ok?'text-gray-700':'text-gray-400'}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </>}
        {!pw&&<p className="text-center text-gray-400 text-sm py-6">Type a password above to check its strength</p>}
      </div>
    </ToolLayout>
  )
}