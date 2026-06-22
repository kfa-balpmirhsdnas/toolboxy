'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('xml-formatter')!
function formatXml(xml:string,indent:number):string{
  try{
    let formatted='',depth=0,inTag=false
    const sp=()=>' '.repeat(depth*indent)
    const tags=xml.match(/<[^>]+>|[^<>]+/g)||[]
    for(let i=0;i<tags.length;i++){
      const tag=tags[i].trim()
      if(!tag)continue
      if(tag.startsWith('<?')||tag.startsWith('<!')){formatted+=sp()+tag+'
'}
      else if(tag.startsWith('</')){depth--;formatted+=sp()+tag+'
'}
      else if(tag.startsWith('<')&&!tag.endsWith('/>')) {
        const isText=tags[i+1]&&!tags[i+1].trim().startsWith('<')&&tags[i+2]&&tags[i+2].trim().startsWith('</')
        if(isText){formatted+=sp()+tag+tags[i+1].trim()+tags[i+2].trim()+'
';i+=2}
        else{formatted+=sp()+tag+'
';depth++}
      }
      else if(tag.startsWith('<')&&tag.endsWith('/>')) {formatted+=sp()+tag+'
'}
      else{formatted+=sp()+tag+'
'}
    }
    return formatted.trim()
  }catch{return xml}
}
const SAMPLE='<?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer Guide</title><genre>Computer</genre><price>44.95</price><publish_date>2000-10-01</publish_date></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><genre>Fantasy</genre><price>5.95</price></book></catalog>'
export default function XmlFormatterPage() {
  const [input,setInput]=useState(SAMPLE)
  const [indent,setIndent]=useState(2)
  const [copied,setCopied]=useState(false)
  const formatted=formatXml(input,indent)
  const copy=()=>{navigator.clipboard.writeText(formatted);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  const highlight=(xml:string)=>xml
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/&lt;(\/?)([\w:-]+)/g,'&lt;$1<span style="color:#60a5fa">$2</span>')
    .replace(/([\w:-]+)=/g,'<span style="color:#f59e0b">$1</span>=')
    .replace(/"([^"]*)"/g,'"<span style="color:#4ade80">$1</span>"')
    .replace(/&lt;\?([^?]+)\?&gt;/g,'<span style="color:#c084fc">&lt;?$1?&gt;</span>')
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-600">Indent:</label>
          {[2,4].map(n=>(
            <button key={n} onClick={()=>setIndent(n)}
              className={'px-3 py-1 rounded border text-sm transition '+(indent===n?'bg-blue-600 text-white border-blue-600':'border-gray-300 hover:bg-gray-50')}>
              {n} spaces
            </button>
          ))}
        </div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Input XML</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"
            placeholder="Paste XML here..."/></div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">Formatted XML</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
          </div>
          <pre className="px-4 py-4 text-sm overflow-x-auto leading-relaxed max-h-80 overflow-y-auto" dangerouslySetInnerHTML={{__html:highlight(formatted)}}/>
        </div>
      </div>
    </ToolLayout>
  )
}