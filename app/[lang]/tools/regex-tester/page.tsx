'use client'
import { useState } from 'react'

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testStr, setTestStr] = useState('')
  const [error, setError] = useState('')

  const FLAG_LIST = ['g','i','m','s']
  function toggleFlag(f:string){setFlags(prev=>prev.includes(f)?prev.replace(f,''):prev+f)}

  let matches: RegExpExecArray[] = []
  let highlighted = ''
  if (pattern && testStr && !error) {
    try {
      const re = new RegExp(pattern, flags.includes('g')?flags:flags+'g')
      let m: RegExpExecArray|null
      while((m=re.exec(testStr))!==null){
        matches.push(m)
        if(!flags.includes('g'))break
        if(m.index===re.lastIndex)re.lastIndex++
      }
      // Build highlighted HTML
      const re2 = new RegExp(pattern, flags.includes('g')?flags:flags+'g')
      highlighted = testStr.replace(re2, match =>
        '<mark class="bg-yellow-200 rounded px-0.5">'+match.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</mark>'
      )
      setError('')
    } catch(e:any) { setError(e.message) }
  }

  function validate() {
    if(!pattern){setError('');return}
    try{new RegExp(pattern,flags);setError('')}
    catch(e:any){setError(e.message)}
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Regex Tester</h1>
        <p className="text-gray-500 mb-8">Test and debug regular expressions in real time with match highlighting</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-mono">/</span>
              <input value={pattern} onChange={e=>{setPattern(e.target.value);validate()}}
                placeholder="e.g. [a-z]+@[a-z]+\.(com|org)"
                className={'flex-1 border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 '+(error?'border-red-400 focus:ring-red-400':'border-gray-300 focus:ring-brand-500')} />
              <span className="text-gray-400 font-mono">/</span>
              <span className="font-mono text-brand-600">{flags}</span>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">Flags:</span>
            {FLAG_LIST.map(f=>(
              <button key={f} onClick={()=>toggleFlag(f)}
                className={'px-2.5 py-1 rounded font-mono text-sm transition-colors '+(flags.includes(f)?'bg-brand-500 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                {f}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-2">(g=global, i=case insensitive, m=multiline, s=dotAll)</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test String</label>
            <textarea value={testStr} onChange={e=>setTestStr(e.target.value)} rows={5}
              placeholder="Enter text to test against the pattern..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
        </div>
        {pattern&&testStr&&!error&&(
          <div className="mt-4 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-700">Matches</span>
                <span className={'px-2 py-0.5 rounded-full text-xs font-bold '+(matches.length?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500')}>
                  {matches.length}
                </span>
              </div>
              {highlighted && (
                <div className="font-mono text-sm bg-gray-50 rounded-lg p-3 whitespace-pre-wrap break-all" dangerouslySetInnerHTML={{__html:highlighted.replace(/\n/g,'<br/>')}} />
              )}
            </div>
            {matches.length>0&&(
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h2 className="font-semibold text-gray-700 mb-3">Match Details</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {matches.map((m,i)=>(
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="shrink-0 w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                      <div>
                        <span className="font-mono bg-yellow-50 px-1 rounded">{JSON.stringify(m[0])}</span>
                        <span className="text-gray-400 ml-2">at index {m.index}</span>
                        {m.length>1&&<div className="text-xs text-gray-500 mt-0.5">Groups: {m.slice(1).map((g,gi)=>'$'+(gi+1)+'='+JSON.stringify(g)).join(', ')}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}