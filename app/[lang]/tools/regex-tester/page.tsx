'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('regex-tester')!
const PRESETS:{name:string;pattern:string;flags:string;desc:string}[]=[
  {name:'Email',pattern:'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',flags:'',desc:'Validate email addresses'},
  {name:'URL',pattern:'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&\\/=]*)',flags:'gi',desc:'Match URLs'},
  {name:'IP Address',pattern:'^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',flags:'',desc:'Validate IPv4 addresses'},
  {name:'Phone',pattern:'^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',flags:'',desc:'Match phone numbers'},
  {name:'Hex Color',pattern:'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',flags:'',desc:'Validate hex color codes'},
  {name:'Date (YYYY-MM-DD)',pattern:'^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',flags:'',desc:'Validate date format'},
]
export default function RegexTesterPage() {
  const [pattern,setPattern]=useState('[a-z]+')
  const [flags,setFlags]=useState('gi')
  const [testStr,setTestStr]=useState('Hello World this is a test string 123')
  const [err,setErr]=useState('')
  let matches:RegExpMatchArray[]=[]
  let highlighted=''
  try{
    const re=new RegExp(pattern,flags)
    setErr('')
    if(pattern){
      const all=[...testStr.matchAll(new RegExp(pattern,'g'+flags.replace('g','')))]
      matches=all
      let idx=0
      highlighted=''
      all.forEach(m=>{
        highlighted+=testStr.slice(idx,m.index).replace(/</g,'&lt;')
        highlighted+=`<mark class="bg-yellow-200 rounded px-0.5">${(m[0]||'').replace(/</g,'&lt;')}</mark>`
        idx=(m.index||0)+m[0].length
      })
      highlighted+=testStr.slice(idx).replace(/</g,'&lt;')
    }
  }catch(e){setErr((e as Error).message);highlighted=testStr.replace(/</g,'&lt;')}
  const ALL_FLAGS=['g','i','m','s','u','y']
  const toggleFlag=(f:string)=>setFlags(fl=>fl.includes(f)?fl.replace(f,''):fl+f)
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p=>(
              <button key={p.name} onClick={()=>{setPattern(p.pattern);setFlags(p.flags)}} title={p.desc}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-xs hover:bg-gray-50">{p.name}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-1">Pattern</label>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <span className="px-2 text-gray-400 bg-gray-50 border-r border-gray-300 py-2">/</span>
              <input value={pattern} onChange={e=>setPattern(e.target.value)} className="flex-1 px-2 py-2 font-mono text-sm outline-none" spellCheck={false}/>
              <span className="px-2 text-gray-400 bg-gray-50 border-l border-gray-300 py-2">/</span>
            </div>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Flags</label>
            <div className="flex gap-1">
              {ALL_FLAGS.map(f=>(
                <button key={f} onClick={()=>toggleFlag(f)}
                  className={`w-8 h-9 rounded border text-xs font-mono font-bold transition ${flags.includes(f)?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50'}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        {err&&<p className="text-red-500 text-sm">{err}</p>}
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Test string</label>
          <textarea value={testStr} onChange={e=>setTestStr(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Matches highlighted ({matches.length} match{matches.length!==1?'es':''})</label>
          <div className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm min-h-12 break-all" dangerouslySetInnerHTML={{__html:highlighted||testStr.replace(/</g,'&lt;')}}/></div>
        {matches.length>0&&(
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Match details</label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {matches.map((m,i)=>(
                <div key={i} className="flex gap-3 text-xs px-3 py-1.5 bg-yellow-50 rounded border border-yellow-200">
                  <span className="text-gray-500">#{i+1}</span>
                  <span className="font-mono font-semibold text-gray-800">"{m[0]}"</span>
                  <span className="text-gray-400">@ index {m.index}</span>
                  {m.length>1&&<span className="text-blue-500">groups: {m.slice(1).join(', ')}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}