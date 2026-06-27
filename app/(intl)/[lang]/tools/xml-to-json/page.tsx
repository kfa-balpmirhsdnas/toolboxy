'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('xml-to-json')!
function xmlToJson(xml:string):unknown{
  const parser=new DOMParser()
  const doc=parser.parseFromString(xml,'text/xml')
  const parseErr=doc.querySelector('parsererror')
  if(parseErr)throw new Error(parseErr.textContent||'Parse error')
  function nodeToObj(node:Element):unknown{
    const obj:Record<string,unknown>={}
    if(node.attributes.length>0){
      const attrs:Record<string,string>={}
      Array.from(node.attributes).forEach(a=>{attrs['@'+a.name]=a.value})
      Object.assign(obj,attrs)
    }
    const children=Array.from(node.childNodes)
    const textNodes=children.filter(c=>c.nodeType===3&&c.textContent?.trim())
    const elemNodes=children.filter(c=>c.nodeType===1) as Element[]
    if(elemNodes.length===0){
      const text=textNodes.map(c=>c.textContent?.trim()).join('')
      if(Object.keys(obj).length===0)return text||null
      if(text)obj['#text']=text
    } else {
      elemNodes.forEach(child=>{
        const key=child.tagName
        const val=nodeToObj(child)
        if(obj[key]!==undefined){
          if(!Array.isArray(obj[key]))obj[key]=[obj[key]]
          ;(obj[key] as unknown[]).push(val)
        } else {obj[key]=val}
      })
    }
    return obj
  }
  const root=doc.documentElement
  return {[root.tagName]:nodeToObj(root)}
}
export default function XmlToJsonPage() {
  const t = useTranslations('toolui')
  const [input,setInput]=useState('<?xml version="1.0"?>\n<catalog>\n  <book id="bk101">\n    <author>Gambardella, Matthew</author>\n    <title>XML Developer Guide</title>\n    <price>44.95</price>\n  </book>\n  <book id="bk102">\n    <author>Ralls, Kim</author>\n    <title>Midnight Rain</title>\n    <price>5.95</price>\n  </book>\n</catalog>')
  const [output,setOutput]=useState('')
  const [err,setErr]=useState('')
  const [copied,setCopied]=useState(false)
  const convert=()=>{
    setErr('')
    try{setOutput(JSON.stringify(xmlToJson(input),null,2))}
    catch(e){setErr((e as Error).message)}
  }
  const copy=()=>{navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('xf_input')}</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={14}
              className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs resize-none" spellCheck={false}/>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">{t('ytj_output')}</label>
              {output&&<button onClick={copy} className="text-xs text-blue-600 hover:underline">{copied?t('ui_copied'):t('ui_copy')}</button>}
            </div>
            <textarea readOnly value={output} rows={14}
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs resize-none"/>
          </div>
        </div>
        {err&&<p className="text-red-500 text-sm bg-red-50 rounded p-2">{err}</p>}
        <button onClick={convert} className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700">{t('xtj_convert')}</button>
      </div>
    </ToolLayout>
  )
}