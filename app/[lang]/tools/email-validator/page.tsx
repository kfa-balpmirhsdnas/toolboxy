'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('email-validator')!
type CheckResult={label:string;pass:boolean;detail:string}
function validateEmail(email:string):CheckResult[]{
  const checks:CheckResult[]=[]
  const hasAt=email.includes('@')
  checks.push({label:'Contains @',pass:hasAt,detail:hasAt?'@ symbol found':'Missing @ symbol'})
  if(!hasAt)return checks
  const [local,domain]=email.split('@')
  checks.push({label:'Local part present',pass:local.length>0,detail:local.length>0?'Local part: '+local:'Empty local part'})
  checks.push({label:'Domain present',pass:!!(domain&&domain.length>0),detail:domain?'Domain: '+domain:'Missing domain'})
  if(!domain)return checks
  const hasDot=domain.includes('.')
  checks.push({label:'Domain has dot',pass:hasDot,detail:hasDot?'Domain TLD found':'No dot in domain'})
  const tld=domain.split('.').pop()||''
  checks.push({label:'TLD length valid',pass:tld.length>=2&&tld.length<=6,detail:tld?'TLD: .'+tld:'No TLD'})
  const localOk=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)\n  checks.push({label:'Local part characters',pass:localOk,detail:localOk?'Valid characters':'Invalid characters in local part'})
  const domainOk=/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/.test(domain)
  checks.push({label:'Domain format',pass:domainOk,detail:domainOk?'Valid domain format':'Invalid domain format'})
  const lenOk=email.length<=254
  checks.push({label:'Total length',pass:lenOk,detail:email.length+' characters (max 254)'})
  const noConsec=!/../.test(email)
  checks.push({label:'No consecutive dots',pass:noConsec,detail:noConsec?'OK':'Consecutive dots found'})
  return checks
}
const SAMPLES=['user@example.com','invalid@','@nodomain.com','user@domain','user..name@example.com','user@sub.domain.co.uk','very.unusual."@".unusual.com@example.com','test+tag@gmail.com']
export default function EmailValidatorPage() {
  const [emails,setEmails]=useState('user@example.com
invalid@
test+tag@gmail.com')
  const [single,setSingle]=useState('user@example.com')
  const [mode,setMode]=useState<'single'|'bulk'>('single')
  const checks=validateEmail(single)
  const passed=checks.filter(c=>c.pass).length
  const isValid=passed===checks.length
  const bulkResults=emails.split('
').filter(Boolean).map(e=>({email:e.trim(),valid:validateEmail(e.trim()).every(c=>c.pass)}))
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('single')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='single'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Single</button>
          <button onClick={()=>setMode('bulk')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='bulk'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>Bulk</button>
        </div>
        {mode==='single'?(
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input value={single} onChange={e=>setSingle(e.target.value)} type="email" className="w-full rounded border border-gray-300 px-3 py-2.5 text-lg font-mono" placeholder="user@example.com"/>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLES.slice(0,5).map(s=>(
                <button key={s} onClick={()=>setSingle(s)} className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 font-mono">{s.length>20?s.slice(0,20)+'...':s}</button>
              ))}
            </div>
            <div className={'text-center p-4 rounded-xl '+(isValid?'bg-green-50 border-2 border-green-300':'bg-red-50 border-2 border-red-200')}>
              <p className="text-2xl font-bold" style={{color:isValid?'#16a34a':'#dc2626'}}>{isValid?'VALID':'INVALID'}</p>
              <p className="text-sm mt-0.5" style={{color:isValid?'#15803d':'#b91c1c'}}>{passed}/{checks.length} checks passed</p>
            </div>
            <div className="space-y-1.5">
              {checks.map((c,i)=>(
                <div key={i} className={'flex items-start gap-2 text-sm rounded-lg px-3 py-2 '+(c.pass?'bg-green-50':'bg-red-50')}>
                  <span className="flex-shrink-0 mt-0.5" style={{color:c.pass?'#16a34a':'#dc2626'}}>{c.pass?'✓':'✗'}</span>
                  <div><span className="font-medium">{c.label}</span><span className="text-xs ml-2 opacity-70">{c.detail}</span></div>
                </div>
              ))}
            </div>
          </div>
        ):(
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email addresses (one per line)</label>
              <textarea value={emails} onChange={e=>setEmails(e.target.value)} rows={8} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" placeholder="user@example.com
another@email.com"/></div>
            <div className="space-y-1.5">
              {bulkResults.map((r,i)=>(
                <div key={i} className={'flex items-center gap-2 rounded-lg px-3 py-2 text-sm '+(r.valid?'bg-green-50':'bg-red-50')}>
                  <span className="flex-shrink-0" style={{color:r.valid?'#16a34a':'#dc2626'}}>{r.valid?'✓':'✗'}</span>
                  <code className="flex-1 font-mono text-xs">{r.email}</code>
                  <span className={'text-xs font-medium '+(r.valid?'text-green-700':'text-red-700')}>{r.valid?'Valid':'Invalid'}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">{bulkResults.filter(r=>r.valid).length}/{bulkResults.length} valid</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}