'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='email-validator')
  const [input,setInput]=useState('user@example.com')
  const [results,setResults]=useState<{email:string,valid:boolean,reason:string}[]>([])

  function validate(){
    const re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const emails=input.split('\n').map(e=>e.trim()).filter(Boolean)
    setResults(emails.map(email=>{
      if(!re.test(email)) return {email,valid:false,reason:'Invalid format'}
      const [,domain]=email.split('@')
      if(!domain.includes('.')) return {email,valid:false,reason:'Invalid domain'}
      return {email,valid:true,reason:'Valid'}
    }))
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email Addresses (one per line)</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            className="w-full h-36 p-3 border rounded font-mono text-sm resize-y"
            placeholder="user@example.com&#10;another@test.org"/>
        </div>
        <button onClick={validate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Validate
        </button>
        {results.length>0&&(
          <div className="space-y-2">
            {results.map((r,i)=>(
              <div key={i} className={"flex items-center gap-3 p-2 rounded border "+(r.valid?'bg-green-50 border-green-200':'bg-red-50 border-red-200')}>
                <span className="text-lg">{r.valid?'✓':'✗'}</span>
                <span className="font-mono text-sm flex-1">{r.email}</span>
                <span className={"text-xs "+(r.valid?'text-green-600':'text-red-500')}>{r.reason}</span>
              </div>
            ))}
            <p className="text-sm text-gray-500">
              {results.filter(r=>r.valid).length} valid, {results.filter(r=>!r.valid).length} invalid
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
