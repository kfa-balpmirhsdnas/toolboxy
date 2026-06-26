'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('password-strength-checker')!
function checkStrength(pw:string){
  const checks=[
    {k:'len8',ok:pw.length>=8},
    {k:'len12',ok:pw.length>=12},
    {k:'upper',ok:/[A-Z]/.test(pw)},
    {k:'lower',ok:/[a-z]/.test(pw)},
    {k:'num',ok:/[0-9]/.test(pw)},
    {k:'special',ok:/[^a-zA-Z0-9]/.test(pw)},
    {k:'nocommon',ok:!/^(password|123456|qwerty|abc123)/i.test(pw)},
  ]
  const score=checks.filter(c=>c.ok).length
  const lk=score<=2?'vweak':score<=3?'weak':score<=4?'fair':score<=5?'strong':'vstrong'
  const color=score<=2?'#ef4444':score<=3?'#f97316':score<=4?'#eab308':score<=5?'#22c55e':'#10b981'
  return {score,lk,color,checks}
}
function estimateCrack(pw:string):{k:string;n?:number}{
  const chars=((/[a-z]/.test(pw)?26:0)+(/[A-Z]/.test(pw)?26:0)+(/[0-9]/.test(pw)?10:0)+(/[^a-zA-Z0-9]/.test(pw)?32:0))||26
  const seconds=Math.pow(chars,pw.length)/1e10
  if(seconds<60)return {k:'crack_lt_min'}
  if(seconds<3600)return {k:'crack_min',n:Math.round(seconds/60)}
  if(seconds<86400)return {k:'crack_hours',n:Math.round(seconds/3600)}
  if(seconds<2592000)return {k:'crack_days',n:Math.round(seconds/86400)}
  if(seconds<31536000)return {k:'crack_months',n:Math.round(seconds/2592000)}
  if(seconds<3153600000)return {k:'crack_years',n:Math.round(seconds/31536000)}
  return {k:'crack_cent'}
}
export default function PasswordStrengthCheckerPage() {
  const t = useTranslations('toolui')
  const [pw,setPw]=useState('')
  const [show,setShow]=useState(false)
  const r=pw?checkStrength(pw):null
  const crack=pw?estimateCrack(pw):null
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto px-4 space-y-5">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('ps_password')}</label>
          <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
            placeholder={t('ps_ph')} className="w-full rounded border border-gray-300 px-3 py-2.5 pr-20 text-base"/>
          <button onClick={()=>setShow(s=>!s)} className="absolute right-3 top-8 text-xs text-blue-600">{show?t('ps_hide'):t('ps_show')}</button>
        </div>
        {r&&crack&&<>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-semibold" style={{color:r.color}}>{t('ps_'+r.lk)}</span>
              <span className="text-xs text-gray-500">{r.score}/7</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{width:(r.score/7*100)+'%',background:r.color}}/>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">{t('ps_crack_label')}</p>
            <p className="text-lg font-bold text-gray-800 mt-0.5">{crack.n!=null?crack.n+t('ps_'+crack.k):t('ps_'+crack.k)}</p>
          </div>
          <div className="space-y-2">
            {r.checks.map(c=>(
              <div key={c.k} className="flex items-center gap-2.5">
                <span className="text-lg">{c.ok?'✅':'❌'}</span>
                <span className={`text-sm ${c.ok?'text-gray-700':'text-gray-400'}`}>{t('ps_chk_'+c.k)}</span>
              </div>
            ))}
          </div>
        </>}
        {!pw&&<p className="text-center text-gray-400 text-sm py-6">{t('ps_empty')}</p>}
      </div>
    </ToolLayout>
  )
}