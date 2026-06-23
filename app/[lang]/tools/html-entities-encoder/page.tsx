'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('html-entities-encoder')!
const NAMED:Record<string,string>={'\u00A9':'&copy;','\u00AE':'&reg;','\u2122':'&trade;','\u20AC':'&euro;','\u00A3':'&pound;','\u00A5':'&yen;','\u00B0':'&deg;','\u00B1':'&plusmn;','\u00D7':'&times;','\u00F7':'&divide;','\u00B5':'&micro;','\u00B6':'&para;','\u00A7':'&sect;','\u2026':'&hellip;','\u2014':'&mdash;','\u2013':'&ndash;','\u00A0':'&nbsp;','\u2022':'&bull;'}
function encodeHtml(t:string,mode:string):string{
  let s=t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;')\n  if(mode==='named'||mode==='all'){Object.entries(NAMED).forEach(([ch,ent])=>{s=s.split(ch).join(ent)})}\n  if(mode==='all'){s=[...s].map(ch=>{const cp=ch.codePointAt(0)!;return cp>127?'&#'+cp+';':ch}).join('')}
  return s
}
function decodeHtml(t:string):string{
  const d=document.createElement('div');d.innerHTML=t;return d.textContent||''
}
export default function HtmlEntitiesEncoderPage() {
  const [input,setInput]=useState('<p class="example">Hello & World! \u00A9 2024</p>')
  const [mode,setMode]=useState<'encode'|'decode'>('encode')
  const [encMode,setEncMode]=useState<'standard'|'named'|'all'>('standard')
  const [copied,setCopied]=useState(false)
  const output=mode==='encode'?encodeHtml(input,encMode):decodeHtml(input)
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const REF=[['&amp;','&'],['&lt;','<'],['&gt;','>'],['&quot;','"'],['&#x27;',"'"],['&copy;','\u00A9'],['&reg;','\u00AE'],['&euro;','\u20AC'],['&pound;','\u00A3'],['&mdash;','\u2014'],['&ndash;','\u2013'],['&hellip;','\u2026']]
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button onClick={()=>setMode('encode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='encode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>HTML Encode</button>
          <button onClick={()=>setMode('decode')} className={'flex-1 py-2 text-sm font-medium transition '+(mode==='decode'?'bg-blue-600 text-white':'bg-white text-gray-700 hover:bg-gray-50')}>HTML Decode</button>
        </div>
        {mode==='encode'&&(
          <div className="flex gap-2">
            {([['standard','Basic (&<>"/)'],['named','+ Named entities'],['all','+ All non-ASCII']] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setEncMode(id)}
                className={'flex-1 py-1.5 rounded border text-xs font-medium transition '+(encMode===id?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>{label}</button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={8} className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm resize-none" spellCheck={false}/></div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Output</label>
              <button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?'Copied!':'Copy'}</button>
            </div>
            <textarea readOnly value={output} rows={8} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm resize-none"/>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Common HTML entities reference</p>
          <div className="flex flex-wrap gap-2">
            {REF.map(([ent,ch])=>(
              <div key={ent} className="text-center bg-gray-50 rounded px-2 py-1 border border-gray-200">
                <p className="text-base font-mono">{ch}</p>
                <p className="text-xs font-mono text-gray-500">{ent}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}