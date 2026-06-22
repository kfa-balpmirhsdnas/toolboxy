'use client'
import { useState, useMemo } from 'react'

const EXAMPLES=[
  {name:'Email',pattern:'^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$',flags:'',text:'user@example.com\nbad-email\ntest.name+tag@domain.co.uk'},
  {name:'URL',pattern:'https?:\\/\\/[\\w.-]+(?:\\.[a-zA-Z]{2,})+(?:\\/[^\\s]*)?',flags:'g',text:'Visit https://example.com or http://test.org/path?q=1'},
  {name:'Phone (US)',pattern:'\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',flags:'g',text:'Call (555) 123-4567 or 555-987-6543'},
  {name:'IPv4',pattern:'\\b(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b',flags:'g',text:'Server at 192.168.1.1 and 10.0.0.255'},
]

export default function RegexTesterPage() {
  const [pattern,setPattern]=useState('[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}')
  const [flags,setFlags]=useState('g')
  const [text,setText]=useState('alice@example.com\nbob.jones@test.org\nnot-an-email')

  const {matches,error,highlighted}=useMemo(()=>{
    if(!pattern) return{matches:[],error:'',highlighted:text}
    try{
      const re=new RegExp(pattern,flags)
      const allMatches=[...text.matchAll(new RegExp(pattern,'g'+flags.replace('g','')))]
      // Highlight matches in text
      let hl=text
      let offset=0
      const simpleMatches=[...text.matchAll(new RegExp(pattern,'g'))]
      // Collect all match spans for rendering
      const spans:{start:number;end:number;text:string}[]=simpleMatches.map(m=>({start:m.index!,end:m.index!+m[0].length,text:m[0]}))
      return{matches:allMatches.map(m=>({value:m[0],groups:m.slice(1),index:m.index})),error:'',highlighted:'',spans}
    }catch(e){return{matches:[],error:String(e),highlighted:text}}
  },[pattern,flags,text])

  const spans=(matches as any)?.length>=0?
    (()=>{const s:any[]=[...text.matchAll(new RegExp(pattern||'(?!)',flags.includes('g')?flags:flags+'g'))].map(m=>({start:m.index,end:m.index!+m[0].length,text:m[0]}));return s})():
    []

  const parts:JSX.Element[]=[]
  let last=0
  const sp=(!error&&pattern)?[...text.matchAll(new RegExp(pattern,flags.includes('g')?flags:flags+'g'))].map(m=>({start:m.index!,end:m.index!+m[0].length,text:m[0]})):[]
  sp.forEach((s,i)=>{
    if(s.start>last) parts.push(<span key={'t'+i}>{text.slice(last,s.start)}</span>)
    parts.push(<mark key={'m'+i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{s.text}</mark>)
    last=s.end
  })
  if(last<text.length) parts.push(<span key="tail">{text.slice(last)}</span>)

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Regex Tester</h1>
        <p className="text-gray-500 mb-6">Test regular expressions with real-time match highlighting</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {EXAMPLES.map(e=>(
            <button key={e.name} onClick={()=>{setPattern(e.pattern);setFlags(e.flags);setText(e.text)}}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 hover:border-brand-300 rounded-lg">{e.name}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
                <span className="px-2 text-gray-400 font-mono">/</span>
                <input value={pattern} onChange={e=>setPattern(e.target.value)} className="flex-1 py-2 font-mono text-sm focus:outline-none" />
                <span className="px-2 text-gray-400 font-mono">/</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flags</label>
              <input value={flags} onChange={e=>setFlags(e.target.value)} placeholder="gim"
                className="w-16 border border-gray-300 rounded-lg px-2 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          {error&&<p className="text-red-500 text-sm bg-red-50 rounded-lg p-2">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test String</label>
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Match Preview</label>
              <span className="text-sm text-brand-600 font-medium">{sp.length} match{sp.length!==1?'es':''}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm whitespace-pre-wrap break-all">{parts}</div>
          </div>
          {matches.length>0&&(
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matches</label>
              <div className="space-y-1 max-h-48 overflow-auto">
                {matches.map((m:any,i:number)=>(
                  <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 flex justify-between text-sm">
                    <span className="font-mono">{m.value}</span>
                    <span className="text-gray-400 text-xs">index {m.index}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}