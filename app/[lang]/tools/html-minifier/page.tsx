'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('html-minifier')!
function minifyHtml(html:string,opts:{comments:boolean;whitespace:boolean;attrs:boolean}):string{
  let s=html
  if(opts.comments)s=s.replace(/<!--[\s\S]*?-->/g,'')
  if(opts.whitespace){
    s=s.replace(/\s*\n\s*/g,' ')
    s=s.replace(/>\s+</g,'><')
    s=s.replace(/\s{2,}/g,' ')
    s=s.trim()
  }
  if(opts.attrs){
    s=s.replace(/ (class|id|style|data-[\w-]+)="([^"]*)"/g,(m,attr,val)=>val?' '+attr+'="'+val+'"':'')
    s=s.replace(/="([^"]*)"(?=[\s>])/g,(m,v)=>v===''?'':m)
  }
  return s
}
const SAMPLE='<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Meta tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
  </head>
  <body>
    <!-- Main content -->
    <div class="container">
      <h1>Hello World</h1>
      <p>This is a paragraph with some   extra   spaces.</p>
    </div>
  </body>
</html>'
export default function HtmlMinifierPage() {
  const [input,setInput]=useState(SAMPLE)
  const [comments,setComments]=useState(true)
  const [whitespace,setWhitespace]=useState(true)
  const [attrs,setAttrs]=useState(false)
  const [copied,setCopied]=useState(false)
  const minified=minifyHtml(input,{comments,whitespace,attrs})
  const origBytes=new Blob([input]).size
  const minBytes=new Blob([minified]).size
  const savings=origBytes>0?Math.round((1-minBytes/origBytes)*100):0
  const copy=()=>{navigator.clipboard.writeText(minified);setCopied(true);setTimeout(()=>setCopied(false),1500)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {[['Remove comments',comments,setComments],['Collapse whitespace',whitespace,setWhitespace],['Optimize attributes',attrs,setAttrs]].map(([l,v,s])=>(
            <label key={l as string} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" checked={v as boolean} onChange={e=>(s as Function)(e.target.checked)} className="rounded"/>{l as string}
            </label>
          ))}
        </div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Input HTML</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={7}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm resize-none focus:outline-none focus:border-blue-400"
            placeholder="Paste HTML..."/></div>
        <div className="flex gap-3 text-sm">
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-gray-800">{origBytes}</p><p className="text-xs text-gray-500">Original (bytes)</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-green-700">{minBytes}</p><p className="text-xs text-green-600">Minified (bytes)</p>
          </div>
          <div className="flex-1 bg-blue-50 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-blue-700">{savings}%</p><p className="text-xs text-blue-600">Savings</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">Minified output</span>
            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'Copied!':'Copy'}</button>
          </div>
          <pre className="px-4 py-3 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-40">{minified}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}