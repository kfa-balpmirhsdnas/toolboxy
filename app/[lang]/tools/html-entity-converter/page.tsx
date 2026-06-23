'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('html-entity-converter')!
const NAMED:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;',' ':'&nbsp;','©':'&copy;','®':'&reg;','™':'&trade;','€':'&euro;','£':'&pound;','¥':'&yen;','°':'&deg;','±':'&plusmn;','×':'&times;','÷':'&divide;','…':'&hellip;','—':'&mdash;','–':'&ndash;','←':'&larr;','→':'&rarr;','↑':'&uarr;','↓':'&darr;','♠':'&spades;','♥':'&hearts;','♣':'&clubs;','♦':'&diams;'}
const NAMED_REV=Object.fromEntries(Object.entries(NAMED).map(([k,v])=>[v,k]))
function encodeEntities(s:string,mode:'named'|'numeric'|'all'):string{
  if(mode==='named'){return s.split('').map(c=>NAMED[c]||c).join('')}
  if(mode==='numeric'){return s.split('').map(c=>c.charCodeAt(0)>127?'&#'+c.charCodeAt(0)+';':c).join('')}
  return s.split('').map(c=>NAMED[c]||(c.charCodeAt(0)>127?'&#'+c.charCodeAt(0)+';':c)).join('')
}
function decodeEntities(s:string):string{
  return s.replace(/&[a-zA-Z]+;/g,m=>NAMED_REV[m]||m).replace(/&#(d+);/g,(_,n)=>String.fromCharCode(parseInt(n))).replace(/&#x([0-9a-fA-F]+);/g,(_,h)=>String.fromCharCode(parseInt(h,16)))
}
const COMMON=[{label:'<',entity:'&lt;'},{label:'>',entity:'&gt;'},{label:'&',entity:'&amp;'},{label:'"',entity:'&quot;'},{label:'©',entity:'&copy;'},{label:'®',entity:'&reg;'},{label:'™',entity:'&trade;'},{label:'€',entity:'&euro;'},{label:'°',entity:'&deg;'},{label:'…',entity:'&hellip;'},{label:'—',entity:'&mdash;'},{label:'→',entity:'&rarr;'}]
export default function HtmlEntityConverterPage() {
  const [input,setInput]=useState('<h1>Hello "World" & More</h1>\n© 2024 — All rights reserved™
Price: €99.99')\n  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [encMode,setEncMode]=useState<'named'|'numeric'|'all'>('named')
  const [copied,setCopied]=useState(false)
  const result=mode==='encode'?encodeEntities(input,encMode):decodeEntities(input)
  const copy=()=>{navigator.clipboard.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-lg mx-auto px-4 space-y-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            {(['encode','decode'] as const).map(m=>(
              <button key={m} onClick={()=>setMode(m)}
                className={'px-4 py-2 text-sm font-medium capitalize transition '+(mode===m?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50')}>{m}</button>
            ))}
          </div>
          {mode==='encode'&&(
            <div className="flex gap-1">
              {(['named','numeric','all'] as const).map(m=>(
                <button key={m} onClick={()=>setEncMode(m)}
                  className={'px-2.5 py-1.5 rounded-lg border text-xs capitalize font-medium transition '+(encMode===m?'bg-gray-800 text-white border-gray-800':'border-gray-300 text-gray-600 hover:bg-gray-50')}>{m}</button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">{mode==='encode'?'Plain text / HTML':'HTML entities'}</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={7}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"/></div>
          <div><div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">{mode==='encode'?'HTML entities':'Decoded text'}</label>
            <button onClick={copy} className="text-xs text-blue-500 hover:text-blue-700">{copied?'✓ Copied':'Copy'}</button>
          </div>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-xs h-44 overflow-auto whitespace-pre-wrap">{result}</div>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Common HTML entities</p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON.map(({label,entity})=>(
              <button key={entity} onClick={()=>setInput(p=>p+label)}
                className="flex flex-col items-center px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-center">
                <span className="text-sm font-semibold text-gray-800">{label}</span>
                <span className="text-xs font-mono text-gray-400">{entity}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}